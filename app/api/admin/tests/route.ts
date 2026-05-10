import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tests = await prisma.mockTest.findMany({
    include: { _count: { select: { questions: true, attempts: true } }, subject: true },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, subjectId, examType, duration, requiredTier, questions } = body;

  if (!questions?.length)
    return NextResponse.json({ error: "At least one question required" }, { status: 400 });

  const accessCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const totalMarks = questions.reduce((s: number, q: any) => s + (q.marks ?? 4), 0);

  const test = await prisma.mockTest.create({
    data: {
      title,
      description,
      subjectId: subjectId || null,
      examType: examType ?? "FULL_MOCK",
      duration: duration ?? 180,
      accessCode,
      totalMarks,
      isActive: true,
      requiredTier: requiredTier ?? "NORMAL",
      questions: {
        create: questions.map((q: any, i: number) => ({
          text: q.text,
          textAs: q.textAs ?? null,
          imageUrl: q.imageUrl ?? null,
          options: q.options,
          optionsAs: q.optionsAs ?? [],
          correctIndex: q.correctIndex,
          marks: q.marks ?? 4,
          negativeMarks: q.negativeMarks ?? 1,
          section: q.section ?? "General",
          order: i,
        })),
      },
    },
    include: { questions: true },
  });

  return NextResponse.json(test, { status: 201 });
}