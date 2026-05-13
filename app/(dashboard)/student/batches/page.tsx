"use client";

import { useState, useEffect } from "react";
import { Input } from "../../../../components/ui/input";
import { BookOpen, Search } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { BatchCard } from "../../../../components/batch/BatchCard";


const TABS = [
  { label: "All", value: "ALL" },
  { label: "CEE Prep", value: "CEE_PREP" },
  { label: "B.Tech", value: "BTECH" },
  { label: "Competitive", value: "COMPETITIVE" },
  { label: "Free", value: "FREE" },
];

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "ALL") params.set("type", activeTab);
    fetch(`/api/batches?${params}`)
      .then((r) => r.json())
      .then((data) => setBatches(data))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const filtered = batches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.tagline ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-14 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Browse Batches</h1>
          <p className="text-zinc-400 dark:text-zinc-600 text-lg max-w-xl">
            Structured learning paths for CEE aspirants and engineering students.
          </p>
          <div className="relative max-w-md mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search batches..."
              className="pl-9 h-11 bg-white/10 dark:bg-zinc-900/10 border-white/20 text-white dark:text-zinc-900 placeholder:text-zinc-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab.value
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No batches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((batch) => (
              <BatchCard
                key={batch.id}
                {...batch}
                enrollmentsCount={batch._count?.enrollments ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}