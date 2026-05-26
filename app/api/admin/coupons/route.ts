import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET() {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    include: {
      batch: { select: { id: true, name: true } },
      _count: { select: { payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, discount, maxUses, batchId, expiresAt, description } = await req.json();

  if (!code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (!discount || discount < 1 || discount > 100)
    return NextResponse.json({ error: "Discount must be between 1 and 100%" }, { status: 400 });

  const existing = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (existing) return NextResponse.json({ error: "This coupon code already exists" }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: {
      code: code.trim().toUpperCase(),
      discount: Number(discount),
      maxUses: Number(maxUses) || 100,
      batchId: batchId || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description: description?.trim() || null,
      isActive: true,
      used: 0,
    },
    include: { batch: { select: { id: true, name: true } } },
  });

  return NextResponse.json(coupon, { status: 201 });
}