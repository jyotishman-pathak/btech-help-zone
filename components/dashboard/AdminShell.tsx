"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Users, FileText, Timer, Settings, TrendingUp, Shield, Copy, Plus, Search,
  MoreHorizontal, Check, X, Eye, Edit, Trash2, Download, Upload, Clock,
  ChevronDown, ChevronUp, RefreshCw, Lock, Unlock, Code, BarChart3,
  PieChart, Activity, Loader2, AlertCircle, ExternalLink,
  LayoutDashboard,
  User,
  LogOut,
  Tag,
  BookOpen,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Link from "next/link";

import { signOut, useSession } from "next-auth/react";
import prisma from "../../lib/prisma.client";
import { UserAccessModal } from "./UserAccessModal";


// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab =
  | "dashboard"
  | "users"
  | "content"
  | "codes"
  | "analytics"
  | "batches"
  | "coupons"
  | "audit"
  | "leads"
  | "settings";
type Tier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  tier: Tier;
  suspended: boolean;
  createdAt: string;
  mocksTaken: number;
  avgScore: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: "PYQ" | "NOTE";
  subject: string;
  requiredTier: Tier;
  downloads: number;
  status: string;
  createdAt: string;
  fileUrl: string;
}

interface AccessCode {
  id: string;
  accessCode: string;
  title: string;
  isActive: boolean;
  requiredTier: Tier;
  duration: number;
  questionsCount: number;
  attemptsCount: number;
}

interface Stats {
  totalUsers: number;
  usersThisMonth: number;
  activeToday: number;
  mocksTotal: number;
  mocksThisMonth: number;
  revenueTotal: number;
  revenueThisMonth: number;
  blockedToday?: number;
  trends: { users: number; mocks: number; revenue: number };
  feed: Array<{ user: string; action: string; time: string; type: string }>;
}

interface Analytics {
  signups: Array<{ date: string; users: number }>;
  revenue: Array<{ month: string; amount: number }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trendStr(n: number) {
  return `${n >= 0 ? "+" : ""}${n}%`;
}

function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={async () => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }}>
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}

