import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export const runtime = "nodejs";

const SERVICE_PRICES: Record<string, number> = {
  PREDICTOR: 29900, // in paise
  ANALYTICS: 69900,
  COUNSELLING: 99900,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { serviceType } = body;

    if (!serviceType || !SERVICE_PRICES[serviceType])
      return NextResponse.json({ error: "Invalid serviceType" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if already purchased
    if (serviceType === "PREDICTOR" && user.hasPredictor)
      return NextResponse.json({ error: "Already purchased" }, { status: 409 });
    if (serviceType === "ANALYTICS" && user.hasAnalytics)
      return NextResponse.json({ error: "Already purchased" }, { status: 409 });
    if (serviceType === "COUNSELLING" && user.hasCounselling)
      return NextResponse.json({ error: "Already purchased" }, { status: 409 });

    const amountInPaise = SERVICE_PRICES[serviceType];
    const finalAmount = amountInPaise / 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `svc_${userId.slice(-6)}_${Date.now()}`,
      notes: { userId, serviceType },
    });

    await prisma.payment.create({
      data: {
        userId,
        serviceType,
        amount: finalAmount,
        status: "PENDING",
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      serviceType,
      finalAmount,
    });
  } catch (err: any) {
    console.error("PAYMENT ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
