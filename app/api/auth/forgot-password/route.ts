import { NextRequest, NextResponse } from "next/server";
import { getIP } from "../../../../lib/ip";
import { checkLimit } from "../../../../lib/ratelimit";
import prisma from "../../../../lib/prisma.client";
import { sendMail } from "../../../../lib/mail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limit = await checkLimit("reset", ip);
  
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });

  if (!user) {
    // For security reasons, we do not reveal if a user exists
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
  }

  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Hello ${user.name || "Student"},</h2>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#18181b;color:#fff;text-decoration:none;border-radius:5px;margin-top:10px;margin-bottom:10px;">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  });

  return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
}
