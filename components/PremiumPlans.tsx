// components/sections/CEEPricing.tsx
"use client";


import { Check, Shield, Sparkles, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const plans = [
  {
    name: "Basic",
    price: "₹0",
    period: "forever",
    features: ["1 CEE PYQ paper", "No notes provided", "1 Full Mock Test", "Community doubt board", "Syllabus section"],
    cta: "Start Free",
    href: "/register",
    popular: false,
  },
  {
    name: "Intensive",
    price: "₹399",
    period: "semester",
    features: ["Unlimited CEE PYQs & solutions", "No formula sheets", "5 Mock Tests / month", "Dashboard performance", "Email support"],
    cta: "Unlock Intensive",
    href: "/student/pricing",
    popular: true,
  },
  {
    name: "Elite",
    price: "₹899",
    period: "semester",
    features: ["Everything in Intensive", "Live weekend doubt sessions", "Personalized weekly study planner", "1:1 strategy call with toppers", "Priority doubt resolution (<6 hrs)", "College counseling guide"],
    cta: "Go Elite",
    href: "/student/pricing",
    popular: false,
  },
];

export function CEEPricing() {
  return (
    <section className="relative py-32 bg-[#F7F5FF] dark:bg-[#0D0B1A]">
      {/* Subtle Divider Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-slate-200 dark:bg-slate-800" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Plans that scale with <span className="text-slate-400 dark:text-slate-600">your prep.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Start free. Upgrade when you're serious about cracking CEE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Card className={`relative h-full flex flex-col overflow-visible border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${plan.popular ? "shadow-2xl ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 md:scale-105 z-10 bg-gradient-to-b from-white to-indigo-50/30 dark:from-[#12101F] dark:to-indigo-950/20" : "shadow-sm"}`}>
                {plan.popular && (
                  <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                    <Crown className="w-4 h-4 mr-1 text-amber-400" /> Most Students Choose
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-slate-50">{plan.price}</span>
                    <span className="text-slate-500 dark:text-slate-400">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" /> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    asChild
                    size="lg"
                    className={`w-full ${plan.popular ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/25" : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                  >
                    <Link href={plan.href} className="flex items-center justify-center gap-2">
                      {plan.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure UPI / Netbanking / Cards</span>
          {/* <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 7-day money-back guarantee</span>
          <span className="flex items-center gap-2"><Crown className="w-4 h-4" /> Student ID discounts available</span> */}
        </div>
      </div>
    </section>
  );
}