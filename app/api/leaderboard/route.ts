import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma.client";
import { auth } from "../../../auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Fetch all completed attempts with user info
    const attempts = await prisma.mockTestAttempt.findMany({
      where: {
        status: "COMPLETED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
    });

    // Deduplicate to only keep the highest score per user
    const seenUsers = new Set<string>();
    const leaderboard: any[] = [];

    for (const attempt of attempts) {
      if (!seenUsers.has(attempt.userId)) {
        seenUsers.add(attempt.userId);
        leaderboard.push({
          userId: attempt.userId,
          name: attempt.user?.name || "Anonymous Student",
          image: attempt.user?.image,
          score: attempt.score,
          date: attempt.completedAt,
        });
      }
    }

    // Sort and limit
    leaderboard.sort((a, b) => b.score - a.score);
    const topPlayers = leaderboard.slice(0, limit);

    // Find current user's rank
    const userRankIdx = leaderboard.findIndex((a) => a.userId === session.user.id);
    const userRank = userRankIdx >= 0 ? userRankIdx + 1 : null;
    const userScore = userRankIdx >= 0 ? leaderboard[userRankIdx].score : null;

    return NextResponse.json({
      leaderboard: topPlayers.map((player, idx) => ({
        ...player,
        rank: idx + 1,
      })),
      currentUser: {
        rank: userRank,
        score: userScore,
      },
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
