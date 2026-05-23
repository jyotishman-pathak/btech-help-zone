import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";


export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      features: { orderBy: { order: "asc" } },
      tests: { include: { test: { select: { id: true, title: true, totalMarks: true, duration: true } } } },
      notes: { include: { note: { select: { id: true, title: true, type: true } } } },
      leadForm: { include: { fields: { orderBy: { order: "asc" } } } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(batch);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Handle features update separately
  const { features, ...batchData } = body;

  const batch = await prisma.$transaction(async (tx) => {
    if (features !== undefined) {
      await tx.batchFeature.deleteMany({ where: { batchId: id } });
      await tx.batchFeature.createMany({
        data: features.map((text: string, order: number) => ({ text, order, batchId: id })),
      });
    }
    return tx.batch.update({ where: { id }, data: batchData });
  });

  return NextResponse.json(batch);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get all affected users before cancelling
  const affectedEnrollments = await prisma.enrollment.findMany({
    where: { batchId: id, status: "ACTIVE" },
    select: { userId: true },
  });

  await prisma.$transaction([
    // Soft delete the batch
    prisma.batch.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false, isPublished: false },
    }),
    // Cancel ALL enrollments for this batch
    prisma.enrollment.updateMany({
      where: { batchId: id },
      data: { status: "CANCELLED" },
    }),
    // Notify every enrolled student
    prisma.notification.createMany({
      data: affectedEnrollments.map((e) => ({
        userId: e.userId,
        title: "Batch Removed",
        body: `"${batch.name}" has been removed by admin. Your access has been revoked.`,
        type: "WARNING",
        link: "/my-batches",
      })),
      skipDuplicates: true,
    }),
  ]);

  return NextResponse.json({ success: true });
}