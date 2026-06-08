import { NextRequest, NextResponse } from "next/server";
import { getIP } from "../../../../lib/ip";
import { checkLimit } from "../../../../lib/ratelimit";
import prisma from "../../../../lib/prisma.client";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limit = await checkLimit("reset", ip as any);
  
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.token || !body?.password) {
    return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
  }

  const { token, password } = body;

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: "Token has expired" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hash },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return NextResponse.json({ success: true, message: "Password updated successfully" });
}
