import type { NextAuthConfig } from "next-auth";

type Role =
  | "STUDENT"
  | "PREMIUM_STUDENT"
  | "ADMIN"
  | "SUPER_ADMIN";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
   authorized({ auth, request: { nextUrl } }) {
  const isLoggedIn = !!auth?.user;
  const role = auth?.user?.role;

  const pathname = nextUrl.pathname;

  const isPublic = ["/", "/login", "/register"].includes(
    pathname
  );

  const isApiAuth =
    pathname.startsWith("/api/auth");

  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  if (isPublic || isApiAuth || isStatic) {
    return true;
  }

  // SUPER ADMIN routes
  if (pathname.startsWith("/super-admin")) {
    return isLoggedIn && role === "SUPER_ADMIN";
  }

  // ADMIN routes
  if (pathname.startsWith("/admin")) {
    return (
      isLoggedIn &&
      (role === "ADMIN" ||
        role === "SUPER_ADMIN")
    );
  }

  // Protected routes
  return isLoggedIn;
},
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "STUDENT";

        // tier removed
        // access now comes from Enrollment table
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.id as string) || token.sub!;

        session.user.role =
          (token.role as Role) ?? "STUDENT";

        // tier removed
      }

      return session;
    },
  },

  providers: [],
} satisfies NextAuthConfig;