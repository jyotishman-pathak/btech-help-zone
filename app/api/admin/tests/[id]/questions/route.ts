import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";

export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const questions = await prisma.mockTestQuestion.findMany({
        where: { testId: id },
        orderBy: { order: "asc" },
    });
    return NextResponse.json(questions);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Get current max order
    const last = await prisma.mockTestQuestion.findFirst({
        where: { testId: id },
        orderBy: { order: "desc" },
        select: { order: true },
    });

    const question = await prisma.mockTestQuestion.create({
        data: {
            testId: id,
            text: body.text ?? "New question",
            textAs: body.textAs ?? null,
            imageUrl: body.imageUrl ?? null,
            options: body.options ?? ["Option A", "Option B", "Option C", "Option D"],
            optionsAs: body.optionsAs ?? [],
            correctIndex: body.correctIndex ?? 0,
            marks: body.marks ?? 4,
            negativeMarks: body.negativeMarks ?? 1,
            section: body.section ?? "General",
            order: (last?.order ?? -1) + 1,
        },
    });

    // Update test totalMarks
    await recalcTotalMarks(id);

    return NextResponse.json(question, { status: 201 });
}

async function recalcTotalMarks(testId: string) {
    const questions = await prisma.mockTestQuestion.findMany({
        where: { testId },
        select: { marks: true },
    });
    const total = questions.reduce((s, q) => s + q.marks, 0);
    await prisma.mockTest.update({ where: { id: testId }, data: { totalMarks: total } });
}