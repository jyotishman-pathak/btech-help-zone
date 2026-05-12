import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma.client";
import { auth } from "../../../auth";
import { DashboardData, DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { DashboardProvider } from "../../../components/dashboard/student-dash/context";

type SubjectWithTopics = Awaited<ReturnType<typeof prisma.subject.findMany<{
  include: { topics: { include: { progress: true } } }
}>>>[number];

type TopicWithProgress = SubjectWithTopics["topics"][number];
type ProgressItem = TopicWithProgress["progress"][number];

type AttemptItem = {
  id: string;
  score: number;
  percentage: number;
  completedAt: Date | null;
  test: { title: string; totalMarks: number };
};

type TopAttemptItem = {
  userId: string;
  user: { id: string; name: string | null };
  score: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeDate(date: Date | null): string {
  if (!date) return "Unknown";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function calcStreak(dates: Date[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates.map((d) => d.toDateString()))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff =
      (new Date(unique[i - 1]).getTime() - new Date(unique[i]).getTime()) /
      86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getDashboardData(userId: string): Promise<DashboardData> {
  const [subjects, attempts, topAttempts] = await Promise.all([
    prisma.subject.findMany({
      include: {
        topics: {
          include: {
            progress: { where: { userId } },
          },
        },
      },
      orderBy: { weightage: "desc" },
    }),
    prisma.mockTestAttempt.findMany({
      where: { userId, status: "SUBMITTED" },
      include: { test: { select: { title: true, totalMarks: true } } },
      orderBy: { completedAt: "asc" },
    }),
    prisma.mockTestAttempt.findMany({
      where: { status: "SUBMITTED" },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { score: "desc" },
      take: 100,
    }),
  ]);

  // ── Subjects ──────────────────────────────────────────────────────────────
  const subjectData = subjects.map((s: SubjectWithTopics) => ({
    name: s.name,
    topicsTotal: s.topics.length,
    topicsDone: s.topics.filter((t: TopicWithProgress) => t.progress.some((p: ProgressItem) => p.completed))
      .length,
    progress:
      s.topics.length > 0
        ? Math.round(
            (s.topics.filter((t: TopicWithProgress) => t.progress.some((p: ProgressItem) => p.completed))
              .length /
              s.topics.length) *
              100
          )
        : 0,
  }));

  // ── Score history ─────────────────────────────────────────────────────────
  const scoreHistory = attempts.map((a: AttemptItem, i: number) => ({
    test: `Mock ${i + 1}`,
    total: a.score,
  }));

  // ── Recent tests (last 5, most recent first) ──────────────────────────────
  const reversed = [...attempts].reverse();
  const recentTests = reversed.slice(0, 5).map((a: AttemptItem, i: number) => {
    const prev = reversed[i + 1];
    return {
      id: a.id,
      name: a.test.title,
      score: a.score,
      maxScore: a.test.totalMarks,
      date: relativeDate(a.completedAt),
      accuracy: Math.round(a.percentage),
      trend: (prev ? a.score >= prev.score : true) ? ("up" as const) : ("down" as const),
    };
  });

  // ── Leaderboard — deduplicate to best attempt per user ───────────────────
  const seen = new Set<string>();
  const deduplicated = topAttempts.filter((a: TopAttemptItem) => {
    if (seen.has(a.userId)) return false;
    seen.add(a.userId);
    return true;
  });

  const top5 = deduplicated.slice(0, 5).map((a: TopAttemptItem, i: number) => ({
    rank: i + 1,
    name: a.userId === userId ? "You" : a.user.name ?? "Anonymous",
    avatar: (a.user.name ?? "??").slice(0, 2).toUpperCase(),
    score: a.score,
    isUser: a.userId === userId,
  }));

  const userRankIdx = deduplicated.findIndex((a: TopAttemptItem) => a.userId === userId);
  const userRank = userRankIdx >= 0 ? userRankIdx + 1 : undefined;
  if (userRank && userRank > 5) {
    const ua = deduplicated[userRankIdx];
    top5.push({
      rank: userRank,
      name: "You",
      avatar: (ua.user.name ?? "YO").slice(0, 2).toUpperCase(),
      score: ua.score,
      isUser: true,
    });
  }

  // ── Best score + college predictor ────────────────────────────────────────
  const bestScore = attempts.length
    ? Math.max(...attempts.map((a: AttemptItem) => a.score))
    : 0;

  const CUTOFFS = [
    { name: "AEC Guwahati", cutoff: 420 },
    { name: "JEC Jorhat", cutoff: 380 },
    { name: "BBEC Kokrajhar", cutoff: 340 },
  ];
  const collegePredictor = CUTOFFS.map((c) => ({
    name: c.name,
    cutoff: c.cutoff,
    current: bestScore,
    status:
      bestScore >= c.cutoff
        ? "Safe"
        : bestScore >= c.cutoff - 20
        ? "Close"
        : "Needs Work",
    safe: bestScore >= c.cutoff,
    color:
      bestScore >= c.cutoff
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-amber-600 dark:text-amber-400",
  }));

  // ── Streak ────────────────────────────────────────────────────────────────
  const attemptDates = attempts
    .map((a: AttemptItem) => a.completedAt)
    .filter(Boolean) as Date[];
  const streak = calcStreak(attemptDates);

  // ── Radar ─────────────────────────────────────────────────────────────────
  const radarData = subjects.flatMap((s: SubjectWithTopics) => {
    const prog =
      s.topics.length > 0
        ? Math.round(
            (s.topics.filter((t: TopicWithProgress) => t.progress.some((p: ProgressItem) => p.completed))
              .length /
              s.topics.length) *
              100
          )
        : 0;
    if (s.name === "Physics")
      return [
        { subject: "Mechanics", score: Math.min(100, prog + 8) },
        { subject: "Electro", score: Math.max(0, prog - 8) },
      ];
    if (s.name === "Chemistry")
      return [
        { subject: "Organic", score: Math.max(0, prog - 5) },
        { subject: "Inorganic", score: Math.min(100, prog + 5) },
      ];
    return [
      { subject: "Calculus", score: Math.min(100, prog + 10) },
      { subject: "Algebra", score: Math.min(100, prog + 6) },
    ];
  });

  // ── Badges ────────────────────────────────────────────────────────────────
  const earnedBadges = [
    streak >= 7 && { name: `${streak}-Day Streak`, key: "streak" },
    userRank && userRank <= 50 && { name: `Top ${userRank}`, key: "rank" },
    attempts.length >= 5 && { name: "Test Veteran", key: "veteran" },
    bestScore > 0 && { name: "First Blood", key: "firstblood" },
  ].filter(Boolean) as { name: string; key: string }[];

  return {
    subjects: subjectData,
    scoreHistory,
    recentTests,
    leaderboard: top5,
    collegePredictor,
    radarData,
    earnedBadges,
    streak,
    bestScore,
    totalAttempts: attempts.length,
    userRank,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id as string;
  const tier = ((session.user as any).tier ?? "NORMAL") as
    | "NORMAL"
    | "PREMIUM"
    | "SUPER_PREMIUM";

  const data = await getDashboardData(userId);

  return (
    <DashboardProvider
      userName={session.user.name ?? null}
      userImage={session.user.image ?? null}
      userTier={tier}
      streak={data.streak}
    >
      <DashboardShell
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        tier={tier}
        data={data}
      />
    </DashboardProvider>
  );
}