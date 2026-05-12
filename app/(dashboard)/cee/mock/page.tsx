// app/(dashboard)/cee/mock/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { Timer, Lock, ChevronRight, Trophy, Sparkles, Clock, Target } from "lucide-react";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

type MockTestWithCount = Awaited<ReturnType<typeof prisma.mockTest.findMany<{
  include: { _count: { select: { questions: true } } }
}>>>[number];

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
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Mock Tests</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {freeTestUsed
                  ? "Upgrade to Premium to unlock all tests"
                  : "Your first test is free — no credit card needed"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Available", value: tests.length, icon: Target, color: "from-indigo-500 to-violet-600" },
            { label: "Completed", value: submittedCount, icon: Trophy, color: "from-emerald-500 to-teal-600" },
            { label: "Minutes each", value: tests[0]?.duration ?? "—", icon: Clock, color: "from-amber-400 to-orange-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 p-4 shadow-sm text-center space-y-2">
              <div className={`w-9 h-9 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{value}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Tier notice */}
        {user?.tier === "NORMAL" && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300 flex-1 font-medium">
              {freeTestUsed
                ? "You've used your free test. Upgrade to Premium for unlimited access."
                : `You have 1 free test remaining, ${user.name?.split(" ")[0] ?? "student"}.`}
            </p>
            {freeTestUsed && (
              <Link
                href="/pricing"
                className="shrink-0 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 hover:from-amber-300 hover:to-orange-400 transition shadow-sm"
              >
                Upgrade
              </Link>
            )}
          </div>
        )}

        {/* Test list */}
        <div className="space-y-3">
          {tests.length === 0 && (
            <div className="text-center py-20 rounded-3xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50">
              <Trophy className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold">No mock tests yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">Check back soon — tests are added weekly</p>
            </div>
          )}

          {tests.map((t: MockTestWithCount, idx: number) => {
            const isLocked = user?.tier === "NORMAL" && freeTestUsed;

            return (
              <div
                key={t.id}
                className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200"
              >
                {/* Number badge */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Target className="w-3 h-3" /> {t._count.questions} questions
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.duration} mins
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+4 / −1</span>
                  </div>
                </div>

                {isLocked ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-semibold shrink-0">
                    <Lock className="w-3.5 h-3.5" /> Premium
                  </div>
                ) : (
                  <Link
                    href={`/cee/mock/${t.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold hover:from-indigo-700 hover:to-violet-700 transition shadow-sm shrink-0"
                  >
                    Start <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA for locked users */}
        {freeTestUsed && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 p-8 text-center space-y-4">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border border-indigo-700/30" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-violet-700/30" />
            </div>
            <div className="relative">
              <p className="text-xl font-black text-white">Unlock all {tests.length} tests</p>
              <p className="text-sm text-indigo-300 mt-1">For just ₹499/month — less than one coaching class</p>
              <Link href="/pricing" className="inline-flex items-center gap-2 mt-4 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-black text-sm hover:from-amber-300 hover:to-orange-400 transition shadow-lg">
                View Plans <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}