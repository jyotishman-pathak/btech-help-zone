import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tests = await prisma.mockTest.findMany({
    include: { _count: { select: { questions: true, attempts: true } } },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(tests.map((t: (typeof tests)[number]) => ({
    id: t.id,
    accessCode: t.accessCode,
    title: t.title,
    isActive: t.isActive,
    requiredTier: t.requiredTier,
    duration: t.duration,
    totalMarks: t.totalMarks,
    questionsCount: t._count.questions,
    attemptsCount: t._count.attempts,
  })));
}