import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.maxUses !== undefined && { maxUses: Number(body.maxUses) }),
      ...(body.discount !== undefined && { discount: Number(body.discount) }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
    },
    include: { batch: { select: { id: true, name: true } } },
  });

  return NextResponse.json(coupon);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Unlink from payments first so foreign key doesn't block
  await prisma.payment.updateMany({ where: { couponId: id }, data: { couponId: null } });
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}