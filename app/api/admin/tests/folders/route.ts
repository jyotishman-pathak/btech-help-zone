import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma.client";

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

export async function GET() {
  const session = (await auth()) as Session | null;

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const folders = await prisma.mockTestFolder.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { tests: true }
        }
      }
    });

    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = (await auth()) as Session | null;

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    // Get highest order to append
    const lastFolder = await prisma.mockTestFolder.findFirst({
      orderBy: { order: "desc" },
    });

    const folder = await prisma.mockTestFolder.create({
      data: {
        name,
        description,
        order: lastFolder ? lastFolder.order + 1 : 0,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
