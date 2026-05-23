// app/api/tests/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = (session.user as any).role;

  // Admins get full access including correctIndex
  if (["ADMIN", "SUPER_ADMIN"].includes(role)) {
    const test = await prisma.mockTest.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(test);
  }

  const [test, batchAccess, submittedCount] = await Promise.all([
    prisma.mockTest.findFirst({
      where: { id, isActive: true, deletedAt: null },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    prisma.enrollment.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        batch: {
          deletedAt: null,
          tests: { some: { testId: id } },
        },
      },
    }),
    prisma.mockTestAttempt.count({ where: { userId, status: "SUBMITTED" } }),
  ]);

  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip correct answers before sending to client
  const safeQuestions = test.questions.map(({ correctIndex: _ci, ...q }) => q);
  const safeTest = { ...test, questions: safeQuestions };

  // Enrolled in a batch containing this test → full access
  if (batchAccess) return NextResponse.json(safeTest);

  // Legacy free tier: 1 free attempt total
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "STUDENT") {
    const alreadyAttemptedThis = await prisma.mockTestAttempt.findFirst({
      where: { userId, testId: id },
    });
    if (!alreadyAttemptedThis && submittedCount >= 1)
      return NextResponse.json({ error: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  return NextResponse.json(safeTest);
}