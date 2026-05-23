import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import prisma from "../../../../../../../lib/prisma.client";


export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; qId: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, qId } = await params;
    const body = await req.json();

    const question = await prisma.mockTestQuestion.update({
        where: { id: qId, testId: id },
        data: {
            text: body.text,
            textAs: body.textAs ?? null,
            imageUrl: body.imageUrl ?? null,
            options: body.options,
            optionsAs: body.optionsAs ?? [],
            optionImages: body.optionImages ?? [],
            correctIndex: body.correctIndex,
            marks: body.marks ?? 4,
            negativeMarks: body.negativeMarks ?? 1,
            section: body.section ?? "General",
            explanation: body.explanation ?? null,
            explanationImageUrl: body.explanationImageUrl ?? null,
        },
    });

    // Recalc total marks
    const questions = await prisma.mockTestQuestion.findMany({
        where: { testId: id }, select: { marks: true },
    });
    await prisma.mockTest.update({
        where: { id },
        data: { totalMarks: questions.reduce((s, q) => s + q.marks, 0) },
    });

    return NextResponse.json(question);
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ id: string; qId: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, qId } = await params;

    const q = await prisma.mockTestQuestion.findUnique({ where: { id: qId } });
    if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.mockTestQuestion.delete({ where: { id: qId } });

    // Compact order numbers
    const remaining = await prisma.mockTestQuestion.findMany({
        where: { testId: id },
        orderBy: { order: "asc" },
    });
    await Promise.all(
        remaining.map((rq, idx) =>
            prisma.mockTestQuestion.update({ where: { id: rq.id }, data: { order: idx } })
        )
    );

    // Recalc total marks
    await prisma.mockTest.update({
        where: { id },
        data: { totalMarks: remaining.reduce((s, rq) => s + rq.marks, 0) },
    });

    return NextResponse.json({ success: true });
}