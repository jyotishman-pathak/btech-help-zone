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

  const [test, batchAccess] = await Promise.all([
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
          isFree: false,
          tests: { some: { testId: id } },
        },
      },
    }),
  ]);

  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip correct answers before sending to client
  const safeQuestions = test.questions.map(({ correctIndex: _ci, ...q }) => q);
  const safeTest = { ...test, questions: safeQuestions };

  // Enrolled in a paid batch containing this test → full access
  if (batchAccess) return NextResponse.json(safeTest);

  return NextResponse.json({ error: "UPGRADE_REQUIRED" }, { status: 403 });
}