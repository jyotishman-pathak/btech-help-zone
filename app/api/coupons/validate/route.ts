import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function POST(req: NextRequest) {
  const { code, batchId } = await req.json();

  if (!code?.trim())
    return NextResponse.json({ valid: false, error: "Enter a coupon code" });

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { batch: { select: { name: true } } },
  });

  if (!coupon)
    return NextResponse.json({ valid: false, error: "Invalid coupon code" });
  if (!coupon.isActive)
    return NextResponse.json({ valid: false, error: "This coupon is no longer active" });
  if (coupon.used >= coupon.maxUses)
    return NextResponse.json({ valid: false, error: "Coupon limit reached" });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return NextResponse.json({ valid: false, error: "This coupon has expired" });
  if (coupon.batchId && batchId && coupon.batchId !== batchId)
    return NextResponse.json({
      valid: false,
      error: `This coupon is only valid for "${coupon.batch?.name}"`,
    });

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discount: coupon.discount,
    description: coupon.description,
    batchName: coupon.batch?.name ?? null,
  });
}