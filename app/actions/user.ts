"use server";

import prisma from "../../lib/prisma.client";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string; phone?: string; school?: string; district?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      phone: data.phone,
      school: data.school,
      district: data.district,
    }
  });
  
  revalidatePath("/student/settings");
  revalidatePath("/student");
  return { success: true };
}
