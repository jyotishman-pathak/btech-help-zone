// app/api/admin/tests/[id]/route.ts

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
  const test = await prisma.mockTest.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      subject: true,
      batchTests: { include: { batch: { select: { id: true, name: true, type: true } } } },
    },
  });
  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(test);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, description, duration, examType, isActive, subjectId, batchIds } = await req.json();

  const test = await prisma.$transaction(async (tx) => {
    const updated = await tx.mockTest.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration }),
        ...(examType !== undefined && { examType }),
        ...(isActive !== undefined && { isActive }),
        ...(subjectId !== undefined && { subjectId: subjectId || null }),
      },
    });

    // Sync batch assignments if provided
    if (batchIds !== undefined) {
      await tx.batchTest.deleteMany({ where: { testId: id } });
      if (batchIds.length > 0) {
        await tx.batchTest.createMany({
          data: batchIds.map((batchId: string, order: number) => ({ batchId, testId: id, order })),
          skipDuplicates: true,
        });
      }
    }

    return updated;
  });

  return NextResponse.json(test);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.mockTest.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  return NextResponse.json({ success: true });
}