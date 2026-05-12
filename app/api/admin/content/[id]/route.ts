import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status, requiredTier, title } = await req.json();
  const data: Record<string, any> = {};
  if (status) data.status = status;
  if (requiredTier) data.requiredTier = requiredTier;
  if (title) data.title = title;

  const item = await prisma.studyMaterial.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.studyMaterial.delete({ where: { id } });
  return NextResponse.json({ success: true });
}