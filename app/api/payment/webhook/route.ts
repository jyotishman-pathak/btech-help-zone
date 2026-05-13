import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "../../../../lib/prisma.client";
;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  // Verify webhook signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== signature)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(body);

  switch (event.event) {
    case "payment.captured": {
      const { order_id, id: paymentId } = event.payload.payment.entity;
      await prisma.payment.updateMany({
        where: { razorpayOrderId: order_id },
        data: { status: "CAPTURED", razorpayPaymentId: paymentId },
      });
      break;
    }
    case "payment.failed": {
      const { order_id } = event.payload.payment.entity;
      await prisma.payment.updateMany({
        where: { razorpayOrderId: order_id },
        data: { status: "FAILED" },
      });
      break;
    }
    case "refund.created": {
      const { payment_id, id: refundId } = event.payload.refund.entity;
      await prisma.payment.updateMany({
        where: { razorpayPaymentId: payment_id },
        data: { status: "REFUNDED", refundId, refundedAt: new Date() },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}