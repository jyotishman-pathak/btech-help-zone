import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";

type Question = {
  id: string;
  marks: number;
  negativeMarks: number;
  correctIndex: number;
  [key: string]: any;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const existing = await prisma.mockTestAttempt.findFirst({
    where: { userId, testId: id, status: "IN_PROGRESS" },
  });
  if (existing) return NextResponse.json(existing);

  const attempt = await prisma.mockTestAttempt.create({
    data: { userId, testId: id },
  });
  return NextResponse.json(attempt, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { attemptId, answers } = await req.json();

  const attempt = await prisma.mockTestAttempt.findFirst({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
  });
  if (!attempt)
    return NextResponse.json({ error: "No active attempt" }, { status: 404 });

  await prisma.mockTestAttempt.update({
    where: { id: attemptId },
    data: { answers: answers as any },
  });
  return NextResponse.json({ saved: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { attemptId, answers } = await req.json();

  const [attempt, rawQuestions] = await Promise.all([
    prisma.mockTestAttempt.findFirst({
      where: { id: attemptId, userId, status: "IN_PROGRESS" },
    }),
    prisma.mockTestQuestion.findMany({ where: { testId: id } }),
  ]);

  if (!attempt)
    return NextResponse.json({ error: "No active attempt" }, { status: 404 });

  const questions = rawQuestions as unknown as Question[];

  let score = 0, correct = 0, wrong = 0;
  const totalMarks = questions.reduce((s: number, q: Question) => s + q.marks, 0);
  const answersMap = answers as Record<string, number>;

  questions.forEach((q: Question) => {
    const selected = answersMap[q.id];
    if (selected === undefined || selected === null) return;
    if (selected === q.correctIndex) { score += q.marks; correct++; }
    else { score -= q.negativeMarks; wrong++; }
  });

  score = Math.max(0, score);

  const updated = await prisma.mockTestAttempt.update({
    where: { id: attemptId },
    data: {
      answers: answers as any,
      score,
      percentage: totalMarks > 0 ? (score / totalMarks) * 100 : 0,
      status: "SUBMITTED",
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    ...updated,
    correct,
    wrong,
    unattempted: questions.length - correct - wrong,
    totalMarks,
  });
}