import { DefaultSession } from "next-auth";
import { SubscriptionTier } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tier: SubscriptionTier;
    } & DefaultSession["user"];
  }

  interface User {
    tier?: SubscriptionTier;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tier?: SubscriptionTier;
  }
}