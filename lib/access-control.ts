import { auth } from "../auth";
import prisma from "./prisma.client";


export async function canAccessBatch(batchId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  if (["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) return true;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_batchId: { userId: session.user.id as string, batchId },
      status: "ACTIVE",
    },
  });

  if (!enrollment) return false;
  if (enrollment.expiresAt && enrollment.expiresAt < new Date()) return false;
  return true;
}