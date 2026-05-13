// app/api/admin/tests/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id as string;
  const role = (session.user as any).role;

  // Admins always have access
  if (["ADMIN", "SUPER_ADMIN"].includes(role)) {
    const test = await prisma.mockTest.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const safeQuestions = test.questions.map(({ correctIndex: _ci, ...q }) => q);
    return NextResponse.json({ ...test, questions: safeQuestions });
  }

  const [test, batchAccess, submittedCount] = await Promise.all([
    prisma.mockTest.findUnique({
      where: { id, isActive: true },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    // Check if user is enrolled in any batch that contains this test
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
    // Legacy tier-based count (keep for backward compat)
    prisma.mockTestAttempt.count({ where: { userId, status: "SUBMITTED" } }),
  ]);

  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Access granted if: enrolled in a batch that has this test
  if (batchAccess) {
    const safeQuestions = test.questions.map(({ correctIndex: _ci, ...q }) => q);
    return NextResponse.json({ ...test, questions: safeQuestions });
  }

  // Legacy: free tier (STUDENT role) gets 1 test
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "STUDENT") {
    const alreadyAttemptedThis = await prisma.mockTestAttempt.findFirst({
      where: { userId, testId: id },
    });
    if (!alreadyAttemptedThis && submittedCount >= 1)
      return NextResponse.json({ error: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  const safeQuestions = test.questions.map(({ correctIndex: _ci, ...q }) => q);
  return NextResponse.json({ ...test, questions: safeQuestions });
}