import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { id } = await params;
  const role = (session.user as any).role;

  const material = await prisma.studyMaterial.findUnique({
    where: { id, type: "PYQ" },
    select: { fileUrl: true, title: true, requiredTier: true },
  });
  if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Admins always can download
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    // Map Role enum to a tier level since User has no separate tier field
    const ROLE_TIER: Record<string, number> = { STUDENT: 0, PREMIUM_STUDENT: 1, ADMIN: 2, SUPER_ADMIN: 2 };
    const MATERIAL_TIER: Record<string, number> = { NORMAL: 0, PREMIUM: 1, SUPER_PREMIUM: 2 };
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const hasDirectAccess =
      (ROLE_TIER[user?.role ?? "STUDENT"] ?? 0) >= (MATERIAL_TIER[material.requiredTier] ?? 0);

    // Check batch enrollment
    const batchAccess = await prisma.enrollment.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        batch: {
          deletedAt: null,
          pyqs: { some: { pyqId: id } },
        },
      },
    });

    if (!hasDirectAccess && !batchAccess)
      return NextResponse.json({ error: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  await prisma.studyMaterial.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  return NextResponse.json({ url: material.fileUrl });
}