function Spinner() {
  return <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminShell({ admin, initialTab }: { admin: { name: string; email: string; image?: string }, initialTab?: string }) {
  const [activeTab, setActiveTab] = useState<AdminTab>((initialTab as AdminTab) || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | Tier>("all");
  const [contentFilter, setContentFilter] = useState<"all" | "published" | "draft" | "archived">("all");

  // Data state
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Mutation loading
  const [mutating, setMutating] = useState<string | null>(null);

  // New content dialog
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [newContent, setNewContent] = useState({ title: "", type: "NOTE" as const, fileUrl: "", requiredTier: "NORMAL" as Tier });
  const [savingContent, setSavingContent] = useState(false);

  // Access Modal
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<AdminUser | null>(null);

  // Leads state
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadsBatchFilter, setLeadsBatchFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [allFreeBatches, setAllFreeBatches] = useState<{ id: string; name: string; slug: string }[]>([]);

  // ── Fetchers ────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } finally { setLoadingStats(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) setAnalytics(await res.json());
    } finally { setLoadingAnalytics(false); }
  }, []);



  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ page: String(userPage) });
      if (userFilter !== "all") params.set("tier", userFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserTotal(data.total);
      }
    } finally { setLoadingUsers(false); }
  }, [userFilter, searchQuery, userPage]);

  const fetchContent = useCallback(async () => {
    setLoadingContent(true);
    try {
      const params = new URLSearchParams();
      if (contentFilter !== "all") params.set("status", contentFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/content?${params}`);
      if (res.ok) setContent(await res.json());
    } finally { setLoadingContent(false); }
  }, [contentFilter, searchQuery]);

  const fetchCodes = useCallback(async () => {
    setLoadingCodes(true);
    try {
      const res = await fetch("/api/admin/codes");
      if (res.ok) setCodes(await res.json());
    } finally { setLoadingCodes(false); }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const params = new URLSearchParams();
      if (leadsBatchFilter !== "all") params.set("batchId", leadsBatchFilter);
      const res = await fetch(`/api/admin/leads?${params}`);
      if (res.ok) setLeads(await res.json());
    } finally { setLoadingLeads(false); }
  }, [leadsBatchFilter]);

  const fetchFreeBatches = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/batches");
      if (res.ok) {
        const data = await res.json();
        setAllFreeBatches(
          (Array.isArray(data) ? data : [])
            .filter((b: any) => b.isFree && !b.deletedAt)
            .map((b: any) => ({ id: b.id, name: b.name, slug: b.slug }))
        );
      }
    } catch { }
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "dashboard") { fetchStats(); }
    if (activeTab === "users") { fetchUsers(); }
    if (activeTab === "content") { fetchContent(); }
    if (activeTab === "codes") { fetchCodes(); }
    if (activeTab === "analytics") { fetchAnalytics(); }
    if (activeTab === "leads") { fetchLeads(); fetchFreeBatches(); }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "leads") fetchLeads();
  }, [leadsBatchFilter]);

  // Re-fetch users when filters change
  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [userFilter, searchQuery, userPage]);

  useEffect(() => {
    if (activeTab === "content") fetchContent();
  }, [contentFilter, searchQuery]);

  const { data: session } = useSession();

  // ── Mutations ────────────────────────────────────────────────────────────────

  const updateUser = async (id: string, patch: Partial<{ tier: Tier; suspended: boolean }>) => {
    setMutating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
      }
    } finally { setMutating(null); }
  };

  const updateContent = async (id: string, patch: Partial<{ status: string; title: string }>) => {
    setMutating(id);
    try {
      await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setContent((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
    } finally { setMutating(null); }
  };

  const deleteContent = async (id: string) => {
    if (!confirm("Delete this content permanently?")) return;
    setMutating(id);
    try {
      await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      setContent((prev) => prev.filter((c) => c.id !== id));
    } finally { setMutating(null); }
  };

  const toggleTestActive = async (id: string, isActive: boolean) => {
    setMutating(id);
    try {
      await fetch(`/api/admin/tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setCodes((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !isActive } : c));
    } finally { setMutating(null); }
  };

  const saveContent = async () => {
    if (!newContent.title || !newContent.fileUrl) return;
    setSavingContent(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      });
      if (res.ok) {
        const created = await res.json();
        setContent((prev) => [{ ...created, subject: created.subject?.name ?? "General" }, ...prev]);
        setIsAddContentOpen(false);
        setNewContent({ title: "", type: "NOTE", fileUrl: "", requiredTier: "NORMAL" });
      }
    } finally { setSavingContent(false); }
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Tier", "Mocks Taken", "Avg Score", "Joined"]];
    users.forEach((u) => rows.push([u.name ?? "", u.email, u.tier, String(u.mocksTaken), String(u.avgScore), u.createdAt.split("T")[0]]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "users.csv";
    a.click();
  };

  const exportLeadsCSV = () => {
    if (!leads.length) return;
    const allDataKeys = [...new Set(leads.flatMap((l) => Object.keys(l.data ?? {})))];
    const headers = ["Date", "Batch", "Account Name", "Account Email", ...allDataKeys];
    const rows = leads.map((l) => {
      const d = l.data as Record<string, string>;
      return [
        new Date(l.createdAt).toLocaleDateString("en-IN"),
        l.batchName,
        l.user?.name ?? "",
        l.user?.email ?? "",
        ...allDataKeys.map((k) => d[k] ?? ""),
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const statCards = stats
    ? [
      { title: "Total Users", value: stats.totalUsers.toLocaleString(), change: trendStr(stats.trends.users), trend: stats.trends.users >= 0 ? "up" as const : "down" as const, icon: Users },
      { title: "Active Today", value: stats.activeToday.toLocaleString(), change: "test sessions", trend: "neutral" as const, icon: Activity },
      { title: "Mocks Completed", value: stats.mocksTotal.toLocaleString(), change: trendStr(stats.trends.mocks), trend: stats.trends.mocks >= 0 ? "up" as const : "down" as const, icon: Timer },
      { title: "Revenue (₹)", value: `₹${stats.revenueTotal.toLocaleString("en-IN")}`, change: trendStr(stats.trends.revenue), trend: stats.trends.revenue >= 0 ? "up" as const : "down" as const, icon: TrendingUp },
      {
        title: "Attacks Blocked",
        value: stats.blockedToday?.toLocaleString() ?? "0",
        change: "last 24 hours",
        trend: "neutral",
        icon: Shield,
      }


    ]
    : [];

  const filteredLeads = leadSearch
    ? leads.filter((l) => {
      const d = l.data as Record<string, string>;
      const q = leadSearch.toLowerCase();
      return (
        l.user?.name?.toLowerCase().includes(q) ||
        l.user?.email?.toLowerCase().includes(q) ||
        d["Full Name"]?.toLowerCase().includes(q) ||
        d["Phone Number"]?.includes(leadSearch) ||
        d["School / College"]?.toLowerCase().includes(q) ||
        l.batchName?.toLowerCase().includes(q)
      );
    })
    : leads;

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] flex">

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }} animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-64 border-r border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] z-40 flex flex-col"
      >
        <div className="p-5 border-b border-slate-200/70 dark:border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-slate-900 dark:text-white" />
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg text-slate-900 dark:text-white">
                CEE<span className="text-amber-500 ml-2">HelpZone</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 -mt-0.5">Assam • PCM Platform</span>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {([
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "content", label: "Content", icon: FileText },
              { id: "predictor", label: "Predictor", icon: Building2, href: "/admin/predictor" },
              { id: "tests", label: "Mock Tests", icon: Code, href: "/admin/tests" },
              { id: "attempts", label: "Mock Attempts", icon: Timer, href: "/admin/attempts" },
              { id: "analytics", label: "Analytics", icon: PieChart },
              { id: "batches", label: "Batches", icon: BookOpen, href: "/admin/batches" },
              { id: "coupons", label: "Coupons", icon: Tag, href: "/admin/coupons" },
              { id: "leads", label: "Free Leads", icon: Users },
              { id: "syllabus", label: "Syllabus", icon: BookOpen, href: "/admin/syllabus" },
              { id: "audit", label: "Audit Logs", icon: Shield, href: "/admin/audit-logs" },
              { id: "pyq", label: "Upload PYQ", icon: Upload, href: "/admin/pyq" },
              { id: "payments", label: "Payments", icon: TrendingUp, href: "/admin/payments" },
              { id: "settings", label: "Settings", icon: Settings },
            ] as const).map((item) => {
              if ("href" in item) {
                return (
                  <Link key={item.id} href={item.href}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              }
              if (item.id === "leads") {
                return (
                  <button
                    key="leads"
                    onClick={() => setActiveTab("leads")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "leads"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    Free Leads
                    {leads.length > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                        {leads.length}
                      </span>
                    )}
                  </button>
                );
              }
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200/70 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={admin.image} />
              <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                {admin.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{admin.name}</p>
              <p className="text-xs text-slate-500 truncate">{admin.email}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 lg:w-80 bg-slate-100 dark:bg-slate-900 border-slate-200/70 dark:border-slate-700/50" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
                />
              </Button>

              {!session ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Start Free</Link>
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none">
                      <Avatar className="h-9 w-9 border border-slate-200/70 dark:border-slate-700/50">
                        <AvatarImage src={session.user?.image ?? ""} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab("settings")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ───────────────────────────────────────────────── */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Platform overview</p>
                  </div>
                  <Button onClick={fetchStats} disabled={loadingStats} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                    {loadingStats ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" /> Refresh</>}
                  </Button>
                </div>

                {/* Stats */}
                {loadingStats ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="border-slate-200/70 dark:border-slate-700/50 animate-pulse bg-white dark:bg-[#12101F] h-32" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <Card key={stat.title} className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{stat.value}</p>
                                <div className="flex items-center gap-1 mt-2">
                                  {stat.trend === "up" && <ChevronUp className="w-4 h-4 text-emerald-500" />}
                                  {stat.trend === "down" && <ChevronDown className="w-4 h-4 text-red-500" />}
                                  <span className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-red-600" : "text-slate-500"}`}>
                                    {stat.change}
                                  </span>
                                  {stat.trend !== "neutral" && <span className="text-xs text-slate-400">vs last month</span>}
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                                <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Activity feed */}
                {stats && (
                  <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                      <CardDescription>Latest user actions across the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.feed.length === 0 ? (
                        <p className="text-sm text-slate-400 py-4 text-center">No activity yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats.feed.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === "success" ? "bg-emerald-500" : item.type === "upgrade" ? "bg-amber-500" : item.type === "join" ? "bg-blue-500" : "bg-purple-500"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.user}</p>
                                <p className="text-xs text-slate-500 truncate">{item.action}</p>
                              </div>
                              <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* ── USERS ───────────────────────────────────────────────────── */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Users</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{userTotal.toLocaleString()} total students</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Search users..." 
                        value={searchQuery} 
                        onChange={(e) => { setSearchQuery(e.target.value); setUserPage(1); }}
                        className="pl-9 w-full sm:w-64 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50" 
                      />
                    </div>
                    <Select value={userFilter} onValueChange={(v) => { setUserFilter(v as any); setUserPage(1); }}>
                      <SelectTrigger className="w-40 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50">
                        <SelectValue placeholder="Filter tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="NORMAL">Free</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="SUPER_PREMIUM">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportCSV} className="border-slate-200/70 dark:border-slate-700/50">
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>

                <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-16"><Spinner /></div>
                  ) : users.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">No users found.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200/70 dark:border-slate-700/50">
                          <TableHead className="text-slate-500">User</TableHead>
                          <TableHead className="text-slate-500">Tier</TableHead>
                          <TableHead className="text-slate-500">Mocks</TableHead>
                          <TableHead className="text-slate-500">Avg Score</TableHead>
                          <TableHead className="text-slate-500">Status</TableHead>
                          <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.image ?? ""} />
                                  <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                                    {(user.name ?? "??").slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">{user.name ?? "—"}</p>
                                  <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={user.tier === "NORMAL" ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"}>
                                {user.tier === "SUPER_PREMIUM" ? "Elite" : user.tier}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">{user.mocksTaken}</TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">{user.avgScore || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={user.suspended ? "destructive" : "outline"} className={!user.suspended ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : ""}>
                                {user.suspended ? "Suspended" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={mutating === user.id}>
                                    {mutating === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                                  <DropdownMenuItem onClick={() => { setSelectedUserForAccess(user); setAccessModalOpen(true); }} className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400">
                                    <Shield className="w-4 h-4 mr-2" /> Manage Access
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { tier: "PREMIUM" })} className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" /> Set Premium
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { tier: "SUPER_PREMIUM" })} className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" /> Set Elite
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { tier: "NORMAL" })} className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" /> Set Free
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateUser(user.id, { suspended: !user.suspended })} className={`cursor-pointer ${user.suspended ? "text-emerald-600" : "text-red-600"}`}>
                                    {user.suspended ? <><Unlock className="w-4 h-4 mr-2" /> Unsuspend</> : <><Lock className="w-4 h-4 mr-2" /> Suspend</>}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>

                {/* Pagination */}
                {userTotal > 20 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Showing {(userPage - 1) * 20 + 1}–{Math.min(userPage * 20, userTotal)} of {userTotal}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)} className="border-slate-200/70 dark:border-slate-700/50">Previous</Button>
                      <Button variant="outline" size="sm" disabled={userPage * 20 >= userTotal} onClick={() => setUserPage((p) => p + 1)} className="border-slate-200/70 dark:border-slate-700/50">Next</Button>
                    </div>
                  </div>
                )}
                
                <UserAccessModal 
                  user={selectedUserForAccess} 
                  open={accessModalOpen} 
                  onOpenChange={setAccessModalOpen} 
                />
              </motion.div>
            )}

            {/* ── CONTENT ─────────────────────────────────────────────────── */}
            {activeTab === "content" && (
              <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Content Library</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">PYQs, notes, and study materials</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/admin/tests/new">
                      <Button variant="outline" className="border-slate-200/70 dark:border-slate-700/50">
                        <Plus className="w-4 h-4 mr-2" /> New Mock Test
                      </Button>
                    </Link>
                    <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                          <Upload className="w-4 h-4 mr-2" /> Upload Content
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                        <DialogHeader>
                          <DialogTitle>Upload Study Material</DialogTitle>
                          <DialogDescription>Add a PYQ or note for CEE aspirants.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input placeholder="CEE Physics 2025 Solved" value={newContent.title} onChange={(e) => setNewContent({ ...newContent, title: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select value={newContent.type} onValueChange={(v) => setNewContent({ ...newContent, type: v as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PYQ">PYQ</SelectItem>
                                  <SelectItem value="NOTE">Note</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Required Tier</Label>
                              <Select value={newContent.requiredTier} onValueChange={(v) => setNewContent({ ...newContent, requiredTier: v as Tier })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NORMAL">Free</SelectItem>
                                  <SelectItem value="PREMIUM">Premium</SelectItem>
                                  <SelectItem value="SUPER_PREMIUM">Elite</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>File URL *</Label>
                            <Input placeholder="https://your-cdn.com/file.pdf" value={newContent.fileUrl} onChange={(e) => setNewContent({ ...newContent, fileUrl: e.target.value })} />
                            <p className="text-xs text-slate-500">Upload to your storage (S3/Cloudinary) and paste the URL here.</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddContentOpen(false)}>Cancel</Button>
                          <Button onClick={saveContent} disabled={savingContent || !newContent.title || !newContent.fileUrl} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                            {savingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={contentFilter} onValueChange={(v) => setContentFilter(v as any)}>
                    <SelectTrigger className="w-40 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                  {loadingContent ? (
                    <div className="flex items-center justify-center py-16"><Spinner /></div>
                  ) : content.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">No content yet. Upload a PYQ or note to get started.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200/70 dark:border-slate-700/50">
                          <TableHead className="text-slate-500">Title</TableHead>
                          <TableHead className="text-slate-500">Subject</TableHead>
                          <TableHead className="text-slate-500">Type</TableHead>
                          <TableHead className="text-slate-500">Downloads</TableHead>
                          <TableHead className="text-slate-500">Status</TableHead>
                          <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {content.map((item) => (
                          <TableRow key={item.id} className="border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">{item.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{item.subject}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-slate-200/70 dark:border-slate-700/50">{item.type}</Badge>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">{item.downloads.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={item.status === "published" ? "bg-emerald-500 hover:bg-emerald-600" : item.status === "draft" ? "bg-slate-100 dark:bg-slate-800 text-slate-700" : "bg-red-100 text-red-700"}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={mutating === item.id}>
                                    {mutating === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                                  <DropdownMenuItem asChild className="cursor-pointer">
                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4 mr-2" /> Open File
                                    </a>
                                  </DropdownMenuItem>
                                  {item.status !== "archived" && (
                                    <DropdownMenuItem onClick={() => updateContent(item.id, { status: "archived" })} className="cursor-pointer text-amber-600">
                                      <Lock className="w-4 h-4 mr-2" /> Archive
                                    </DropdownMenuItem>
                                  )}
                                  {item.status === "archived" && (
                                    <DropdownMenuItem onClick={() => updateContent(item.id, { status: "published" })} className="cursor-pointer text-emerald-600">
                                      <Unlock className="w-4 h-4 mr-2" /> Restore
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => deleteContent(item.id)} className="cursor-pointer text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </motion.div>
            )}

            {/* ── MOCK TESTS / CODES ──────────────────────────────────────── */}
            {activeTab === "codes" && (
              <motion.div key="codes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Mock Tests</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage tests and their access codes</p>
                  </div>
                  <Link href="/admin/tests/new">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                      <Plus className="w-4 h-4 mr-2" /> Create Test
                    </Button>
                  </Link>
                </div>

                <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                  {loadingCodes ? (
                    <div className="flex items-center justify-center py-16"><Spinner /></div>
                  ) : codes.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <p className="text-slate-400">No mock tests yet.</p>
                      <Link href="/admin/tests/new">
                        <Button variant="outline" className="border-slate-200/70 dark:border-slate-700/50">
                          <Plus className="w-4 h-4 mr-2" /> Create your first test
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200/70 dark:border-slate-700/50">
                          <TableHead className="text-slate-500">Test</TableHead>
                          <TableHead className="text-slate-500">Access Code</TableHead>
                          <TableHead className="text-slate-500">Questions</TableHead>
                          <TableHead className="text-slate-500">Attempts</TableHead>
                          <TableHead className="text-slate-500">Tier</TableHead>
                          <TableHead className="text-slate-500">Status</TableHead>
                          <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {codes.map((code) => (
                          <TableRow key={code.id} className="border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100 max-w-[180px] truncate">{code.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 font-mono text-sm text-slate-700 dark:text-slate-300">
                                {code.accessCode}
                                <CopyButton text={code.accessCode} />
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">{code.questionsCount}</TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">{code.attemptsCount}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                                {code.requiredTier === "NORMAL" ? "Free" : code.requiredTier === "PREMIUM" ? "Premium" : "Elite"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={code.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}>
                                {code.isActive ? "Live" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={mutating === code.id}>
                                    {mutating === code.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                                  <DropdownMenuItem onClick={() => toggleTestActive(code.id, code.isActive)} className={`cursor-pointer ${code.isActive ? "text-amber-600" : "text-emerald-600"}`}>
                                    {code.isActive ? <><Lock className="w-4 h-4 mr-2" /> Deactivate</> : <><Unlock className="w-4 h-4 mr-2" /> Activate</>}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={`/admin/tests/${code.id}/edit`}>
                                      <Edit className="w-4 h-4 mr-2" /> Edit Test
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </motion.div>
            )}

            {/* ── ANALYTICS ───────────────────────────────────────────────── */}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Analytics</h1>

                {loadingAnalytics ? (
                  <div className="flex justify-center py-16"><Spinner /></div>
                ) : analytics ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                      <CardHeader>
                        <CardTitle className="text-base">New Signups (Last 14 Days)</CardTitle>
                        <CardDescription>Daily student registrations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={analytics.signups}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "white", color: "#1e293b" }} />
                            <Line type="monotone" dataKey="users" stroke="#18181b" strokeWidth={2} dot={{ fill: "#18181b", r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                      <CardHeader>
                        <CardTitle className="text-base">Revenue Trend (₹)</CardTitle>
                        <CardDescription>Monthly subscription revenue</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={analytics.revenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                              cursor={{ fill: "#f8fafc" }}
                              contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "white", color: "#1e293b" }}
                              formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                            />
                            <Bar dataKey="amount" fill="#18181b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">No analytics data available yet.</div>
                )}
              </motion.div>
            )}

            {/* ── BATCHES ─────────────────────────────────────────────────── */}
            {activeTab === "batches" && (
              <motion.div key="batches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Batch Manager</h1>
                <div className="flex items-center justify-center h-64">
                  <Link href="/admin/batches">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                      Open Batch Manager →
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── COUPONS ─────────────────────────────────────────────────── */}
            {activeTab === "coupons" && (
              <motion.div key="coupons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Coupon Manager</h1>
                <div className="flex items-center justify-center h-64">
                  <Link href="/admin/coupons">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                      Open Coupon Manager →
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── AUDIT LOGS ──────────────────────────────────────────────── */}
            {activeTab === "audit" && (
              <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Audit Logs</h1>
                <div className="flex items-center justify-center h-64">
                  <Link href="/admin/audit-logs">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                      Open Audit Logs →
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── LEADS ───────────────────────────────────────────────────── */}
            {activeTab === "leads" && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                      Free Batch Leads
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {leads.length} student{leads.length !== 1 ? "s" : ""} enrolled via free batches
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={exportLeadsCSV}
                    disabled={!leads.length}
                    className="border-slate-200/70 dark:border-slate-700/50"
                  >
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Leads", value: leads.length },
                    { label: "This Month", value: leads.filter((l) => new Date(l.createdAt) > new Date(Date.now() - 30 * 86400000)).length },
                    { label: "Free Batches", value: new Set(leads.map((l) => l.batchId)).size },
                    { label: "Verified Accounts", value: leads.filter((l) => l.user?.email).length },
                  ].map(({ label, value }) => (
                    <Card key={label} className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                      <CardContent className="p-4">
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={leadsBatchFilter} onValueChange={setLeadsBatchFilter}>
                    <SelectTrigger className="w-52 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50">
                      <SelectValue placeholder="All Free Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Free Batches</SelectItem>
                      {allFreeBatches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by name, email, phone..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="pl-9 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50"
                    />
                  </div>

                  {leadsBatchFilter !== "all" && (
                    <Link href={`/admin/batches/${leadsBatchFilter}/edit`}>
                      <Button variant="outline" size="sm" className="border-slate-200/70 dark:border-slate-700/50 gap-1.5">
                        <Edit className="w-3.5 h-3.5" />
                        Configure Lead Form
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}

                  {leadSearch && (
                    <Button variant="ghost" size="sm" onClick={() => setLeadSearch("")} className="text-slate-500">
                      <X className="w-3.5 h-3.5 mr-1" /> Clear
                    </Button>
                  )}
                </div>

                {/* Per-batch summary cards (shown when "all" selected) */}
                {leadsBatchFilter === "all" && allFreeBatches.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allFreeBatches.map((b) => {
                      const batchLeads = leads.filter((l) => l.batchId === b.id);
                      return (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 p-4 bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                          onClick={() => setLeadsBatchFilter(b.id)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{b.name}</p>
                            <p className="text-xs text-slate-500">{batchLeads.length} lead{batchLeads.length !== 1 ? "s" : ""}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <Link href={`/admin/batches/${b.id}/edit`} onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Leads Table */}
                <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] overflow-hidden">
                  {loadingLeads ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-slate-500 font-medium">
                        {leadSearch ? "No leads match your search" : "No leads yet"}
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        {leadSearch
                          ? "Try different search terms"
                          : "Students who enroll in free batches will appear here with their details."}
                      </p>
                      {!leadSearch && allFreeBatches.length === 0 && (
                        <Link href="/admin/batches/new">
                          <Button variant="outline" size="sm" className="mt-2 border-slate-200/70 dark:border-slate-700/50">
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create a Free Batch
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-200/70 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">Date</TableHead>
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">Batch</TableHead>
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">Account</TableHead>
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">Full Name</TableHead>
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">Phone</TableHead>
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">School / College</TableHead>
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">Class / Year</TableHead>
                            <TableHead className="text-slate-500 whitespace-nowrap text-xs font-bold uppercase tracking-wider">District</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLeads.map((lead) => {
                            const d = lead.data as Record<string, string>;
                            return (
                              <TableRow
                                key={lead.id}
                                className="border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                              >
                                <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                                  {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </TableCell>

                                <TableCell>
                                  <button onClick={() => setLeadsBatchFilter(lead.batchId)} className="text-left">
                                    <Badge
                                      variant="secondary"
                                      className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-200 cursor-pointer whitespace-nowrap"
                                    >
                                      {lead.batchName}
                                    </Badge>
                                  </button>
                                </TableCell>

                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                                        {(lead.user?.name ?? d["Full Name"] ?? "?").slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                        {lead.user?.name ?? "Guest"}
                                      </p>
                                      <p className="text-[10px] text-slate-500 whitespace-nowrap">{lead.user?.email ?? "—"}</p>
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell className="text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                                  {d["Full Name"] ?? "—"}
                                </TableCell>

                                <TableCell>
                                  {d["Phone Number"] ? (
                                    <a
                                      href={`tel:${d["Phone Number"]}`}
                                      className="text-slate-700 dark:text-slate-300 font-mono text-sm hover:text-violet-600 dark:hover:text-violet-400 transition-colors whitespace-nowrap"
                                    >
                                      {d["Phone Number"]}
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </TableCell>

                                <TableCell className="text-slate-700 dark:text-slate-300 max-w-[180px]">
                                  <p className="truncate" title={d["School / College"]}>
                                    {d["School / College"] ?? "—"}
                                  </p>
                                </TableCell>

                                <TableCell>
                                  {d["Class / Pass Year"] ? (
                                    <Badge variant="outline" className="border-slate-200/70 dark:border-slate-700/50 text-xs whitespace-nowrap">
                                      {d["Class / Pass Year"]}
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-400 text-sm">—</span>
                                  )}
                                </TableCell>

                                <TableCell className="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  {d["District"] ?? "—"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      {/* Table footer */}
                      <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          Showing {filteredLeads.length} of {leads.length} lead{leads.length !== 1 ? "s" : ""}
                        </p>
                        <Button variant="ghost" size="sm" onClick={exportLeadsCSV} className="text-xs text-slate-500 gap-1.5">
                          <Download className="w-3.5 h-3.5" /> Download CSV
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* ── SETTINGS ────────────────────────────────────────────────── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
                <Card className="border-dashed border-2 border-slate-200/70 dark:border-slate-700/50 p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Settings Panel</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Platform configuration coming in next update.</p>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}