import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { title, subjectId, year, requiredTier, fileUrl } =
    await req.json();

  if (!title || !fileUrl || !subjectId) {
    return NextResponse.json(
      {
        error: "title, subjectId, and fileUrl are required",
      },
      { status: 400 }
    );
  }

  const material = await prisma.studyMaterial.create({
    data: {
      title,
      type: "PYQ",
      fileUrl,
      subjectId,
      year: year ? parseInt(year) : null,
      requiredTier: requiredTier ?? "NORMAL",
      uploadedBy: session.user.id as string,
      status: "published",
    },

    include: {
      subject: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(material, { status: 201 });
}

export async function GET() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const pyqs = await prisma.studyMaterial.findMany({
    where: {
      type: "PYQ",
    },

    include: {
      subject: {
        select: {
          name: true,
        },
      },
    },

    orderBy: [
      {
        year: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return NextResponse.json(pyqs);
}