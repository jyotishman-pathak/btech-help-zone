import { redirect, notFound } from "next/navigation";
import prisma from "../../../../../../../lib/prisma.client";
import { auth } from "../../../../../../../auth";
import { ResultReview } from "../../../../../../../components/test/ResultReview";


async function getResultData(testId: string, attemptId: string, userId: string) {
    const [attempt, questions] = await Promise.all([
        prisma.mockTestAttempt.findFirst({
            where: { id: attemptId, userId, testId, status: "SUBMITTED" },
            include: { test: { select: { title: true, totalMarks: true, duration: true } } },
        }),
        prisma.mockTestQuestion.findMany({
            where: { testId },
            orderBy: { order: "asc" },
        }),
    ]);

    if (!attempt) return null;

    const answersMap = (attempt.answers as Record<string, number>) ?? {};
    const markedSet = new Set(attempt.markedForReview ?? []);

    const questionResults = questions.map((q) => {
        const userAnswer = answersMap[q.id] !== undefined ? answersMap[q.id] : null;
        const isSkipped = userAnswer === null;
        const isCorrect = !isSkipped && userAnswer === q.correctIndex;
        return {
            id: q.id, order: q.order, section: q.section,
            text: q.text, textAs: q.textAs, imageUrl: q.imageUrl,
            options: q.options, optionsAs: q.optionsAs,
            correctIndex: q.correctIndex,
            explanation: q.explanation, explanationImageUrl: q.explanationImageUrl,
            marks: q.marks, negativeMarks: q.negativeMarks,
            userAnswer, isCorrect, isSkipped,
            isMarked: markedSet.has(q.id),
            marksEarned: isSkipped ? 0 : isCorrect ? q.marks : -q.negativeMarks,
        };
    });

    const correct = questionResults.filter((q) => q.isCorrect).length;
    const wrong = questionResults.filter((q) => !q.isCorrect && !q.isSkipped).length;
    const sections = [...new Set(questions.map((q) => q.section))];

    return {
        attempt: {
            id: attempt.id, score: attempt.score, percentage: attempt.percentage,
            completedAt: attempt.completedAt,
            timeTaken: attempt.completedAt && attempt.startedAt
                ? Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
                : attempt.test.duration * 60,
        },
        test: { ...attempt.test, id: testId },
        stats: {
            correct, wrong,
            skipped: questionResults.filter((q) => q.isSkipped).length,
            marked: questionResults.filter((q) => q.isMarked).length,
            accuracy: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0,
        },
        subjectBreakdown: sections.map((section) => {
            const qs = questionResults.filter((q) => q.section === section);
            return {
                section, total: qs.length,
                correct: qs.filter((q) => q.isCorrect).length,
                wrong: qs.filter((q) => !q.isCorrect && !q.isSkipped).length,
                score: qs.reduce((s, q) => s + q.marksEarned, 0),
                maxScore: qs.reduce((s, q) => s + q.marks, 0),
            };
        }),
        questions: questionResults,
    };
}

export default async function TestResultPage({
    params,
}: {
    params: Promise<{ id: string; attemptId: string }>;
}) {
    const { id, attemptId } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const data = await getResultData(id, attemptId, session.user.id as string);
    if (!data) notFound();

    return <ResultReview data={data} testId={id} />;
}