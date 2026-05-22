import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempts = await prisma.mockTestAttempt.findMany({
    where: { userId: session.user.id as string, status: "SUBMITTED" },
    include: { test: { select: { id: true, title: true, totalMarks: true, duration: true } } },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    attempts.map((a) => ({
      id: a.id,
      testId: a.testId,
      testTitle: a.test.title,
      testTotalMarks: a.test.totalMarks,
      score: a.score,
      percentage: Math.round(a.percentage),
      completedAt: a.completedAt,
      markedCount: a.markedForReview?.length ?? 0,
    }))
  );
}
