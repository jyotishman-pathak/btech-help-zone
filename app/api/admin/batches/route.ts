import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET(req: NextRequest) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type");

  const batches = await prisma.batch.findMany({
    where: {
      deletedAt: null,
      ...(type ? { type: type as any } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    include: {
      _count: { select: { enrollments: true, tests: true, notes: true } },
      features: { orderBy: { order: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(batches);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, tagline, description, type, isFree, price, originalPrice,
    badge, bannerUrl, validDays, isActive, features } = body;

  if (!name || !slug)
    return NextResponse.json({ error: "name and slug required" }, { status: 400 });

  const existing = await prisma.batch.findUnique({ where: { slug } });
  if (existing)
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });

  const batch = await prisma.batch.create({
    data: {
      name, slug, tagline, description,
      type: type ?? "CEE_PREP",
      isFree: isFree ?? false,
      price: isFree ? 0 : (price ?? 0),
      originalPrice: originalPrice ?? null,
      badge: badge ?? null,
      bannerUrl: bannerUrl ?? null,
      validDays: validDays ?? null,
      isActive: isActive ?? true,
      isPublished: false,
      features: {
        create: (features ?? []).map((text: string, order: number) => ({ text, order })),
      },
    },
    include: { features: true },
  });

  return NextResponse.json(batch, { status: 201 });
}