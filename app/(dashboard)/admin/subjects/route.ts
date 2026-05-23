import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma.client";
import { auth } from "../../../../auth";


export async function GET() {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subjects = await prisma.subject.findMany({
        include: { topics: { orderBy: { order: "asc" } } },
        orderBy: { weightage: "desc" },
    });
    return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, code, category, weightage } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!category?.trim()) return NextResponse.json({ error: "Category required" }, { status: 400 });

    const subject = await prisma.subject.create({
        data: {
            name: name.trim(),
            code: code?.trim() || name.trim().toUpperCase().slice(0, 8),
            category: category.trim(),
            weightage: Number(weightage) || 0,
        },
        include: { topics: true },
    });
    return NextResponse.json(subject, { status: 201 });
}