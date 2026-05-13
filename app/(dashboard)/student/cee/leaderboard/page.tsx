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
    where: { status: "COMPLETED" },
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
