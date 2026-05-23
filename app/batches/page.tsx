"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Loader2, GraduationCap, BookOpen, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

import { BatchCard } from "../../components/batch/BatchCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

interface BatchData {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  isFree: boolean;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  bannerUrl?: string | null;
  type: string;
  features: Array<{ text: string }>;
  _count: { enrollments: number };
  isEnrolled: boolean;
}

const TYPES = [
  { value: "ALL", label: "All Programs", icon: Sparkles },
  { value: "CEE_PREP", label: "CEE Prep", icon: GraduationCap },
  { value: "BTECH", label: "B.Tech", icon: BookOpen },
  { value: "COMPETITIVE", label: "Competitive", icon: Zap },
  { value: "FREE", label: "Free", icon: Sparkles },
];

export default function BrowseBatchesPage() {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (typeFilter !== "ALL") params.set("type", typeFilter);
        const res = await fetch(`/api/batches?${params}`);
        if (res.ok) setBatches(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [typeFilter]);

  const filtered = search
    ? batches.filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.tagline?.toLowerCase().includes(search.toLowerCase())
    )
    : batches;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <Badge className="bg-white/10 text-white border-white/20 text-xs font-medium px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1.5" /> Browse Programs
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Find Your Perfect
              <span className="block text-amber-400">Learning Path</span>
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base">
              Structured batches with curated content, mock tests, and mentorship
              to help you crack your exams.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/50"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPES.map((t) => (
            <Button
              key={t.value}
              variant={typeFilter === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t.value)}
              className={
                typeFilter === t.value
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800"
              }
            >
              <t.icon className="w-3.5 h-3.5 mr-1.5" />
              {t.label}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <p className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">
              No programs found
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Try a different filter or check back later.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BatchCard
                  {...batch}
                  enrollmentsCount={batch._count.enrollments}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Back to home */}
      <div className="max-w-6xl mx-auto px-4 pb-12 text-center">
        <Link href="/student">
          <Button variant="ghost" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            ← Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
