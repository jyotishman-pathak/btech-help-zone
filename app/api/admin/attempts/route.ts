// app/api/admin/attempts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

type Session = {
  user?: {
    role?: string;
    id?: string;
  };
};

function isAdmin(session: Session | null) {
  return (
    session?.user?.role &&
    ["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
  );
}

export async function GET(req: NextRequest) {
  const session = (await auth()) as Session | null;

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const testId = searchParams.get("testId") || undefined;
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;
  const isExport = searchParams.get("export") === "true";

  // Build where clause
  const where: any = {
    test: {
      deletedAt: null,
    },
  };

  if (testId && testId !== "all") {
    where.testId = testId;
  }

  if (search) {
    where.OR = [
      {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        user: {
          email: { contains: search, mode: "insensitive" },
        },
      },
      {
        test: {
          title: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  const [attempts, total] = await Promise.all([
    prisma.mockTestAttempt.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        test: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            duration: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      ...(isExport ? {} : { take: limit, skip }),
    }),
    prisma.mockTestAttempt.count({ where }),
  ]);

  // Fetch all active mock tests for the filter dropdown
  const tests = await prisma.mockTest.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return NextResponse.json({
    attempts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    tests,
  });
}
