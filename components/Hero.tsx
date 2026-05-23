"use client";

import { FileText, BookOpen, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useSession } from "next-auth/react";

export function Hero() {
  const { data: session } = useSession();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#090915]">
      {/* Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='a' x='0' y='0'%3E%3CfeTurbulence baseFrequency='0.75' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Gradient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-700/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-fuchsia-700/10 blur-3xl pointer-events-none" />

      {/* Top/bottom accent lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-violet-600/40" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent to-violet-600/40" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative mx-auto px-4 md:px-6 py-16 lg:py-24"
      >
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
          <motion.div variants={itemVariants} className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a30] border border-[#2a2a45] text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Built for B.Tech • 100% Free Core Access
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-black italic leading-none tracking-tight text-center"
          >
            <span className="block text-[clamp(40px,7vw,88px)] text-white">
              MASTER ENGINEERING.
            </span>
            <span
              className="block text-[clamp(40px,7vw,88px)]"
              style={{
                background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              WITHOUT THE CHAOS.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-xl text-lg md:text-xl text-gray-400 leading-relaxed text-center mx-auto"
          >
            Curated PYQs, structured notes, and timed mock tests. Everything you need to crack exams, organized in one place.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <Link
              href={session ? "/student/cee/mock-tests" : "/register"}
              className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold tracking-widest uppercase transition-all duration-200 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.4)]"
            >
              Mock Tests<BookOpen className="h-4 w-4" />
            </Link>
            <Link
              href={session ? "/student/cee/pyq" : "/register"}
              className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-[#1a1a30] border border-[#2a2a45] hover:border-violet-800/50 text-gray-300 text-sm font-bold tracking-widest uppercase transition-all duration-200"
            >
              Past Papers <FileText className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center items-center gap-4 pt-2 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-[#090915] bg-[#1a1a30] flex items-center justify-center"
                >
                  <CheckCircle2 className="h-4 w-4 text-violet-400" />
                </div>
              ))}
            </div>
            <p>
              Trusted by{" "}
              <span className="font-bold text-white">1200+</span>{" "}
              engineering students
            </p>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-16 lg:mt-20 flex justify-center"
        >
          <Link
            href={session ? (session.user as any)?.role === "ADMIN" ? "/admin" : "/student" : "/login"}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-700 to-violet-700 text-white font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-all shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:shadow-[0_0_60px_rgba(124,58,237,0.5)]"
          >
            <span>{session ? "Go to Dashboard" : "Login"}</span>
            <span className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-4 w-4 text-white" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}