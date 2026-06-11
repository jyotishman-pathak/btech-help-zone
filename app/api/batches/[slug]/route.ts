import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const { slug } = await params;

  const batch = await prisma.batch.findUnique({
    where: { slug, isActive: true, isPublished: true, deletedAt: null },
    include: {
      features: { orderBy: { order: "asc" } },
      tests: {
        include: { test: { select: { id: true, title: true, duration: true, totalMarks: true, examType: true, folderId: true, folder: { select: { id: true, name: true, order: true } } } } },
        orderBy: { order: "asc" },
      },
      notes: {
        include: { note: { select: { id: true, title: true, type: true, downloads: true } } },
        orderBy: { order: "asc" },
      },
      leadForm: { include: { fields: { orderBy: { order: "asc" } } } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_batchId: { userId, batchId: batch.id }, status: "ACTIVE" },
    });
    isEnrolled = !!enrollment;
  }

  return NextResponse.json({ ...batch, isEnrolled });
}