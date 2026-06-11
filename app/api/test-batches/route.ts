import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma.client";

export async function GET() {
  try {
    const allBatches = await prisma.batch.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ allBatches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
