import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

type SessionUser = {
  id: string;
  role: "ADMIN" | "SUPER_ADMIN" | "USER";
};

type Session = {
  user: SessionUser;
};

function isAdmin(session: Session | null) {
  return (
    session &&
    ["ADMIN", "SUPER_ADMIN"].includes(session.user?.role)
  );
}

export async function GET() {
  const session = (await auth()) as Session | null;

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pyqs = await prisma.studyMaterial.findMany({
    where: { type: "PYQ", deletedAt: null },
    include: {
      subject: { select: { name: true } },
      batchPYQ: {
        include: {
          batch: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(pyqs);
}
// app/api/admin/pyq/route.ts — just the POST handler

export async function POST(req: NextRequest) {
  const session = (await auth()) as Session | null;
  if (!isAdmin(session))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, subjectName, year, requiredTier, fileUrl, batchIds = [] } =
    await req.json();

  if (!title || !fileUrl || !subjectName)
    return NextResponse.json(
      { error: "title, subjectName, and fileUrl required" },
      { status: 400 }
    );

  const uploadedBy = session?.user?.id;
  if (!uploadedBy)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find or create subject by name
  let subject = await prisma.subject.findFirst({
    where: { name: { equals: subjectName.trim(), mode: "insensitive" } },
  });

  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        name: subjectName.trim(),
        category: "General",
      },
    });
  }

  const material = await prisma.$transaction(async (tx) => {
    const pyq = await tx.studyMaterial.create({
      data: {
        title,
        type: "PYQ",
        fileUrl,
        subjectId: subject!.id,
        year: year ? parseInt(year) : null,
        requiredTier: requiredTier ?? "NORMAL",
        uploadedBy,
        status: "published",
      },
    });

    if (batchIds.length > 0) {
      await tx.batchPYQ.createMany({
        data: batchIds.map((batchId: string, index: number) => ({
          batchId,
          pyqId: pyq.id,
          order: index,
        })),
        skipDuplicates: true,
      });
    }

    return pyq;
  });

  return NextResponse.json(material, { status: 201 });
}