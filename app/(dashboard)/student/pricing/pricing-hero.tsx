"use client";

import { motion } from "framer-motion";

import { ArrowRight, Badge, Clock, GraduationCap, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";

interface PricingHeroProps {
  userTier?: string;
}

export function PricingHero({ userTier }: PricingHeroProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // CEE 2027 Exam Countdown
  useEffect(() => {
    const calculate = () => {
      const examDate = new Date("2027-05-15T09:00:00+05:30").getTime();
      const now = Date.now();
      const diff = examDate - now;
      
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
      
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      };
    };
    
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isAlreadyUpgraded = userTier && userTier !== "NORMAL";

  return (
    <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-300/20 dark:bg-zinc-700/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6"
          >
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              CEE 2027 in {timeLeft.days}d {timeLeft.hours}h — Start strong today
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]"
          >
            Stop guessing.{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                Start ranking.
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-300/40" viewBox="0 0 200 12" fill="currentColor">
                <path d="M2,10 Q50,2 100,10 T198,10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Join <span className="font-semibold text-zinc-900 dark:text-white">12,847 Assam students</span> who transformed their CEE prep with structured PYQs, smart mocks, and expert guidance.
          </motion.p>

          {/* Social Proof Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-700 dark:text-zinc-300">12k+ students</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-zinc-700 dark:text-zinc-300">4.9/5 average rating</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span className="text-zinc-700 dark:text-zinc-300">200+ rankers in 2026</span>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isAlreadyUpgraded ? (
              <Badge className="px-4 py-2 text-base bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                ✓ You're on {userTier} plan
              </Badge>
            ) : (
              <>
                <Button size="lg" asChild className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 px-8 h-12 text-base font-semibold shadow-lg shadow-zinc-900/20 dark:shadow-white/10">
                  <Link href="/auth/signup?plan=intensive" className="flex items-center gap-2">
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" asChild className="h-12 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  <Link href="#compare">Compare plans</Link>
                </Button>
              </>
            )}
          </motion.div>

          {/* Trust indicators */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-zinc-500 dark:text-zinc-500"
          >
            No credit card required • 7-day money-back guarantee • Cancel anytime
          </motion.p>
        </div>
      </div>
    </section>
  );
}