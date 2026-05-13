"use client";

import { Check, Lock, Users, Zap, Crown, Star } from "lucide-react";

import Link from "next/link";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface BatchCardProps {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  isFree: boolean;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  bannerUrl?: string | null;
  features: Array<{ text: string }>;
  enrollmentsCount: number;
  isEnrolled: boolean;
  type: string;
}

const TYPE_COLOR: Record<string, string> = {
  CEE_PREP:    "bg-blue-500",
  BTECH:       "bg-violet-500",
  COMPETITIVE: "bg-amber-500",
  FREE:        "bg-emerald-500",
};

const BADGE_STYLE: Record<string, string> = {
  "Most Popular": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  "Bestseller":   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  "New":          "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

export function BatchCard({
  name, slug, tagline, isFree, price, originalPrice,
  badge, bannerUrl, features, enrollmentsCount, isEnrolled, type,
}: BatchCardProps) {
  return (
    <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
      {/* Color strip */}
      <div className={cn("h-1.5 w-full", TYPE_COLOR[type] ?? "bg-zinc-400")} />

      {/* Banner */}
      {bannerUrl ? (
        <div className="h-36 overflow-hidden">
          <img src={bannerUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className={cn("h-36 flex items-center justify-center", "bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900")}>
          <span className="text-4xl font-black text-zinc-300 dark:text-zinc-700">{name.slice(0, 2)}</span>
        </div>
      )}

      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            {badge && (
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", BADGE_STYLE[badge] ?? "bg-zinc-100 text-zinc-600")}>
                {badge}
              </span>
            )}
            {isEnrolled && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ml-auto">
                ✓ Enrolled
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{name}</h3>
          {tagline && <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{tagline}</p>}
        </div>

        {/* Features */}
        <ul className="space-y-1.5">
          {features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {f.text}
            </li>
          ))}
          {features.length > 4 && (
            <li className="text-xs text-zinc-400">+{features.length - 4} more features</li>
          )}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            {isFree ? (
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">FREE</span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  ₹{(price / 100).toLocaleString("en-IN")}
                </span>
                {originalPrice && (
                  <span className="text-sm line-through text-zinc-400">
                    ₹{(originalPrice / 100).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            )}
            <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" /> {enrollmentsCount.toLocaleString()} enrolled
            </p>
          </div>

          <Link href={`/batches/${slug}`}>
            <Button size="sm" className={cn(
              "h-9 text-sm",
              isEnrolled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
            )}>
              {isEnrolled ? "Continue" : "View"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}