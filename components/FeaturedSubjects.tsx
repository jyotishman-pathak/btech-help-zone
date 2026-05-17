"use client";

import { Atom, FlaskConical, Sigma, FileCheck, Timer, BookOpenCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    title: "Physics",
    icon: Atom,
    count: "Concept Builder",
    desc: "Mechanics, Optics, Electromagnetism & Modern Physics",
    accent: "from-amber-600 to-orange-600",
    glow: "rgba(217,119,6,0.15)",
    href: "/student",
  },
  {
    title: "Chemistry",
    icon: FlaskConical,
    count: "Practice Modules",
    desc: "Physical, Organic & Inorganic for Assam CEE prep",
    accent: "from-emerald-600 to-teal-600",
    glow: "rgba(16,185,129,0.15)",
    href: "/student",
  },
  {
    title: "Mathematics",
    icon: Sigma,
    count: "Rank-Oriented Prep",
    desc: "Calculus, Algebra, Coordinate Geometry & Vectors",
    accent: "from-blue-600 to-indigo-600",
    glow: "rgba(59,130,246,0.15)",
    href: "/student",
  },
  {
    title: "CEE PYQs",
    icon: FileCheck,
    count: "Previous Year Papers",
    desc: "Past CEE questions with detailed solutions & analysis",
    accent: "from-fuchsia-700 to-violet-700",
    glow: "rgba(124,58,237,0.15)",
    href: "/student",
  },
  {
    title: "Mock Tests",
    icon: Timer,
    count: "Timed Practice",
    desc: "CEE-style test experience with performance tracking",
    accent: "from-rose-600 to-pink-600",
    glow: "rgba(244,63,94,0.15)",
    href: "/student",
  },
  {
    title: "Quick Revision",
    icon: BookOpenCheck,
    count: "Smart Revision",
    desc: "Formula sheets, shortcuts & rapid revision notes",
    accent: "from-cyan-600 to-sky-600",
    glow: "rgba(6,182,212,0.15)",
    href: "/student",
  },
];

export function CEEFeatured() {
  return (
    <section className="relative py-24 bg-[#090915] overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container relative mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a30] border border-[#2a2a45] text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase mb-5">
            CEE Assam 2026 • PCM Stream
          </span>
          <h2 className="font-black italic leading-none tracking-tight">
            <span className="block text-[clamp(32px,5vw,64px)] text-white">TARGET CEE.</span>
            <span
              className="block text-[clamp(32px,5vw,64px)]"
              style={{
                background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MASTER PCM.
            </span>
          </h2>
          <p className="mt-5 text-lg text-gray-400 leading-relaxed">
            Class 11 & 12 syllabus mapped to the Assam CEE pattern. PYQs, timed mocks, and revision material — all structured for rank-focused prep.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Link href={cat.href} className="block h-full group">
                <div
                  className="relative flex flex-col h-full bg-[#0d0d20] border border-[#1e1e3a] rounded-2xl overflow-hidden hover:border-violet-800/50 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                    transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = `0 20px 60px ${cat.glow}`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)")
                  }
                >
                  {/* Gradient header bar */}
                  <div className={`bg-gradient-to-r ${cat.accent} px-4 py-2.5 flex items-center gap-2`}>
                    <cat.icon className="w-4 h-4 text-white/80" />
                    <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                      {cat.count}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black italic text-white tracking-tight">
                        {cat.title.toUpperCase()}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="student/cee/syllabus"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a1a30] border border-[#2a2a45] text-gray-300 text-sm font-medium hover:border-violet-800/50 transition-colors"
          >
            View Full CEE Syllabus Breakdown
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}