import { useSession } from "next-auth/react";

export type Tier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

export function useTier(): Tier {
  const { data: session } = useSession();
  return ((session?.user as any)?.tier as Tier) ?? "NORMAL";
}