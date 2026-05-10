// components/sections/CEEAdvantages.tsx
"use client";


import { FileCheck, FlaskConical, Timer, TrendingUp, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

const advantages = [
  { icon: FileCheck, title: "10+ Years CEE PYQs", desc: "Official papers mapped to Assam CEE syllabus with step-by-step solutions." },
  { icon: FlaskConical, title: "PCM Short Notes", desc: "High-yield formula sheets & concept summaries for quick revision." },
  { icon: Timer, title: "Timed Mock Tests", desc: "CEE-pattern simulations with auto-grading, speed analysis & rank prediction." },
  { icon: TrendingUp, title: "Performance Analytics", desc: "Track weak topics, compare with toppers, and get weekly prep reports." },
  { icon: MessageSquare, title: "Doubt Resolution", desc: "Expert mentors clear PCM doubts within 12 hours (Pro & Elite)." },
  { icon: BookOpen, title: "College Allocation Guide", desc: "Branch-wise cutoffs, counseling strategy & seat matrix insights." },
];

export function CEEAdvantages() {
  return (
    <section className="relative py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 border-none shadow-sm">
            Built for CEE Assam 2026
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Engineered for Rank. <span className="text-zinc-400 dark:text-zinc-600">Not just passing.</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Class 11 & 12 PCM prep, structured around the Assam CEE pattern. Everything you need to secure a top engineering seat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <adv.icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 mb-2">{adv.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{adv.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-600 dark:text-zinc-400">
            <FileCheck className="w-4 h-4 text-emerald-500" /> Free tier includes 3 PYQ sets & 1 full mock monthly
          </div>
        </div>
      </div>
    </section>
  );
}