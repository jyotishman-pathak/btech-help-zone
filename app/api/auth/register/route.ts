import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getIP } from "../../../../lib/ip";
import { checkLimit } from "../../../../lib/ratelimit";
import prisma from "../../../../lib/prisma.client";

export async function POST(req: NextRequest) {
  const ip = getIP(req);

  // ── Rate limit (second layer after middleware) ────────────────────────────
  const limit = await checkLimit("register", ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "rate_limit_exceeded",
        message: "Too many registrations from this IP. Try again later.",
        retryAfter: limit.retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { name, email, password, otp } = body;

  // ── Input validation ────────────────────────────────────────────────────
  if (!email || !password || !name || !otp) {
    return NextResponse.json({ error: "Name, email, password and OTP are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  if (name.length < 2 || name.length > 60) {
    return NextResponse.json({ error: "Name must be 2–60 characters" }, { status: 400 });
  }

  // ── Check existing user ─────────────────────────────────────────────────
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  });

  if (existing) {
    // Don't reveal if email exists — timing-safe response
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 409 });
  }

  // ── Verify OTP ─────────────────────────────────────────────────────────
  const cleanOtp = otp.trim();
  const verificationRecord = await prisma.verificationToken.findFirst({
    where: { identifier: email.toLowerCase().trim(), token: cleanOtp },
  });

  if (!verificationRecord) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  if (verificationRecord.expires < new Date()) {
    return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
  }

  // Delete the token so it can't be used again
  await prisma.verificationToken.delete({
    where: { token: cleanOtp },
  });

  // ── Create user ─────────────────────────────────────────────────────────
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hash,
      role: "STUDENT",
      emailVerified: new Date(),
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}