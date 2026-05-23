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
  const { name, code, weightage } = await req.json();

  const subject = await prisma.subject.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(weightage !== undefined && { weightage: Number(weightage) }),
    },
    include: { topics: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(subject);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Delete progress + topics first, then subject
  await prisma.$transaction([
    prisma.userTopicProgress.deleteMany({ where: { topic: { subjectId: id } } }),
    prisma.topic.deleteMany({ where: { subjectId: id } }),
    prisma.subject.delete({ where: { id } }),
  ]);
  return NextResponse.json({ success: true });
}
