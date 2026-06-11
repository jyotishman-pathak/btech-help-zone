import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode || inviteCode.trim().length === 0) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.squadId) {
      return NextResponse.json(
        { error: "You are already in a squad. Leave it first to join a new one." },
        { status: 400 }
      );
    }

    // Find the squad
    const squad = await prisma.squad.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!squad) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    if (!squad.isActive) {
      return NextResponse.json({ error: "This squad is no longer active" }, { status: 400 });
    }

    // Check member limit (Max 4)
    if (squad._count.members >= 4) {
      return NextResponse.json({ error: "This squad is already full (max 4 members)" }, { status: 400 });
    }

    // Join the squad
    await prisma.user.update({
      where: { id: user.id },
      data: { squadId: squad.id },
    });

    return NextResponse.json({ success: true, squadId: squad.id });
  } catch (error: any) {
    console.error("Squad join error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
