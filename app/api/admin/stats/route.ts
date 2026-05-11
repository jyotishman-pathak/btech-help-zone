import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";




export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    usersThisMonth,
    usersLastMonth,
    activeToday,
    mocksTotal,
    mocksThisMonth,
    mocksLastMonth,
    revenueAll,
    revenueThisMonth,
    revenueLastMonth,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "STUDENT", createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: "STUDENT", createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    // "Active today" = users who started a test attempt today
    prisma.mockTestAttempt.count({ where: { startedAt: { gte: startOfToday } } }),
    prisma.mockTestAttempt.count({ where: { status: "SUBMITTED" } }),
    prisma.mockTestAttempt.count({ where: { status: "SUBMITTED", completedAt: { gte: startOfMonth } } }),
    prisma.mockTestAttempt.count({ where: { status: "SUBMITTED", completedAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.subscription.aggregate({ where: { status: { in: ["ACTIVE", "CANCELLED", "EXPIRED"] } }, _sum: { amount: true } }),
    prisma.subscription.aggregate({ where: { status: { in: ["ACTIVE", "CANCELLED", "EXPIRED"] }, startsAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.subscription.aggregate({ where: { status: { in: ["ACTIVE", "CANCELLED", "EXPIRED"] }, startsAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
    // Recent activity feed (last 20 events derived from multiple tables)
    Promise.all([
      prisma.mockTestAttempt.findMany({
        where: { status: "SUBMITTED" },
        include: { user: { select: { name: true } }, test: { select: { title: true } } },
        orderBy: { completedAt: "desc" },
        take: 7,
      }),
      prisma.subscription.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]),
  ]);

  const pct = (curr: number, prev: number) =>
    prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);

  // Build unified activity feed
  const [attempts, subs, newUsers] = recentActivity;
  const feed = [
    ...attempts.map((a) => ({
      user: a.user.name ?? "Unknown",
      action: `Completed "${a.test.title}" — scored ${a.score}`,
      time: a.completedAt ?? a.startedAt,
      type: "success" as const,
    })),
    ...subs.map((s) => ({
      user: s.user.name ?? "Unknown",
      action: `Upgraded to ${s.tier}`,
      time: s.createdAt,
      type: "upgrade" as const,
    })),
    ...newUsers.map((u) => ({
      user: u.name ?? "Unknown",
      action: "Joined the platform",
      time: u.createdAt,
      type: "join" as const,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10)
    .map((item) => ({
      ...item,
      time: relativeDate(new Date(item.time)),
    }));

  return NextResponse.json({
    totalUsers,
    usersThisMonth,
    activeToday,
    mocksTotal,
    mocksThisMonth,
    revenueTotal: revenueAll._sum.amount ?? 0,
    revenueThisMonth: revenueThisMonth._sum.amount ?? 0,
    trends: {
      users: pct(usersThisMonth, usersLastMonth),
      mocks: pct(mocksThisMonth, mocksLastMonth),
      revenue: pct(revenueThisMonth._sum.amount ?? 0, revenueLastMonth._sum.amount ?? 0),
    },
    feed,
  });
}

function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}