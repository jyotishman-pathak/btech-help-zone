import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma.client";
import { auth } from "../../../auth";


export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      batch: {
        include: {
          features: { orderBy: { order: "asc" } },
          tests: {
            include: {
              test: {
                select: {
                  id: true, title: true, duration: true,
                  totalMarks: true, examType: true, isActive: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
          notes: {
            include: {
              note: {
                select: { id: true, title: true, type: true, fileUrl: true, downloads: true },
              },
            },
            orderBy: { order: "asc" },
          },
          pyqs: {
            include: {
              pyq: {
                select: { id: true, title: true, year: true, downloads: true, fileUrl: true },
              },
            },
            orderBy: { order: "asc" },
          },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach attempt counts for each test so student can see progress
  const testIds = enrollments.flatMap((e) => e.batch.tests.map((bt) => bt.test.id));
  const attempts = await prisma.mockTestAttempt.findMany({
    where: { userId, testId: { in: testIds }, status: "SUBMITTED" },
    select: { id: true, testId: true, score: true, percentage: true, completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  const attemptMap = attempts.reduce<Record<string, typeof attempts[0]>>((acc, a) => {
    if (!acc[a.testId]) acc[a.testId] = a;
    return acc;
  }, {});

  const enriched = enrollments.map((enrollment) => ({
    ...enrollment,
    batch: {
      ...enrollment.batch,
      tests: enrollment.batch.tests.map((bt) => ({
        ...bt,
        lastAttempt: attemptMap[bt.test.id] ?? null,
      })),
    },
  }));

  return NextResponse.json(enriched);
}