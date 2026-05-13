import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma.client";


export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const batches = await prisma.batch.findMany({
    where: {
      isActive: true,
      isPublished: true,
      deletedAt: null,
      ...(type && type !== "ALL" ? { type: type as any } : {}),
    },
    include: {
      features: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  // Check enrollment status for logged-in users
  let enrolledBatchIds = new Set<string>();
  if (userId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { batchId: true },
    });
    enrolledBatchIds = new Set(enrollments.map((e) => e.batchId));
  }

  return NextResponse.json(
    batches.map((b) => ({
      ...b,
      isEnrolled: enrolledBatchIds.has(b.id),
    }))
  );
}