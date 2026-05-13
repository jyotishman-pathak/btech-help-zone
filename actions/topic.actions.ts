"use server";


import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import prisma from "../lib/prisma.client";

export async function toggleTopicCompletion(topicId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id as string;

    const existing = await prisma.userTopicProgress.findUnique({
        where: { userId_topicId: { userId, topicId } },
    });

    let newCompleted: boolean;
    if (existing) {
        const updated = await prisma.userTopicProgress.update({
            where: { id: existing.id },
            data: {
                completed: !existing.completed,
                completedAt: !existing.completed ? new Date() : null,
            },
        });
        newCompleted = updated.completed;
    } else {
        await prisma.userTopicProgress.create({
            data: { userId, topicId, completed: true, completedAt: new Date() },
        });
        newCompleted = true;
    }

    revalidatePath("/student");
    return newCompleted;
}