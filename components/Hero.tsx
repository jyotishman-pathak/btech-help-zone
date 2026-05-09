"use client";

import { Button } from "../components/ui/button";
import { FileText, BookOpen, Timer, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-50 py-20 md:py-28">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="container relative mx-auto px-4 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            One Platform for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              All B.Tech
            </span>{" "}
            Study Needs
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
            PYQs • Organized Notes • Mock Tests • Free & Premium content — crafted for engineering students.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all group" asChild>
              <Link href="/notes">
                View Notes <BookOpen className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-blue-200 bg-white/50 backdrop-blur-sm shadow-md" asChild>
              <Link href="/papers">
                Question Papers <FileText className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="bg-gray-800 text-white hover:bg-gray-900 shadow-md" asChild>
              <Link href="/mock-tests">
                Start Mock Test <Timer className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[
            { label: "Question Papers", value: "300+" },
            { label: "Active Users", value: "800+" },
            { label: "Mock Tests", value: "50+" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/60 px-6 py-3 backdrop-blur-sm shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}