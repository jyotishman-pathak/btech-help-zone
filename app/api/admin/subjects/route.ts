import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN")
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(subjects);
}