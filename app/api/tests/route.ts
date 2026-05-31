// app/api/tests/route.ts

import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma.client";

type MockTest = {
  id: string;
  requiredTier: string;
  [key: string]: any;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const role = (session.user as any).role;
  const isAdminOrSuper = role && ["ADMIN", "SUPER_ADMIN"].includes(role);

  const [tests, enrollments, attempts] = await Promise.all([
    prisma.mockTest.findMany({
      where: { isActive: true, deletedAt: null },
      include: {
        subject: { select: { id: true, name: true } },
        batchTests: { select: { batchId: true } },
      },
    }),
    prisma.enrollment.findMany({
      where: {
        userId,
        status: "ACTIVE",
        batch: {
          deletedAt: null,
          isFree: false,
        },
      },
      select: { batchId: true },
    }),
    prisma.mockTestAttempt.findMany({
      where: { userId },
      select: { testId: true, status: true, score: true, percentage: true },
    }),
  ]);

  const activeBatchIds = enrollments.map((e) => e.batchId);

  const enriched = tests.map((test) => {
    const isEnrolled = test.batchTests.some((bt) =>
      activeBatchIds.includes(bt.batchId)
    );
    const attempt = attempts.find((a) => a.testId === test.id);
    const locked = !isAdminOrSuper && !isEnrolled;

    return {
      ...test,
      locked,
      canAttempt: !locked,
      attempt: attempt
        ? { status: attempt.status, score: attempt.score, percentage: attempt.percentage }
        : null,
    };
  });

  return NextResponse.json({
    tests: enriched,
    freeTestUsed: true,
  });
}