import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma.client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = (session.user as any).role;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role);

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const search = searchParams.get("search") ?? "";

  const pyqs = await prisma.studyMaterial.findMany({
    where: {
      type: "PYQ",
      status: "published",
      ...(year ? { year: parseInt(year) } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(subject
        ? { subject: { name: { equals: subject, mode: "insensitive" } } }
        : {}),
    },
    include: { subject: { select: { name: true } } },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  // Get all batch pyq IDs the user is enrolled in (one query, not N queries)
  const enrolledBatchPyqs = isAdmin
    ? null
    : await prisma.batchPYQ.findMany({
      where: {
        batch: {
          deletedAt: null,
          enrollments: { some: { userId, status: "ACTIVE" } },
        },
      },
      select: { pyqId: true },
    });

  const accessiblePyqIds = isAdmin
    ? null
    : new Set(enrolledBatchPyqs!.map((b) => b.pyqId));

  const enriched = pyqs.map((p) => {
    const canAccess =
      isAdmin ||
      p.requiredTier === "NORMAL" ||
      accessiblePyqIds!.has(p.id);

    return {
      id: p.id,
      title: p.title,
      subject: p.subject?.name ?? "General",
      year: p.year,
      requiredTier: p.requiredTier,
      downloads: p.downloads,
      canAccess,
      fileUrl: canAccess ? p.fileUrl : null,
    };
  });

  const years = [
    ...new Set<number>(
      pyqs.map((p) => p.year).filter((y): y is number => !!y)
    ),
  ].sort((a, b) => b - a);

  return NextResponse.json({ pyqs: enriched, years });
}