import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma.client";
import { auth } from "../../../../auth";


export async function GET(req: NextRequest) {
  const session = await auth();
  if (!["ADMIN","SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const entity = searchParams.get("entity");
  const limit = 30;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: entity ? { entity } : {},
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(
  entity
    ? {
        where: { entity },
      }
    : undefined
)
  ]);

  return NextResponse.json({ logs, total, pages: Math.ceil(total / limit) });
}