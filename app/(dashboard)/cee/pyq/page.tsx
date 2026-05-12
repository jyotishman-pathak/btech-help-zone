// app/(dashboard)/cee/pyq/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Download, Lock, Search, Loader2,
  FileText, Atom, Microscope, Calculator, Filter, ChevronDown
} from "lucide-react";
import { cn } from "../../../../lib/utils";

interface PYQ {
  id: string;
  title: string;
  subject: string;
  year: number | null;
  requiredTier: string;
  downloads: number;
  canAccess: boolean;
  fileUrl: string | null;
}

const SUBJECT_META: Record<string, { icon: React.ElementType; gradient: string; badge: string; badgeText: string }> = {
  Physics: {
    icon: Atom,
    gradient: "from-blue-500 to-indigo-600",
    badge: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/40",
    badgeText: "text-blue-700 dark:text-blue-400",
  },
  Chemistry: {
    icon: Microscope,
    gradient: "from-violet-500 to-purple-600",
    badge: "bg-violet-50 dark:bg-violet-900/30 border border-violet-200/60 dark:border-violet-700/40",
    badgeText: "text-violet-700 dark:text-violet-400",
  },
  Mathematics: {
    icon: Calculator,
    gradient: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/40",
    badgeText: "text-emerald-700 dark:text-emerald-400",
  },
};

const TABS = ["All", "Physics", "Chemistry", "Mathematics"];

export default function PYQPage() {
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [yearFilter, setYearFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchPYQs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "All") params.set("subject", activeTab);
      if (yearFilter !== "all") params.set("year", yearFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/pyq?${params}`);
      const data = await res.json();
      setPyqs(data.pyqs ?? []);
      setYears(data.years ?? []);
    } finally {
      setLoading(false);
    }
  }, [activeTab, yearFilter, search]);

  useEffect(() => { fetchPYQs(); }, [fetchPYQs]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDownload = async (pyq: PYQ) => {
    if (!pyq.canAccess) return;
    setDownloading(pyq.id);
    try {
      const res = await fetch(`/api/pyq/${pyq.id}/download`, { method: "POST" });
      const data = await res.json();
      if (data.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = `${pyq.title}.pdf`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setPyqs((prev) => prev.map((p) => p.id === pyq.id ? { ...p, downloads: p.downloads + 1 } : p));
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A]">

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-indigo-700/20" />
          <div className="absolute top-10 right-10 w-48 h-48 rounded-full border border-violet-600/15" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-14 md:py-20">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
              <FileText className="w-4 h-4" /> Assam CEE Resource Library
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Previous Year<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                Questions
              </span>
            </h1>
            <p className="text-indigo-300 text-lg">
              Solved PYQs from 2015–2024. Download, study, and dominate.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search PYQs by subject, year, topic…"
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-indigo-400 text-sm font-medium outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-sm"
            />
          </div>

          {/* Stats chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: `${pyqs.length} Papers`, color: "bg-white/10 text-indigo-200 border-white/10" },
              { label: "2015 – 2024", color: "bg-white/10 text-indigo-200 border-white/10" },
              { label: "3 Subjects", color: "bg-white/10 text-indigo-200 border-white/10" },
            ].map(({ label, color }) => (
              <span key={label} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${color}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1 p-1.5 bg-white dark:bg-[#12101F] rounded-2xl border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="h-10 pl-4 pr-9 rounded-xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-3xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 animate-pulse" />
            ))}
          </div>
        ) : pyqs.length === 0 ? (
          <div className="text-center py-24 rounded-3xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50">
            <FileText className="w-14 h-14 mx-auto text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-bold">No PYQs found</p>
            <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">
              {search ? "Try a different search term" : "Check back soon"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pyqs.map((pyq) => {
              const meta = SUBJECT_META[pyq.subject] ?? {
                icon: FileText,
                gradient: "from-slate-400 to-slate-600",
                badge: "bg-slate-100 dark:bg-slate-800",
                badgeText: "text-slate-600 dark:text-slate-400",
              };
              const Icon = meta.icon;
              const isLocked = !pyq.canAccess;

              return (
                <div
                  key={pyq.id}
                  className={cn(
                    "group relative rounded-3xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/40 dark:hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all duration-300 shadow-sm",
                    isLocked && "opacity-80"
                  )}
                >
                  {/* Color top bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />

                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${meta.gradient} shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right space-y-1">
                        {pyq.year && (
                          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none">{pyq.year}</p>
                        )}
                        {isLocked && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${pyq.requiredTier === "SUPER_PREMIUM"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40"
                              : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/40"
                            }`}>
                            <Lock className="w-2.5 h-2.5" />
                            {pyq.requiredTier === "SUPER_PREMIUM" ? "Elite" : "Premium"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${meta.badge} ${meta.badgeText}`}>
                        {pyq.subject}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 text-sm">
                        {pyq.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium">
                        <Download className="w-3.5 h-3.5" />
                        {pyq.downloads.toLocaleString()} downloads
                      </span>

                      {isLocked ? (
                        <a href="/pricing">
                          <button className="h-8 px-3 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> Upgrade
                          </button>
                        </a>
                      ) : (
                        <button
                          onClick={() => handleDownload(pyq)}
                          disabled={downloading === pyq.id}
                          className="h-8 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 transition flex items-center gap-1.5 shadow-sm"
                        >
                          {downloading === pyq.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <><Download className="w-3.5 h-3.5" /> Download</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Result count */}
        {!loading && pyqs.length > 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-600 font-medium">
            Showing {pyqs.length} paper{pyqs.length !== 1 ? "s" : ""}
            {activeTab !== "All" ? ` in ${activeTab}` : ""}
            {yearFilter !== "all" ? ` · ${yearFilter}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}