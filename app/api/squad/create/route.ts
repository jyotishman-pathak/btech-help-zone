import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Squad name is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.squadId) {
      return NextResponse.json(
        { error: "You are already in a squad. Leave it first to create a new one." },
        { status: 400 }
      );
    }

    const inviteCode = generateInviteCode();

    const squad = await prisma.squad.create({
      data: {
        name,
        inviteCode,
        members: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json({ squad });
  } catch (error: any) {
    console.error("Squad creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
