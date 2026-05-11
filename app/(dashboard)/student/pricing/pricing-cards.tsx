"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Sparkles, Zap, ArrowRight, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../@/components/ui/label";
import { Button } from "../../../../@/components/ui/button";
import { Badge } from "../../../../components/ui/badge";



interface PricingCardsProps {
  userTier?: string;
}

const plans = {
  semester: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "3 CEE PYQ sets / month",
        "Basic PCM formula sheets",
        "1 Full Mock Test / month",
        "Community doubt board",
        "Syllabus progress tracker",
      ],
      limitations: ["No video explanations", "No rank predictor", "No priority support"],
      cta: "Start Free",
      href: "/auth/signup",
      popular: false,
      icon: null,
      color: "zinc",
    },
    {
      name: "Intensive",
      price: "₹399",
      period: "semester",
      description: "Most students choose this",
      features: [
        "✓ Unlimited CEE PYQs with step-by-step solutions",
        "✓ Advanced formula sheets + video explanations",
        "✓ 5 Mock Tests / month with All-Assam rank predictor",
        "✓ Performance analytics + weak topic alerts",
        "✓ Email support (<24 hrs response)",
        "✓ Downloadable revision notes",
      ],
      limitations: [],
      cta: "Start 7-Day Free Trial",
      href: "/checkout/intensive",
      popular: true,
      icon: <Zap className="w-5 h-5" />,
      color: "amber",
    },
    {
      name: "Elite",
      price: "₹899",
      period: "semester",
      description: "For serious rankers",
      features: [
        "✓ Everything in Intensive",
        "✓ Live weekend doubt sessions (Sat-Sun, 7-9 PM)",
        "✓ Personalized weekly study planner (AI + expert)",
        "✓ 1:1 strategy call with CEE toppers (30 mins)",
        "✓ Priority doubt resolution (<6 hrs)",
        "✓ College counseling guide + cutoff analysis",
        "✓ Early access to new features",
      ],
      limitations: [],
      cta: "Go Elite",
      href: "/checkout/elite",
      popular: false,
      icon: <Crown className="w-5 h-5" />,
      color: "violet",
    },
  ],
  monthly: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "3 CEE PYQ sets / month",
        "Basic PCM formula sheets",
        "1 Full Mock Test / month",
        "Community doubt board",
        "Syllabus progress tracker",
      ],
      limitations: ["No video explanations", "No rank predictor", "No priority support"],
      cta: "Start Free",
      href: "/auth/signup",
      popular: false,
      icon: null,
      color: "zinc",
    },
    {
      name: "Intensive",
      price: "₹149",
      period: "month",
      description: "Flexible monthly access",
      features: [
        "✓ Unlimited CEE PYQs with step-by-step solutions",
        "✓ Advanced formula sheets + video explanations",
        "✓ 5 Mock Tests / month with All-Assam rank predictor",
        "✓ Performance analytics + weak topic alerts",
        "✓ Email support (<24 hrs response)",
        "✓ Downloadable revision notes",
      ],
      limitations: [],
      cta: "Start 7-Day Free Trial",
      href: "/checkout/intensive?billing=monthly",
      popular: true,
      icon: <Zap className="w-5 h-5" />,
      color: "amber",
    },
    {
      name: "Elite",
      price: "₹349",
      period: "month",
      description: "Premium support, month-to-month",
      features: [
        "✓ Everything in Intensive",
        "✓ Live weekend doubt sessions (Sat-Sun, 7-9 PM)",
        "✓ Personalized weekly study planner (AI + expert)",
        "✓ 1:1 strategy call with CEE toppers (30 mins)",
        "✓ Priority doubt resolution (<6 hrs)",
        "✓ College counseling guide + cutoff analysis",
        "✓ Early access to new features",
      ],
      limitations: [],
      cta: "Go Elite",
      href: "/checkout/elite?billing=monthly",
      popular: false,
      icon: <Crown className="w-5 h-5" />,
      color: "violet",
    },
  ],
};

