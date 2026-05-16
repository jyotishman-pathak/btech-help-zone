"use client";

import { FileCheck, FlaskConical, Timer, TrendingUp, MessageSquare, BookOpen, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

const advantages = [
  {
    icon: FileCheck,
    title: "10+ Years CEE PYQs",
    desc: "Official papers mapped to Assam CEE syllabus with step-by-step solutions.",
    accent: "from-fuchsia-700 to-violet-700",
    glow: "rgba(124,58,237,0.15)",
  },
  {
    icon: FlaskConical,
    title: "PCM Short Notes",
    desc: "High-yield formula sheets & concept summaries for quick revision.",
    accent: "from-emerald-600 to-teal-600",
    glow: "rgba(16,185,129,0.12)",
  },
  {
    icon: Timer,
    title: "Timed Mock Tests",
    desc: "CEE-pattern simulations with auto-grading, speed analysis & rank prediction.",
    accent: "from-blue-600 to-indigo-600",
    glow: "rgba(59,130,246,0.12)",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    desc: "Track weak topics, compare with toppers, and get weekly prep reports.",
    accent: "from-amber-600 to-orange-600",
    glow: "rgba(217,119,6,0.12)",
  },
  {
    icon: MessageSquare,
    title: "Doubt Resolution",
    desc: "Expert mentors clear PCM doubts within 12 hours (Pro & Elite).",
    accent: "from-rose-600 to-pink-600",
    glow: "rgba(244,63,94,0.12)",
  },
  {
    icon: BookOpen,
    title: "College Allocation Guide",
    desc: "Branch-wise cutoffs, counseling strategy & seat matrix insights.",
    accent: "from-cyan-600 to-sky-600",
    glow: "rgba(6,182,212,0.12)",
  },
];

export function CEEAdvantages() {
  return (
    <section className="relative py-24 bg-[#090915] overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Glow blobs */}
      <div className="absolute top-1/3 left-0 w-72 h-72 rounded-full bg-violet-700/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-72 h-72 rounded-full bg-fuchsia-700/8 blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a30] border border-[#2a2a45] text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase mb-5">
            Built for CEE Assam 2026
          </span>
          <h2 className="font-black italic leading-none tracking-tight">
            <span className="block text-[clamp(28px,5vw,60px)] text-white">ENGINEERED FOR RANK.</span>
            <span
              className="block text-[clamp(28px,5vw,60px)]"
              style={{
                background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NOT JUST PASSING.
            </span>
          </h2>
          <p className="mt-5 text-lg text-gray-400 leading-relaxed">
            Class 11 & 12 PCM prep, structured around the Assam CEE pattern. Everything you need to secure a top engineering seat.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <div
                className="relative flex flex-col bg-[#0d0d20] border border-[#1e1e3a] rounded-2xl overflow-hidden hover:border-violet-800/50 transition-all duration-300 hover:-translate-y-1 group"
                style={{
                  boxShadow: "0 0 0 rgba(0,0,0,0)",
                  transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = `0 20px 60px ${adv.glow}`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)")
                }
              >
                {/* Gradient header bar */}
                <div className={`bg-gradient-to-r ${adv.accent} px-4 py-2.5 flex items-center gap-2`}>
                  <CheckSquare className="w-4 h-4 text-white/80" />
                  <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                    CEE 2026 Advantage
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#12122a] border border-[#1e1e3a] group-hover:scale-110 transition-transform duration-300">
                      <adv.icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="font-black italic text-lg text-white tracking-tight leading-tight">
                      {adv.title.toUpperCase()}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed pl-0">{adv.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1a1a30] border border-[#2a2a45] text-sm text-gray-400">
            <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            Free tier includes 3 PYQ sets & 1 full mock monthly
          </div>
        </motion.div>
      </div>
    </section>
  );
}