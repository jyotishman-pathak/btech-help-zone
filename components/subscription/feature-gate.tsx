"use client";

import { ReactNode } from "react";
import { Lock, Crown, Zap } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

type Tier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";
const TIER_WEIGHT = { NORMAL: 0, PREMIUM: 1, SUPER_PREMIUM: 2 };

interface FeatureGateProps {
  requiredTier: Tier;
  currentTier?: Tier;
  children: ReactNode;
  fallback?: "hide" | "blur" | "upsell";
  upsellTitle?: string;
  upsellDescription?: string;
}

export function FeatureGate({
  requiredTier,
  currentTier = "NORMAL",
  children,
  fallback = "upsell",
  upsellTitle,
  upsellDescription,
}: FeatureGateProps) {
  const hasAccess = TIER_WEIGHT[currentTier] >= TIER_WEIGHT[requiredTier];
  if (hasAccess) return <>{children}</>;

  if (fallback === "hide") return null;

  if (fallback === "blur") {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-40">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white shadow-xl border rounded-full px-5 py-2.5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold">{requiredTier} Required</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 flex flex-col items-center text-center gap-3 border-dashed border-2 bg-slate-50/50">
      {requiredTier === "SUPER_PREMIUM" ? (
        <Crown className="w-8 h-8 text-amber-500" />
      ) : (
        <Zap className="w-8 h-8 text-indigo-500" />
      )}
      <h3 className="font-bold text-slate-900">{upsellTitle || `${requiredTier} Feature`}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {upsellDescription || `Upgrade to ${requiredTier} to unlock this.`}
      </p>
      <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
        <Lock className="w-3 h-3 mr-2" /> Upgrade Now
      </Button>
    </Card>
  );
}