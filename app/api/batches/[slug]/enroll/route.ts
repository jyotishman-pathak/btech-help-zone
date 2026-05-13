import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { slug } = await params;
  const { leadData } = await req.json();

  const batch = await prisma.batch.findUnique({
    where: { slug, isActive: true, deletedAt: null },
  });

  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  if (!batch.isFree) return NextResponse.json({ error: "Paid batch — use payment flow" }, { status: 400 });

  const existing = await prisma.enrollment.findUnique({
    where: { userId_batchId: { userId, batchId: batch.id } },
  });
  if (existing) return NextResponse.json(existing);

  const [enrollment] = await prisma.$transaction([
    prisma.enrollment.create({
      data: {
        userId,
        batchId: batch.id,
        status: "ACTIVE",
        source: "lead_form",
        expiresAt: batch.validDays
          ? new Date(Date.now() + batch.validDays * 86400000)
          : null,
      },
    }),
    prisma.leadSubmission.create({
      data: { batchId: batch.id, userId, data: leadData ?? {} },
    }),
    prisma.notification.create({
      data: {
        userId,
        title: `Welcome to ${batch.name}!`,
        body: `You've been enrolled in ${batch.name}. Start learning now.`,
        type: "SUCCESS",
        link: `/batches/${slug}`,
      },
    }),
  ]);

  return NextResponse.json(enrollment, { status: 201 });
}