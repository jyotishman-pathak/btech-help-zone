import { redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";
import { LeaderboardClient } from "../../../../../components/dashboard/leaderboard-client";

export const metadata = {
  title: "Leaderboard | CEE HelpZone",
  description: "Global Leaderboard for Assam CEE aspirants.",
};

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Initial SSR fetch for fast loading, mimicking the API route logic
  const attempts = await prisma.mockTestAttempt.findMany({
    where: { status: "SUBMITTED" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { score: "desc" },
  });

  const seenUsers = new Set<string>();
  const leaderboardRaw: any[] = [];

  for (const attempt of attempts) {
    if (!seenUsers.has(attempt.userId)) {
      seenUsers.add(attempt.userId);
      leaderboardRaw.push({
        userId: attempt.userId,
        name: attempt.user?.name || "Anonymous Student",
        image: attempt.user?.image,
        score: attempt.score,
        date: attempt.completedAt ? attempt.completedAt.toISOString() : new Date().toISOString(),
      });
    }
  }

  // Fallback dummy data for empty states
  if (leaderboardRaw.length === 0) {
    leaderboardRaw.push(
      { userId: "dummy1", name: "Jyotishman Pathak", image: null, score: 280, date: new Date().toISOString() },
      { userId: "dummy2", name: "Rahul Sharma", image: null, score: 265, date: new Date().toISOString() },
      { userId: "dummy3", name: "Priya Das", image: null, score: 240, date: new Date().toISOString() },
      { userId: "dummy4", name: "Arunav Bora", image: null, score: 210, date: new Date().toISOString() },
      { userId: "dummy5", name: "Sneha Kalita", image: null, score: 195, date: new Date().toISOString() }
    );
  }

  leaderboardRaw.sort((a, b) => b.score - a.score);
  const top100 = leaderboardRaw.slice(0, 100);

  const userRankIdx = leaderboardRaw.findIndex((a) => a.userId === session.user.id);
  const userRank = userRankIdx >= 0 ? userRankIdx + 1 : null;
  const userScore = userRankIdx >= 0 ? leaderboardRaw[userRankIdx].score : null;

  const serializedLeaderboard = top100.map((player, idx) => ({
    ...player,
    rank: idx + 1,
  }));

  return (
    <LeaderboardClient
      leaderboard={serializedLeaderboard}
      currentUser={{ rank: userRank, score: userScore }}
    />
  );
}
