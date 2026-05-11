import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "../../../../auth";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Monthly prices in paise (₹ × 100)
const TIER_PRICES: Record<string, number> = {
  PREMIUM: 49900,        // ₹499
  SUPER_PREMIUM: 99900,  // ₹999
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tier } = await req.json();
  const amount = TIER_PRICES[tier];
  if (!amount) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `rcpt_${session.user.id.slice(-8)}_${Date.now()}`,
    notes: { userId: session.user.id, tier },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}