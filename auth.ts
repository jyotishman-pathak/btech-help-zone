import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import prisma from "./lib/prisma.client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [Google, Credentials({ /* ... */ })],
  callbacks: {
    ...authConfig.callbacks, // ✅ inherits jwt + authorized
    async session({ session, token }) {
      // Full Prisma fetch only happens server-side, never in Edge
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, name: true, email: true, image: true, role: true, tier: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.image;
          (session.user as any).role = dbUser.role;
          (session.user as any).tier = dbUser.tier;
        }
      }
      return session;
    },
  },
});