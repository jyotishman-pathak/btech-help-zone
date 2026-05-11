import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [users, subscriptions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscription.findMany({
      where: { startsAt: { gte: sixMonthsAgo } },
      select: { amount: true, startsAt: true },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  // Group signups by day
  const signupMap: Record<string, number> = {};
  users.forEach((u) => {
    const key = u.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    signupMap[key] = (signupMap[key] ?? 0) + 1;
  });

  // Fill in last 14 days even if zero
  const signups = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    return { date: key, users: signupMap[key] ?? 0 };
  });

  // Group revenue by month
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueMap: Record<string, number> = {};
  subscriptions.forEach((s) => {
    const key = MONTHS[s.startsAt.getMonth()];
    revenueMap[key] = (revenueMap[key] ?? 0) + s.amount;
  });

  const revenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = MONTHS[d.getMonth()];
    return { month: key, amount: revenueMap[key] ?? 0 };
  });

  return NextResponse.json({ signups, revenue });
}