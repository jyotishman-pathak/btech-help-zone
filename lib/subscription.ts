import { auth } from "../auth";


export type Tier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

const TIER_WEIGHT: Record<Tier, number> = {
  NORMAL: 0,
  PREMIUM: 1,
  SUPER_PREMIUM: 2,
};

export async function getUserTier(): Promise<Tier> {
  const session = await auth();
  if (!session?.user?.id) return "NORMAL";

  // session now has tier from the session callback
  return ((session.user as any).tier as Tier) ?? "NORMAL";
}

export function hasAccess(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_WEIGHT[userTier] >= TIER_WEIGHT[requiredTier];
}

export const Features = {
  MOCK_TEST_LIMIT: (tier: Tier): number =>
    ({ NORMAL: 1, PREMIUM: 15, SUPER_PREMIUM: Infinity }[tier] ?? 0),

  ANALYTICS: (tier: Tier): boolean => tier !== "NORMAL",

  DEEP_ANALYTICS: (tier: Tier): boolean => tier === "SUPER_PREMIUM",

  COLLEGE_PREDICTOR: (tier: Tier): boolean => tier !== "NORMAL",

  LEADERBOARD: (tier: Tier): boolean => tier !== "NORMAL",

  BATTLE_ARENA: (tier: Tier): boolean => tier === "SUPER_PREMIUM",

  UNLIMITED_MOCKS: (tier: Tier): boolean => tier === "SUPER_PREMIUM",
} as const;