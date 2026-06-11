import { NextResponse } from "next/server";

import Papa from "papaparse";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json({ error: "Invalid CSV format", details: parsed.errors }, { status: 400 });
    }

    const rows = parsed.data as any[];

    let processedCount = 0;

    for (const row of rows) {
      const {
        CollegeName,
        CollegeShortName,
        CollegeType,
        CollegeState,
        BranchName,
        Category,
        Year,
        Round,
        ClosingRank,
        OpeningRank
      } = row;

      if (!CollegeName || !BranchName || !Category || !ClosingRank) {
        continue; // Skip invalid rows
      }

      const college = await prisma.college.upsert({
        where: { name: CollegeName },
        update: {
          shortName: CollegeShortName || null,
          type: CollegeType || null,
          state: CollegeState || null,
        },
        create: {
          name: CollegeName,
          shortName: CollegeShortName || null,
          type: CollegeType || null,
          state: CollegeState || null,
        }
      });

      await prisma.cutoff.create({
        data: {
          collegeId: college.id,
          branchName: BranchName,
          category: Category,
          year: parseInt(Year) || new Date().getFullYear(),
          round: parseInt(Round) || 1,
          closingRank: parseInt(ClosingRank),
          openingRank: OpeningRank ? parseInt(OpeningRank) : null,
        }
      });

      processedCount++;
    }

    return NextResponse.json({ message: `Successfully processed ${processedCount} cutoffs.` });
  } catch (error: any) {
    console.error("Predictor upload error:", error);
    return NextResponse.json({ error: "Failed to upload predictor data" }, { status: 500 });
  }
}
