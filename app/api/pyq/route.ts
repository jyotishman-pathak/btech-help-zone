import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma.client";

type PyqItem = Awaited<ReturnType<typeof prisma.studyMaterial.findMany<{
  where: { type: "PYQ"; status: "published" };
  include: { subject: { select: { name: true } } };
  orderBy: [{ year: "desc" }, { createdAt: "desc" }];
}>>>[number];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const search = searchParams.get("search") ?? "";
  const userTier = session?.user?.tier ?? "NORMAL";

  const TIER_LEVEL: Record<string, number> = { NORMAL: 0, PREMIUM: 1, SUPER_PREMIUM: 2 };

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

  const enriched = pyqs.map((p: PyqItem) => {
    const required = TIER_LEVEL[p.requiredTier] ?? 0;
    const has = TIER_LEVEL[userTier] ?? 0;
    const canAccess = has >= required;
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

  const years = [...new Set<number>(pyqs.map((p: PyqItem) => p.year).filter((y: number | null): y is number => !!y))].sort(
    (a, b) => b - a
  );

  return NextResponse.json({ pyqs: enriched, years });
}