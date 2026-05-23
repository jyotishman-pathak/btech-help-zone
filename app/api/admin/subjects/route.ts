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
    include: { topics: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(subjects);
}

export async function POST(req: Request) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN")
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );

  const { name, weightage } = await req.json();

  const code = name.toUpperCase().substring(0, 3);

  const subject = await prisma.subject.create({
    data: {
      name,
      code,
      category: "CEE",
      weightage: weightage || 0,
    },
    include: { topics: true },
  });

  return NextResponse.json(subject);
}