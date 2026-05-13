import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, batchId } = await req.json();

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.toUpperCase(),
      isActive: true,
      OR: [{ batchId: null }, { batchId }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
    },
  });

  if (!coupon || coupon.used >= coupon.maxUses)
    return NextResponse.json({ valid: false, error: "Invalid or expired coupon" });

  return NextResponse.json({ valid: true, discount: coupon.discount, code: coupon.code });
}