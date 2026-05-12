import type { NextAuthConfig } from "next-auth";
type Role = "STUDENT" | "ADMIN" | "PARENT";
type SubscriptionTier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isPublic = ["/", "/login", "/register"].includes(
        nextUrl.pathname
      );

      const isApiAuth =
        nextUrl.pathname.startsWith("/api/auth");

      const isStatic =
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.includes(".");

      if (isPublic || isApiAuth || isStatic) {
        return true;
      }

      return isLoggedIn;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "STUDENT";
        token.tier = (user as any).tier ?? "NORMAL";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || token.sub!;
        session.user.role = (token.role as Role) ?? "STUDENT";
        session.user.tier = (token.tier as SubscriptionTier) ?? "NORMAL";
      }

      return session;
    },
  },

  providers: [],
} satisfies NextAuthConfig;