import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    // ✅ Moved inside handler — only runs at request time, not build time
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

    const { batchId, couponCode } = body;

    if (!batchId)
      return NextResponse.json({ error: "batchId required" }, { status: 400 });

    const batch = await prisma.batch.findUnique({ where: { id: batchId } });

    if (!batch)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    if (batch.isFree)
      return NextResponse.json({ error: "Batch is free — use enroll endpoint" }, { status: 400 });

    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_batchId: { userId, batchId } },
    });

    if (enrolled?.status === "ACTIVE")
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

    let finalAmount = Number(batch.price);
    let couponId: string | null = null;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          AND: [
            { OR: [{ batchId: null }, { batchId }] },
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          ],
        },
      });

      if (coupon && coupon.used < coupon.maxUses) {
        discountAmount = Math.round((finalAmount * coupon.discount) / 100);
        finalAmount = Math.max(0, finalAmount - discountAmount);
        couponId = coupon.id;
      }
    }

    const amountInPaise = Math.round(finalAmount);

    if (!amountInPaise || amountInPaise <= 0)
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${userId.slice(-6)}_${Date.now()}`,
      notes: { userId, batchId, couponId: couponId ?? "" },
    });

    await prisma.payment.create({
      data: {
        userId,
        batchId,
        amount: finalAmount,
        status: "PENDING",
        razorpayOrderId: order.id,
        couponId,
        discountAmount: discountAmount > 0 ? discountAmount : null,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      batchName: batch.name,
      discountAmount,
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