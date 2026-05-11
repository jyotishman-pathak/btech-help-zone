import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma.client";


export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject"); // subject name
  const year = searchParams.get("year");
  const search = searchParams.get("search") ?? "";
  const userTier = (session.user as any).tier ?? "NORMAL";

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

  // Add access flag without exposing fileUrl for locked items
  const enriched = pyqs.map((p) => {
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
      // Only expose fileUrl if user can access
      fileUrl: canAccess ? p.fileUrl : null,
    };
  });

  // Get unique years for filter
  const years = [...new Set(pyqs.map((p) => p.year).filter(Boolean))].sort(
    (a, b) => (b ?? 0) - (a ?? 0)
  );

  return NextResponse.json({ pyqs: enriched, years });
}