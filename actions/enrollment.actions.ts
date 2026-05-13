"use server";

import { auth } from "../auth";
import prisma from "../lib/prisma.client";



export async function enrollInFreeBatch(batchId: string, leadData: Record<string, string>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch?.isFree) throw new Error("Not a free batch");

  // Check not already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_batchId: { userId: session.user.id as string, batchId } },
  });
  if (existing) return existing;

  // Save lead form data + create enrollment
  const [enrollment] = await prisma.$transaction([
    prisma.enrollment.create({
      data: {
        userId: session.user.id as string,
        batchId,
        status: "ACTIVE",
        source: "lead_form",
      },
    }),
    prisma.leadSubmission.create({
      data: {
        batchId,
        userId: session.user.id as string,
        data: leadData,
      },
    }),
  ]);

  return enrollment;
}

export async function checkEnrollment(batchId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.enrollment.findUnique({
    where: { userId_batchId: { userId: session.user.id as string, batchId } },
  });
}