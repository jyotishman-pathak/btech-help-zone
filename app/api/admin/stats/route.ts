import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

type AttemptItem = {
  user: { name: string | null };
  test: { title: string };
  score: number;
  completedAt: Date | null;
  startedAt: Date | null;
};

type SubItem = {
  user: { name: string | null };
  tier: string;
  createdAt: Date;
};

type NewUserItem = {
  name: string | null;
  createdAt: Date;
};

type FeedItem = {
  user: string;
  action: string;
  time: string;
  type: "success" | "upgrade" | "join";
};

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
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
    prisma.mockTestAttempt.count({ where: { startedAt: { gte: startOfToday } } }),
    prisma.mockTestAttempt.count({ where: { status: "SUBMITTED" } }),
    prisma.mockTestAttempt.count({ where: { status: "SUBMITTED", completedAt: { gte: startOfMonth } } }),
    prisma.mockTestAttempt.count({ where: { status: "SUBMITTED", completedAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.subscription.aggregate({ where: { status: { in: ["ACTIVE", "CANCELLED", "EXPIRED"] } }, _sum: { amount: true } }),
    prisma.subscription.aggregate({ where: { status: { in: ["ACTIVE", "CANCELLED", "EXPIRED"] }, startsAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.subscription.aggregate({ where: { status: { in: ["ACTIVE", "CANCELLED", "EXPIRED"] }, startsAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
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

  const [attempts, subs, newUsers] = recentActivity as [AttemptItem[], SubItem[], NewUserItem[]];

  const rawFeed = [
    ...attempts.map((a: AttemptItem) => ({
      user: a.user.name ?? "Unknown",
      action: `Completed "${a.test.title}" — scored ${a.score}`,
      time: (a.completedAt ?? a.startedAt) || new Date(),
      type: "success" as const,
    })),
    ...subs.map((s: SubItem) => ({
      user: s.user.name ?? "Unknown",
      action: `Upgraded to ${s.tier}`,
      time: s.createdAt,
      type: "upgrade" as const,
    })),
    ...newUsers.map((u: NewUserItem) => ({
      user: u.name ?? "Unknown",
      action: "Joined the platform",
      time: u.createdAt,
      type: "join" as const,
    })),
  ];

  const feed: FeedItem[] = rawFeed
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10)
    .map((item) => ({
      ...item,
      time: relativeDate(item.time),
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