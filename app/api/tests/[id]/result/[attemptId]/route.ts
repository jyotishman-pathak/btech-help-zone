import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";


export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, attemptId } = await params;
    const userId = session.user.id as string;

    const [attempt, questions] = await Promise.all([
        prisma.mockTestAttempt.findFirst({
            where: { id: attemptId, userId, testId: id, status: "SUBMITTED" },
            include: { test: { select: { title: true, totalMarks: true, duration: true } } },
        }),
        prisma.mockTestQuestion.findMany({
            where: { testId: id },
            orderBy: { order: "asc" },
        }),
    ]);

    if (!attempt) return NextResponse.json({ error: "Result not found" }, { status: 404 });

    const answersMap = (attempt.answers as Record<string, number>) ?? {};
    const markedSet = new Set(attempt.markedForReview ?? []);

    // Build per-question result
    const questionResults = questions.map((q) => {
        const userAnswer = answersMap[q.id] !== undefined ? answersMap[q.id] : null;
        const isSkipped = userAnswer === null;
        const isCorrect = !isSkipped && userAnswer === q.correctIndex;
        const marksEarned = isSkipped ? 0 : isCorrect ? q.marks : -q.negativeMarks;

        return {
            id: q.id,
            order: q.order,
            section: q.section,
            text: q.text,
            textAs: q.textAs,
            imageUrl: q.imageUrl,
            options: q.options,
            optionsAs: q.optionsAs,
            correctIndex: q.correctIndex,       // ← revealed only on result page
            explanation: q.explanation,
            explanationImageUrl: q.explanationImageUrl,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            userAnswer,
            isCorrect,
            isSkipped,
            isMarked: markedSet.has(q.id),
            marksEarned,
        };
    });

    // Subject breakdown
    const sections = [...new Set(questions.map((q) => q.section))];
    const subjectBreakdown = sections.map((section) => {
        const qs = questionResults.filter((q) => q.section === section);
        return {
            section,
            total: qs.length,
            correct: qs.filter((q) => q.isCorrect).length,
            wrong: qs.filter((q) => !q.isCorrect && !q.isSkipped).length,
            skipped: qs.filter((q) => q.isSkipped).length,
            score: qs.reduce((s, q) => s + q.marksEarned, 0),
            maxScore: qs.reduce((s, q) => s + q.marks, 0),
        };
    });

    const correct = questionResults.filter((q) => q.isCorrect).length;
    const wrong = questionResults.filter((q) => !q.isCorrect && !q.isSkipped).length;
    const skipped = questionResults.filter((q) => q.isSkipped).length;
    const marked = questionResults.filter((q) => q.isMarked).length;

    const timeTaken =
        attempt.completedAt && attempt.startedAt
            ? Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
            : attempt.test.duration * 60;

    return NextResponse.json({
        attempt: {
            id: attempt.id,
            score: attempt.score,
            percentage: attempt.percentage,
            completedAt: attempt.completedAt,
            timeTaken,
        },
        test: attempt.test,
        stats: { correct, wrong, skipped, marked, accuracy: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0 },
        subjectBreakdown,
        questions: questionResults,
    });
}