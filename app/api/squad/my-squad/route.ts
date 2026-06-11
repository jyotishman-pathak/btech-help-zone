import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        squad: {
          include: {
            members: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.squad) {
      return NextResponse.json({ squad: null });
    }

    return NextResponse.json({ squad: user.squad });
  } catch (error: any) {
    console.error("Fetch squad error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
