import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";


export async function GET(req: NextRequest) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const search = searchParams.get("search") ?? "";

    const leads = await prisma.leadSubmission.findMany({
        where: batchId ? { batchId } : {},
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 2000,
    });

    // Enrich with batch names (no relation in schema → join manually)
    const batchIds = [...new Set(leads.map((l) => l.batchId))];
    const batches = await prisma.batch.findMany({
        where: { id: { in: batchIds } },
        select: { id: true, name: true, slug: true },
    });
    const batchMap = Object.fromEntries(batches.map((b) => [b.id, b]));

    const enriched = leads.map((l) => ({
        id: l.id,
        batchId: l.batchId,
        batchName: batchMap[l.batchId]?.name ?? "Unknown Batch",
        batchSlug: batchMap[l.batchId]?.slug ?? "",
        user: l.user,
        data: l.data as Record<string, string>,
        createdAt: l.createdAt,
    }));

    // Client-side search filter
    const filtered = search
        ? enriched.filter((l) => {
            const d = l.data;
            const q = search.toLowerCase();
            return (
                l.user?.name?.toLowerCase().includes(q) ||
                l.user?.email?.toLowerCase().includes(q) ||
                d["Full Name"]?.toLowerCase().includes(q) ||
                d["Phone Number"]?.includes(search) ||
                d["School / College"]?.toLowerCase().includes(q) ||
                l.batchName.toLowerCase().includes(q)
            );
        })
        : enriched;

    return NextResponse.json(filtered);
}