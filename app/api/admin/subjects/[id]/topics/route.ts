import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Topic name required" }, { status: 400 });

  const last = await prisma.topic.findFirst({
    where: { subjectId: id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const topic = await prisma.topic.create({
    data: { subjectId: id, name: name.trim(), order: (last?.order ?? -1) + 1 },
  });
  return NextResponse.json(topic, { status: 201 });
}
