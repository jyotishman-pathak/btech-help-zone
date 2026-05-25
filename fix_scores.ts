import prisma from './lib/prisma.client';

async function main() {
  const attempts = await prisma.mockTestAttempt.findMany({
    where: { status: 'SUBMITTED' }
  });

  for (const attempt of attempts) {
    const questions = await prisma.mockTestQuestion.findMany({
      where: { testId: attempt.testId }
    });

    let score = 0;
    const answersMap = attempt.answers as Record<string, number> || {};

    for (const q of questions) {
      const selected = answersMap[q.id];
      if (selected !== undefined && selected !== null) {
        if (selected === q.correctIndex) {
          score += q.marks;
        } else {
          score -= q.negativeMarks;
        }
      }
    }

    await prisma.mockTestAttempt.update({
      where: { id: attempt.id },
      data: { score }
    });
    console.log(`Updated attempt ${attempt.id} with score ${score}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
