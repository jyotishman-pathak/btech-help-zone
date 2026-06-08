import { NextRequest, NextResponse } from "next/server";
import { getIP } from "../../../../lib/ip";
import { checkLimit } from "../../../../lib/ratelimit";
import prisma from "../../../../lib/prisma.client";
import { sendMail } from "../../../../lib/mail";
import { auth } from "../../../../auth";

export async function POST(req: NextRequest) {
  const ip = getIP(req);

  const limit = await checkLimit("auth", ip);
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

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    const session = await auth();
    if (!session || session.user?.id !== existing.id) {
      return NextResponse.json({ error: "Account with this email already exists" }, { status: 409 });
    }
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete old tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: otp,
      expires,
    },
  });

  await sendMail({
    to: email,
    subject: "Your Verification Code",
    html: `
      <h2>Welcome to CEE  Help Zone!</h2>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });

  return NextResponse.json({ success: true, message: "OTP sent successfully" });
}
