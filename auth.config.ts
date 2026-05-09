// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = ["/login", "/register", "/"].includes(nextUrl.pathname);
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isStatic =
        nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".");

      if (isPublic || isApiAuth || isStatic) return true;
      return isLoggedIn;
    },

    // ✅ Add these — edge-safe, no Prisma
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tier = (user as any).tier ?? "NORMAL";
      }
      return token;
    },
    session({ session, token }) {
      if (token.role) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;