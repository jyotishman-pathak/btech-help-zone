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

  const [rawTests, user, attemptCount] = await Promise.all([
    prisma.mockTest.findMany({
      where: { isActive: true },
      include: { _count: { select: { questions: true } }, subject: true },
      orderBy: { id: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    }),
    prisma.mockTestAttempt.count({
      where: { userId, status: "SUBMITTED" },
    }),
  ]);

  const tests = rawTests as unknown as MockTest[];
  const freeTestUsed = user?.tier === "NORMAL" && attemptCount > 0;

  const enriched = tests.map((t: MockTest, idx: number) => ({
    ...t,
    locked:
      user?.tier === "NORMAL" && t.requiredTier !== "NORMAL"
        ? true
        : user?.tier === "NORMAL" && freeTestUsed && idx > 0,
    canAttempt: user?.tier !== "NORMAL" || !freeTestUsed,
  }));

  return NextResponse.json({ tests: enriched, userTier: user?.tier, freeTestUsed });
}