import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search") ?? "";

  const items = await prisma.studyMaterial.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    },
    include: { subject: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    items.map((i: (typeof items)[number]) => ({
      id: i.id,
      title: i.title,
      type: i.type,
      fileUrl: i.fileUrl,
      subject: i.subject?.name ?? "General",
      requiredTier: i.requiredTier,
      downloads: i.downloads,
      uploadedBy: i.uploadedBy,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, type, fileUrl, subjectId, requiredTier } = body;

  if (!title || !fileUrl) {
    return NextResponse.json({ error: "title and fileUrl required" }, { status: 400 });
  }

  const subject = subjectId
    ? await prisma.subject.findUnique({ where: { id: subjectId } })
    : await prisma.subject.findFirst();

  if (!subject) {
    return NextResponse.json(
      { error: "No subject found. Create a subject first." },
      { status: 400 }
    );
  }

  const item = await prisma.studyMaterial.create({
    data: {
      title,
      type: type ?? "NOTE",
      fileUrl,
      subjectId: subject.id,
      requiredTier: requiredTier ?? "NORMAL",
      uploadedBy: (session.user as any).id,
      status: "published",
    },
    include: { subject: { select: { name: true } } },
  });

  return NextResponse.json(item, { status: 201 });
}