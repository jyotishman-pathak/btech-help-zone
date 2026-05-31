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
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: order_id },
        include: {
          enrollment: { include: { batch: true } },
          coupon: true,
        },
      });

      if (payment && payment.status !== "CAPTURED") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "CAPTURED", razorpayPaymentId: paymentId },
          });

          if (payment.batchId) {
            const batch = payment.enrollment?.batch ?? await tx.batch.findUnique({ where: { id: payment.batchId } });
            await tx.enrollment.upsert({
              where: { userId_batchId: { userId: payment.userId, batchId: payment.batchId } },
              create: {
                userId: payment.userId,
                batchId: payment.batchId,
                status: "ACTIVE",
                source: "payment",
                expiresAt: batch?.validDays
                  ? new Date(Date.now() + batch.validDays * 86400000)
                  : null,
              },
              update: { status: "ACTIVE" },
            });

            if (payment.couponId) {
              await tx.coupon.update({
                where: { id: payment.couponId },
                data: { used: { increment: 1 } },
              });
            }

            await tx.notification.create({
              data: {
                userId: payment.userId,
                title: `Enrolled in ${batch?.name ?? "batch"}!`,
                body: "Your payment was successful. Start learning now.",
                type: "PAYMENT",
                link: `/batches/${batch?.slug ?? ""}`,
              },
            });
          } else if (payment.serviceType) {
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
              where: { id: payment.userId },
              data: updateData,
            });

            await tx.notification.create({
              data: {
                userId: payment.userId,
                title: `${title} Unlocked!`,
                body: "Your payment was successful. You can now access this premium feature.",
                type: "PAYMENT",
                link: `/student`,
              },
            });
          }
        });
      }
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