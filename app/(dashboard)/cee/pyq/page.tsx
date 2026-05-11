"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Download, Lock, Search, Filter, Loader2, ChevronRight, FileText, ExternalLink, Atom, Microscope, Calculator } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { cn } from "../../../../lib/utils";
import { Select, SelectContent, SelectItem,  SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";

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

const SUBJECT_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Physics:     { icon: Atom,       color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20" },
  Chemistry:   { icon: Microscope, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
  Mathematics: { icon: Calculator, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
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

  // Debounce search
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
        window.open(data.url, "_blank");
        // Optimistically update count
        setPyqs((prev) => prev.map((p) => p.id === pyq.id ? { ...p, downloads: p.downloads + 1 } : p));
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 text-sm font-medium mb-3">
              <FileText className="w-4 h-4" /> Assam CEE Resource Library
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Previous Year Questions
            </h1>
            <p className="text-zinc-400 dark:text-zinc-600 text-lg">
              Solved PYQs from 2015–2024. Download, study, and dominate.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search PYQs..."
              className="pl-9 h-11 bg-white/10 dark:bg-zinc-900/10 border-white/20 dark:border-zinc-900/20 text-white dark:text-zinc-900 placeholder:text-zinc-500 focus:bg-white/15"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Tabs + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  activeTab === tab
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-36 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : pyqs.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No PYQs found</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-1">
              {search ? "Try a different search term" : "Check back soon — new papers are uploaded regularly"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pyqs.map((pyq) => {
              const meta = SUBJECT_META[pyq.subject] ?? { icon: FileText, color: "text-zinc-600", bg: "bg-zinc-100" };
              const Icon = meta.icon;
              const isLocked = !pyq.canAccess;

              return (
                <Card
                  key={pyq.id}
                  className={cn(
                    "group border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden",
                    isLocked && "opacity-90"
                  )}
                >
                  {/* Top color strip */}
                  <div className={cn("h-1.5 w-full", {
                    "bg-blue-500": pyq.subject === "Physics",
                    "bg-violet-500": pyq.subject === "Chemistry",
                    "bg-emerald-500": pyq.subject === "Mathematics",
                    "bg-zinc-400": !["Physics", "Chemistry", "Mathematics"].includes(pyq.subject),
                  })} />

                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-2 rounded-lg", meta.bg)}>
                        <Icon className={cn("w-5 h-5", meta.color)} />
                      </div>
                      <div className="text-right">
                        {pyq.year && <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{pyq.year}</p>}
                        {isLocked && (
                          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] mt-1">
                            {pyq.requiredTier === "SUPER_PREMIUM" ? "Elite" : "Premium"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <Badge variant="secondary" className={cn("text-xs mb-2", meta.bg, meta.color, "border-none")}>
                        {pyq.subject}
                      </Badge>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
                        {pyq.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Download className="w-3 h-3" /> {pyq.downloads.toLocaleString()} downloads
                      </span>

                      {isLocked ? (
                        <Link href="/pricing">
                          <Button size="sm" variant="outline" className="h-8 text-xs border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                            <Lock className="w-3 h-3 mr-1" /> Upgrade
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleDownload(pyq)}
                          disabled={downloading === pyq.id}
                          className="h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                        >
                          {downloading === pyq.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <><Download className="w-3 h-3 mr-1" /> Download</>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats bar */}
        {!loading && pyqs.length > 0 && (
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-600">
            Showing {pyqs.length} paper{pyqs.length !== 1 ? "s" : ""}
            {activeTab !== "All" ? ` · ${activeTab}` : ""}
            {yearFilter !== "all" ? ` · ${yearFilter}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}