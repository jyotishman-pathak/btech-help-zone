import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: razorpay_order_id },
    include: { batch: true },
  });

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "CAPTURED", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
    });

    await tx.enrollment.upsert({
      where: { userId_batchId: { userId, batchId: payment.batchId! } },
      create: {
        userId,
        batchId: payment.batchId!,
        status: "ACTIVE",
        source: "payment",
        expiresAt: payment.batch?.validDays
          ? new Date(Date.now() + payment.batch.validDays * 86400000)
          : null,
      },
      update: { status: "ACTIVE" },
    });

    // Increment coupon usage
    if (payment.couponId) {
      await tx.coupon.update({ where: { id: payment.couponId }, data: { used: { increment: 1 } } });
    }

    // Send notification
    await tx.notification.create({
      data: {
        userId,
        title: `Enrolled in ${payment.batch?.name ?? "batch"}!`,
        body: "Your payment was successful. Start learning now.",
        type: "PAYMENT",
        link: `/batches/${payment.batch?.slug}`,
      },
    });
  });

  return NextResponse.json({ success: true, batchSlug: payment.batch?.slug });
}