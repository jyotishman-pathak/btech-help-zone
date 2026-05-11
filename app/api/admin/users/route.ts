import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier"); // NORMAL | PREMIUM | SUPER_PREMIUM | null
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where = {
    role: "STUDENT" as const,
    ...(tier ? { tier: tier as any } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        mockTestAttempts: { where: { status: "SUBMITTED" }, select: { score: true } },
        subscription: { select: { tier: true, status: true, expiresAt: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const mapped = users.map((u) => {
    const attempts = u.mockTestAttempts;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      tier: u.tier,
      role: u.role,
      suspended: u.suspended,
      createdAt: u.createdAt.toISOString(),
      mocksTaken: attempts.length,
      avgScore: attempts.length
        ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
        : 0,
      subscription: u.subscription,
    };
  });

  return NextResponse.json({ users: mapped, total, pages: Math.ceil(total / limit) });
}