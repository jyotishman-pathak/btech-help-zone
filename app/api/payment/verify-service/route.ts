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
  });

  if (!payment || !payment.serviceType) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    const updateData: any = {};
    let title = "";
    if (payment.serviceType === "PREDICTOR") {
      updateData.hasPredictor = true;
      title = "College Predictor";
    } else if (payment.serviceType === "ANALYTICS") {
      updateData.hasAnalytics = true;
      title = "Deep Analytics";
    } else if (payment.serviceType === "COUNSELLING") {
      updateData.hasCounselling = true;
      title = "Counselling Assistance";
    }

    await tx.user.update({
      where: { id: userId },
      data: updateData,
    });

    await tx.notification.create({
      data: {
        userId,
        title: `${title} Unlocked!`,
        body: "Your payment was successful. You can now access this premium feature.",
        type: "PAYMENT",
        link: `/student`,
      },
    });
  });

  return NextResponse.json({ success: true, serviceType: payment.serviceType });
}
