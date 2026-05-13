import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET() {
  const session = await auth();
  if (!["ADMIN","SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    include: { batch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!["ADMIN","SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, discount, maxUses, expiresAt, batchId, description } = await req.json();

  if (!code || discount === undefined)
    return NextResponse.json({ error: "code and discount required" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discount: parseInt(discount),
      maxUses: maxUses ?? 100,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      batchId: batchId || null,
      description: description || null,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}