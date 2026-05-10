"use client";


import { Timer, Target, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function MockTestCTA() {
  return (
    <section className="relative py-24 overflow-hidden bg-zinc-900 dark:bg-zinc-50">
      {/* Subtle Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* CSS-Only Noise Fallback (no base64) */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Accent Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-zinc-700 dark:bg-zinc-300" />

      <div className="container relative mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Badge variant="secondary" className="mb-6 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-700 dark:hover:bg-zinc-300 border-none shadow-sm">
            <Timer className="w-3 h-3 mr-1" /> CEE 2026 Mock Test Portal
          </Badge>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white dark:text-zinc-900 leading-[1.05]">
            Simulate the Exam. <br />
            <span className="text-zinc-400 dark:text-zinc-500">Secure Your Rank.</span>
          </h2>

          <p className="mt-5 text-lg md:text-xl text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Timed, auto-graded CEE-pattern mock tests with admin-controlled access codes. 
            Built specifically for Class 12 PCM aspirants targeting top Assam engineering colleges.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 shadow-lg shadow-white/5 transition-all group"
            >
              <Link href="/cee/mocks" className="flex items-center gap-2">
                Start Free Mock Test <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white dark:border-zinc-300 dark:text-zinc-700 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
            >
              <Link href="/pricing">View Premium Plans</Link>
            </Button>
          </div>

          {/* Trust / Feature Strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> CEE Pattern Match</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Access Codes</span>
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> Auto-Graded & Ranked</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-zinc-700 dark:bg-zinc-300" />
    </section>
  );
}