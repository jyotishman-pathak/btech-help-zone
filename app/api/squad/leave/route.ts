import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { squad: { include: { members: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.squadId) {
      return NextResponse.json({ error: "You are not in a squad" }, { status: 400 });
    }

    const squad = user.squad;

    // Disconnect user from squad
    await prisma.user.update({
      where: { id: user.id },
      data: { squadId: null },
    });

    // If it was the last member, maybe we can delete the squad or mark it inactive
    if (squad && squad.members.length === 1) {
      await prisma.squad.update({
        where: { id: squad.id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Squad leave error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