export function PricingCards({ userTier }: PricingCardsProps) {
  const [billingPeriod, setBillingPeriod] = useState<"semester" | "monthly">("semester");
  const isAlreadyUpgraded = userTier && userTier !== "NORMAL";

  const currentPlans = plans[billingPeriod];

  return (
    <section id="plans" className="py-16 md:py-24 bg-zinc-50/50 dark:bg-zinc-900/30">
      <div className="container mx-auto px-4">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label htmlFor="billing-toggle" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Billing:
          </Label>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-zinc-800">
            <Button
              variant={billingPeriod === "semester" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingPeriod("semester")}
              className={`rounded-full px-4 h-8 text-sm font-medium ${
                billingPeriod === "semester"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Semester
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Save 25%
              </Badge>
            </Button>
            <Button
              variant={billingPeriod === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-full px-4 h-8 text-sm font-medium ${
                billingPeriod === "monthly"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Monthly
            </Button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          <AnimatePresence mode="wait">
            {currentPlans.map((plan, i) => {
              const isPopular = plan.popular;
              const isCurrentTier = userTier === plan.name.toUpperCase();
              
              return (
                <motion.div
                  key={`${plan.name}-${billingPeriod}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={isPopular ? "md:-mt-4 md:mb-4" : ""}
                >
                  <Card
                    className={`relative h-full border transition-all duration-300 ${
                      isPopular
                        ? "border-amber-300 dark:border-amber-700 shadow-xl shadow-amber-500/10 dark:shadow-amber-900/20 ring-1 ring-amber-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
                    } ${isCurrentTier ? "ring-2 ring-emerald-500" : ""} bg-white dark:bg-zinc-900`}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm border-0 px-3 py-1 text-xs font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" /> Most Popular
                      </Badge>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrentTier && (
                      <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-0 text-xs">
                        Your Plan
                      </Badge>
                    )}

                    <CardHeader className={`pb-4 ${isPopular ? "pt-8" : ""}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {plan.icon && (
                          <span className={`p-1.5 rounded-lg ${
                            plan.color === "amber" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                            plan.color === "violet" ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" :
                            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}>
                            {plan.icon}
                          </span>
                        )}
                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white">
                          {plan.name}
                        </CardTitle>
                      </div>
                      
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 min-h-[40px]">
                        {plan.description}
                      </p>
                      
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-black text-zinc-900 dark:text-white">
                          {plan.price}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">/{plan.period}</span>
                      </div>
                      
                      {billingPeriod === "semester" && plan.name !== "Free" && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                          Equivalent to ₹{plan.name === "Intensive" ? "66" : "150"}/month
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Features */}
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-sm">
                            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                              feature.startsWith("✓") ? "text-emerald-500" : "text-zinc-400"
                            }`} />
                            <span className={`text-zinc-600 dark:text-zinc-400 ${
                              feature.startsWith("✓") ? "font-medium text-zinc-700 dark:text-zinc-300" : ""
                            }`}>
                              {feature.replace("✓ ", "")}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Limitations (Free plan only) */}
                      {plan.limitations.length > 0 && (
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-2">
                            Not included:
                          </p>
                          <ul className="space-y-1.5">
                            {plan.limitations.map((limitation) => (
                              <li key={limitation} className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-600">
                                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2">
                      {isCurrentTier ? (
                        <Button
                          disabled
                          size="lg"
                          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold cursor-default"
                        >
                          ✓ Active Plan
                        </Button>
                      ) : (
                        <Button
                          asChild
                          size="lg"
                          className={`w-full h-12 font-semibold transition-all ${
                            isPopular
                              ? "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-lg shadow-zinc-900/20 dark:shadow-white/10"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <Link href={plan.href} className="flex items-center justify-center gap-2">
                            {plan.cta}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </CardFooter>

                    {/* Trust badge for paid plans */}
                    {!isCurrentTier && plan.name !== "Free" && (
                      <div className="px-6 pb-6 pt-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 justify-center">
                          <Shield className="w-3.5 h-3.5" />
                          <span>7-day money-back guarantee</span>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Student Discount Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
             Have a valid student ID?{" "}
            <Link href="/contact?subject=student-discount" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
              Contact us for an additional 15% off
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}