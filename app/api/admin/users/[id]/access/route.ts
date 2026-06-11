import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";


export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await props.params;
    const userId = resolvedParams.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasPredictor: true, hasAnalytics: true, hasCounselling: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { batchId: true },
    });

    const allBatches = await prisma.batch.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      features: user,
      enrolledBatchIds: enrollments.map(e => e.batchId),
      allBatches,
    });
  } catch (error) {
    console.error("Access GET error:", error);
    return NextResponse.json({ error: "Failed to fetch access data" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id;
    const resolvedParams = await props.params;
    const userId = resolvedParams.id;
    const { features, batchIds } = await req.json();

    // 1. Update user features
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasPredictor: features.hasPredictor,
        hasAnalytics: features.hasAnalytics,
        hasCounselling: features.hasCounselling,
      },
    });

    // 2. Sync Batches
    const currentEnrollments = await prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
    });

    const currentBatchIds = currentEnrollments.map(e => e.batchId);
    const newBatchIds = batchIds.filter((id: string) => !currentBatchIds.includes(id));
    const removedBatchIds = currentBatchIds.filter(id => !batchIds.includes(id));

    // Add new enrollments
    if (newBatchIds.length > 0) {
      await prisma.enrollment.createMany({
        data: newBatchIds.map((batchId: string) => ({
          userId,
          batchId,
          status: "ACTIVE",
          source: "admin_grant",
          grantedBy: adminId,
        })),
        skipDuplicates: true,
      });
    }

    // Cancel removed enrollments (instead of hard delete, better for audit)
    if (removedBatchIds.length > 0) {
      await prisma.enrollment.updateMany({
        where: { userId, batchId: { in: removedBatchIds }, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: "MANUAL_ACCESS_GRANT",
        entity: "User",
        entityId: userId,
        newValue: { features, batchIds },
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Access POST error:", error);
    return NextResponse.json({ error: "Failed to update access" }, { status: 500 });
  }
}
