"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { Atom, FlaskConical, Sigma, FileCheck, Timer, BookOpenCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Badge } from "./ui/badge";

const categories = [
  {
    title: "Physics",
    icon: Atom,
    count: "420+ Questions",
    desc: "Mechanics, Optics, Electromagnetism & Modern Physics",
    accent: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30",
    href: "/cee/physics",
  },
  {
    title: "Chemistry",
    icon: FlaskConical,
    count: "380+ Questions",
    desc: "Physical, Organic & Inorganic (Class 11–12 Syllabus)",
    accent: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
    href: "/cee/chemistry",
  },
  {
    title: "Mathematics",
    icon: Sigma,
    count: "510+ Questions",
    desc: "Calculus, Algebra, Coordinate Geometry & Vectors",
    accent: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30",
    href: "/cee/maths",
  },
  {
    title: "CEE PYQs",
    icon: FileCheck,
    count: "10 Years",
    desc: "Official past papers with step-by-step solutions & analysis",
    accent: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30",
    href: "/cee/pyqs",
  },
  {
    title: "Mock Tests",
    icon: Timer,
    count: "45+ Sets",
    desc: "CEE-pattern simulations with auto-grading & time tracking",
    accent: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30",
    href: "/cee/mocks",
  },
  {
    title: "Quick Revision",
    icon: BookOpenCheck,
    count: "Formula Sheets",
    desc: "High-yield notes, shortcuts & last-minute cram guides",
    accent: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-500/20 dark:border-cyan-500/30",
    href: "/cee/revision",
  },
];

export function CEEFeatured() {
  return (
    <section className="relative py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Architectural Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container relative mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 border-none shadow-sm">
            CEE Assam 2026 • PCM Stream
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Target CEE. <span className="text-zinc-400 dark:text-zinc-600">Master PCM.</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Class 11 & 12 syllabus mapped to the Assam CEE pattern. PYQs, timed mocks, and revision material—all structured for rank-focused prep.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Link href={cat.href} className="block h-full group">
                <Card className="h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${cat.accent} transition-transform group-hover:scale-105`}>
                      <cat.icon className="w-6 h-6" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        {cat.title}
                      </CardTitle>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug">
                      {cat.desc}
                    </p>
                    <div className="pt-1">
                      <span className="text-xs font-semibold tracking-wide uppercase text-zinc-400 dark:text-zinc-500">
                        {cat.count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/cee/syllabus"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            View Full CEE Syllabus Breakdown
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}