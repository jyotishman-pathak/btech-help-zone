import { redirect } from "next/navigation";
import Link from "next/link";
import { Timer, Lock, ChevronRight, Trophy } from "lucide-react";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";
import { Prisma } from "@prisma/client";

type MockTestWithCount = Prisma.MockTestGetPayload<{
  include: { _count: { select: { questions: true } } };
}>;

export default async function MockListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/cee/mock");

  const userId = session.user.id as string;

  const [tests, user, submittedCount] = await Promise.all([
    prisma.mockTest.findMany({
      where: { isActive: true },
      include: { _count: { select: { questions: true } } },
      orderBy: { id: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, name: true },
    }),
    prisma.mockTestAttempt.count({
      where: { userId, status: "SUBMITTED" },
    }),
  ]);

  const freeTestUsed = user?.tier === "NORMAL" && submittedCount > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white dark:text-zinc-900" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Mock Tests</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {freeTestUsed
                ? "Upgrade to Premium to unlock all tests"
                : "Your first test is free — no credit card needed"}
            </p>
          </div>
        </div>

        {/* Tier badge */}
        {user?.tier === "NORMAL" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <span className="text-sm text-amber-800 dark:text-amber-300">
              {freeTestUsed
                ? "You've used your free test. Upgrade to Premium for unlimited access."
                : `You have 1 free test remaining, ${user.name?.split(" ")[0] ?? "student"}.`}
            </span>
            {freeTestUsed && (
              <Link
                href="/pricing"
                className="ml-auto text-xs font-semibold px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition shrink-0"
              >
                Upgrade
              </Link>
            )}
          </div>
        )}

        {/* Test list */}
        <div className="space-y-3">
          {tests.length === 0 && (
            <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
              No mock tests available yet. Check back soon.
            </div>
          )}

          {tests.map((t: MockTestWithCount) => {
            const isLocked = user?.tier === "NORMAL" && freeTestUsed;

            return (
              <div
                key={t.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Timer className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{t.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t._count.questions} questions · {t.duration} mins · +4 / −1 / 0
                  </p>
                </div>

                {isLocked ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm shrink-0">
                    <Lock className="w-3.5 h-3.5" /> Premium
                  </div>
                ) : (
                  <Link
                    href={`/cee/mock/${t.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition shrink-0"
                  >
                    Start <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}