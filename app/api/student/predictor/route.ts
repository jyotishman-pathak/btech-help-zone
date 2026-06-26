// app/api/student/predictor/route.ts
//
// Matches the fetch call already in your page:
//   /api/student/predictor?mode=${mode}&value=${value}&category=${category}
//
// Drop this file at that exact path in your Next.js app (app router).
// Adjust the two import paths below to wherever you put the other two files.

import { NextRequest, NextResponse } from "next/server";

import { predict, listCategories, type Mode } from "../../../../lib/cee-predictor-engine";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("mode") as Mode | null;
  const valueRaw = searchParams.get("value");
  const category = searchParams.get("category");

  if (mode !== "rank" && mode !== "marks") {
    return NextResponse.json(
      { error: "mode must be 'rank' or 'marks'." },
      { status: 400 }
    );
  }

  const value = valueRaw ? parseInt(valueRaw, 10) : NaN;
  if (!valueRaw || Number.isNaN(value) || value <= 0) {
    return NextResponse.json(
      { error: `Enter a valid ${mode}.` },
      { status: 400 }
    );
  }

  if (!category || !listCategories().includes(category)) {
    return NextResponse.json(
      { error: `Unknown category. Valid: ${listCategories().join(", ")}` },
      { status: 400 }
    );
  }

  const results = predict(mode, value, category);
  return NextResponse.json({ results });
}