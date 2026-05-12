import NextAuth, { type DefaultSession } from "next-auth"
type Role = "STUDENT" | "ADMIN" | "PARENT";
type SubscriptionTier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

export type ExtendedUser = DefaultSession["user"] & {
  id: string
  role: Role
  tier: SubscriptionTier
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}