import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasPredictor: true, role: true }
    });

    // Check if user has premium predictor access (or is an admin)
    if (
      !dbUser?.hasPredictor &&
      dbUser?.role !== "ADMIN" &&
      dbUser?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Premium feature required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rankStr = searchParams.get("rank");
    const category = searchParams.get("category");

    if (!rankStr || !category) {
      return NextResponse.json({ error: "Rank and Category are required" }, { status: 400 });
    }

    const userRank = parseInt(rankStr);

    if (isNaN(userRank) || userRank <= 0) {
      return NextResponse.json({ error: "Invalid rank" }, { status: 400 });
    }

    // Fetch cutoffs for the category where user has a chance (rank <= closingRank + 500)
    const cutoffs = await prisma.cutoff.findMany({
      where: {
        category,
        closingRank: {
          gte: userRank - 500, // Show even if they easily clear it (their rank is lower than closing)
        }
      },
      include: {
        college: true
      },
      orderBy: {
        closingRank: 'asc'
      }
    });

    // Map and calculate probability
    const results = cutoffs.map(c => {
      let probability = "Tough";
      let color = "red";

      if (userRank <= c.closingRank) {
        probability = "High Chance (Safe)";
        color = "green";
      } else if (userRank <= c.closingRank + 200) {
        probability = "Moderate Chance (Borderline)";
        color = "yellow";
      }

      return {
        id: c.id,
        collegeName: c.college.name,
        collegeShortName: c.college.shortName,
        branchName: c.branchName,
        closingRank: c.closingRank,
        openingRank: c.openingRank,
        probability,
        color
      };
    });

    // Filter out Tough if rank is way higher
    const filteredResults = results.filter(r =>
      r.probability !== "Tough" || (r.probability === "Tough" && userRank <= r.closingRank + 500)
    );

    return NextResponse.json({ results: filteredResults });
  } catch (error) {
    console.error("Predictor API Error:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}
