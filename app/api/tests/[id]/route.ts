import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  const { id } = await params;                       // ← await
  const session = await auth();

  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const [test, user, submittedCount] = await Promise.all([
    prisma.mockTest.findUnique({
      where: { id },                                 // ← clean id
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }),
    prisma.mockTestAttempt.count({ where: { userId, status: "SUBMITTED" } }),
  ]);

  if (!test || !test.isActive)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user?.tier === "NORMAL") {
    const alreadyAttemptedThis = await prisma.mockTestAttempt.findFirst({
      where: { userId, testId: id },
    });
    if (!alreadyAttemptedThis && submittedCount >= 1)
      return NextResponse.json({ error: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  const safeQuestions = test.questions.map(({ correctIndex: _ci, ...q }) => q);
  return NextResponse.json({ ...test, questions: safeQuestions });
}