"use server";

import prisma from "../../lib/prisma.client";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string; phone?: string; school?: string; district?: string; email?: string; otp?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found" };

  const updates: any = {
    name: data.name,
    phone: data.phone,
    school: data.school,
    district: data.district,
  };

  if (data.email && (data.email !== user.email || !user.emailVerified)) {
    if (!data.otp) return { error: "OTP is required to change email" };
    
    const cleanOtp = data.otp.trim();
    const emailToVerify = data.email.toLowerCase().trim();
    
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: { identifier: emailToVerify, token: cleanOtp },
    });
    
    if (!verificationRecord) return { error: "Invalid OTP" };
    if (verificationRecord.expires < new Date()) return { error: "OTP has expired" };
    
    const taken = await prisma.user.findUnique({ where: { email: emailToVerify } });
    if (taken && taken.id !== user.id) return { error: "Email is already taken" };
    
    updates.email = emailToVerify;
    updates.emailVerified = new Date();
    
    await prisma.verificationToken.delete({ where: { token: cleanOtp } });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updates
  });
  
  revalidatePath("/student/settings");
  revalidatePath("/student");
  return { success: true };
}
