
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";
export const runtime = "nodejs"


const TIER_PRICES: Record<string, number> = { PREMIUM: 499, SUPER_PREMIUM: 999 };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = await req.json();

  // Verify HMAC signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature)
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

  const userId = session.user.id as string;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Update user tier + upsert subscription atomically
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { tier: tier as any },
    }),
    prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: tier as any,
        status: "ACTIVE",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: TIER_PRICES[tier] ?? 0,
        expiresAt,
        startsAt: new Date(),
      },
      create: {
        userId,
        tier: tier as any,
        status: "ACTIVE",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: TIER_PRICES[tier] ?? 0,
        expiresAt,
      },
    }),
  ]);

  return NextResponse.json({ success: true, tier, expiresAt });
}