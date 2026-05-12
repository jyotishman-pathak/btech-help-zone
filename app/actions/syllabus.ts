"use server";

import { revalidatePath } from "next/cache";
import prisma from "../../lib/prisma.client";
import { auth } from "../../auth";

export async function toggleTopicProgress(topicId: string, completed: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Use upsert to handle both creation and updates
    await prisma.userTopicProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        topicId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    revalidatePath("/student");
    revalidatePath("/cee/syllabus");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle topic progress:", error);
    return { success: false, error: "Failed to update progress" };
  }
}
