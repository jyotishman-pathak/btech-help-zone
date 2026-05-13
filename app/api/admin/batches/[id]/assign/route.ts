import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";


// POST { type: "test"|"note", ids: string[] }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN","SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: batchId } = await params;
  const { type, ids } = await req.json();

  if (type === "test") {
    await prisma.batchTest.createMany({
      data: ids.map((testId: string, order: number) => ({ batchId, testId, order })),
      skipDuplicates: true,
    });
  } else if (type === "note") {
    await prisma.batchNote.createMany({
      data: ids.map((noteId: string, order: number) => ({ batchId, noteId: noteId, order })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE { type: "test"|"note", id: string }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["ADMIN","SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: batchId } = await params;
  const { type, id } = await req.json();

  if (type === "test") {
    await prisma.batchTest.deleteMany({ where: { batchId, testId: id } });
  } else if (type === "note") {
    await prisma.batchNote.deleteMany({ where: { batchId, noteId: id } });
  }

  return NextResponse.json({ success: true });
}