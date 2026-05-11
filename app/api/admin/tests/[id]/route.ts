import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma.client";
import { auth } from "../../../../../auth";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const test = await prisma.mockTest.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
      subject: true,
    },
  });

  if (!test) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(test);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const test = await prisma.mockTest.update({
    where: { id: params.id },
    data: {
      title: body.title,
      isActive: body.isActive,
      requiredTier: body.requiredTier,
    },
  });

  return NextResponse.json(test);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await prisma.mockTest.delete({
    where: { id: params.id },
  });

  return NextResponse.json({
    success: true,
  });
}