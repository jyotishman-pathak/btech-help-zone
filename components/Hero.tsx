"use client";


import { FileText, BookOpen, Timer, ArrowUpRight, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function Hero() {
  const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

  const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Premium Grain Overlay */}
      {/* <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" /> */}
{/* Grain Overlay - using inline style to bypass Next.js module resolution */}
<div
  className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='a' x='0' y='0'%3E%3CfeTurbulence baseFrequency='0.75' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E")`,
  }}
/>    


  {/* Subtle Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Vertical Accent Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-slate-200 dark:bg-slate-800" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-slate-200 dark:bg-slate-800" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative mx-auto px-4 md:px-6 py-16 lg:py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left: Content & CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border-none shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Built for B.Tech • 100% Free Core Access
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-slate-50 leading-[1.05]"
            >
              Master Engineering.
              <br />
              <span className="text-slate-400 dark:text-slate-600">Without the chaos.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-xl text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              Curated PYQs, structured notes, and timed mock tests. Everything you need to crack exams, organized in one place.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
              <Button size="lg" className="h-12 px-6 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all group" asChild>
                <Link href="/notes" className="flex items-center gap-2">
                  Browse Notes <BookOpen className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800" asChild>
                <Link href="/papers" className="flex items-center gap-2">
                  Past Papers <FileText className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 pt-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-50 bg-slate-200 dark:border-slate-950 dark:bg-slate-800 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="font-semibold text-slate-900 dark:text-slate-200">2,400+</span> engineering students</p>
            </motion.div>
          </div>

          {/* Right: Bento Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 grid grid-cols-2 gap-4"
          >
            {[
              { icon: FileText, title: "PYQs Organized", value: "12K+", desc: "By university & semester" },
              { icon: BookOpen, title: "Study Notes", value: "850+", desc: "Expert-reviewed & updated" },
              { icon: Timer, title: "Mock Tests", value: "120+", desc: "Timed & auto-graded" },
              { icon: Zap, title: "Exam Ready", value: "100%", desc: "Free premium features" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className="group relative rounded-2xl p-5 border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <item.icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{item.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-16 lg:mt-20 flex justify-center"
        >
          <Link href="/mock-tests" className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
            <span>Take a Free Mock Test</span>
            <span className="relative w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 dark:bg-slate-200 transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-4 w-4 text-white dark:text-slate-900" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}