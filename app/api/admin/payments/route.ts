import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";
import { PaymentStatus } from "@prisma/client";


export async function GET(req: NextRequest) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") ?? "all";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 30;

    const where = statusFilter !== "all" ? { status: statusFilter.toUpperCase() as PaymentStatus } : {};

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [payments, total, capturedAll, capturedMonth, failedCount, pendingCount] = await Promise.all([
        prisma.payment.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, image: true } },
                enrollment: { select: { batch: { select: { id: true, name: true, slug: true } } } },
                coupon: { select: { code: true, discount: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.payment.count({ where }),
        prisma.payment.aggregate({ where: { status: "CAPTURED" }, _sum: { amount: true } }),
        prisma.payment.aggregate({ where: { status: "CAPTURED", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
        prisma.payment.count({ where: { status: "FAILED" } }),
        prisma.payment.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
        payments,
        total,
        page,
        stats: {
            totalRevenue: capturedAll._sum.amount ?? 0,
            revenueThisMonth: capturedMonth._sum.amount ?? 0,
            successCount: await prisma.payment.count({ where: { status: "CAPTURED" } }),
            failedCount,
            pendingCount,
        },
    });
}