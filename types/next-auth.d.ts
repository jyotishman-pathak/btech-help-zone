import NextAuth, { type DefaultSession } from "next-auth";

export type Role =
  | "STUDENT"
  | "PREMIUM_STUDENT"
  | "ADMIN"
  | "SUPER_ADMIN";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: Role;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}