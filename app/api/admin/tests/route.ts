// app/api/admin/tests/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

type Session = {
  user?: {
    role?: string;
    id?: string;
  };
};

function isAdmin(session: Session | null) {
  return (
    session?.user?.role &&
    ["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
  );
}

export async function GET() {
  const session = (await auth()) as Session | null;

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tests = await prisma.mockTest.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { questions: true, attempts: true } },
      subject: true,
      batchTests: {
        include: {
          batch: { select: { id: true, name: true } },
        },
      },
      folder: { select: { id: true, name: true } },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const session = (await auth()) as Session | null;

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    description,
    subjectId,
    examType,
    duration,
    requiredTier,
    questions,
    batchIds = [],
    folderId,
  } = body;

  if (!questions?.length) {
    return NextResponse.json(
      { error: "At least one question required" },
      { status: 400 }
    );
  }

  const accessCode = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  const totalMarks = questions.reduce(
    (s: number, q: any) => s + (q.marks ?? 4),
    0
  );

  // ⚡ IMPORTANT: transaction only for atomic DB ops (no heavy logic inside)
  const newTest = await prisma.mockTest.create({
    data: {
      title,
      description,
      subjectId: subjectId || null,
      folderId: folderId || null,
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
          optionImages: q.optionImages ?? [],
          correctIndex: q.correctIndex,
          marks: q.marks ?? 4,
          negativeMarks: q.negativeMarks ?? 1,
          section: q.section ?? "General",
          explanation: q.explanation ?? null,
          explanationImageUrl: q.explanationImageUrl ?? null,
          order: i,
        })),
      },
    },
    include: { questions: true },
  });

  // separate step = avoids transaction timeout (P2028 fix)
  if (batchIds.length > 0) {
    await prisma.batchTest.createMany({
      data: batchIds.map((batchId: string, index: number) => ({
        batchId,
        testId: newTest.id,
        order: index,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(newTest, { status: 201 });
}