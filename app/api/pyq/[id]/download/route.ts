import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";


export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userTier = (session.user as any).tier ?? "NORMAL";
  const TIER_LEVEL: Record<string, number> = { NORMAL: 0, PREMIUM: 1, SUPER_PREMIUM: 2 };

  const material = await prisma.studyMaterial.findUnique({
    where: { id, type: "PYQ" },
    select: { fileUrl: true, title: true, requiredTier: true },
  });

  if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (TIER_LEVEL[userTier] < TIER_LEVEL[material.requiredTier])
    return NextResponse.json({ error: "UPGRADE_REQUIRED" }, { status: 403 });

  // Increment download counter
  await prisma.studyMaterial.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  return NextResponse.json({ url: material.fileUrl });
}