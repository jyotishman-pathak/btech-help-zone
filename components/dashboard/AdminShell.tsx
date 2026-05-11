"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Users, FileText, Timer, Settings, TrendingUp, Shield, Copy, Plus, Search,
  MoreHorizontal, Check, X, Eye, Edit, Trash2, Download, Upload, Clock,
  ChevronDown, ChevronUp, RefreshCw, Lock, Unlock, Code, BarChart3,
  PieChart, Activity, Loader2, AlertCircle, ExternalLink,
  LayoutDashboard,
  User,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "../ui/button";
import { ScrollArea } from "../../@/components/ui/scroll-area";
import { Input } from "../../@/components/ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../../@/components/ui/label";
import { Progress } from "../../@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../@/components/ui/dropdown-menu";
import Link from "next/link";

import { signOut, useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = "dashboard" | "users" | "content" | "codes" | "analytics" | "settings";
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
  return <Loader2 className="w-5 h-5 animate-spin text-zinc-400 mx-auto" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminShell({ admin }: { admin: { name: string; email: string; image?: string } }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
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

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "dashboard") { fetchStats(); }
    if (activeTab === "users") { fetchUsers(); }
    if (activeTab === "content") { fetchContent(); }
    if (activeTab === "codes") { fetchCodes(); }
    if (activeTab === "analytics") { fetchAnalytics(); }
  }, [activeTab]);

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

  // ── Render ───────────────────────────────────────────────────────────────────

  const statCards = stats
    ? [
        { title: "Total Users", value: stats.totalUsers.toLocaleString(), change: trendStr(stats.trends.users), trend: stats.trends.users >= 0 ? "up" as const : "down" as const, icon: Users },
        { title: "Active Today", value: stats.activeToday.toLocaleString(), change: "test sessions", trend: "neutral" as const, icon: Activity },
        { title: "Mocks Completed", value: stats.mocksTotal.toLocaleString(), change: trendStr(stats.trends.mocks), trend: stats.trends.mocks >= 0 ? "up" as const : "down" as const, icon: Timer },
        { title: "Revenue (₹)", value: `₹${stats.revenueTotal.toLocaleString("en-IN")}`, change: trendStr(stats.trends.revenue), trend: stats.trends.revenue >= 0 ? "up" as const : "down" as const, icon: TrendingUp },
      ]
    : [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }} animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-40 flex flex-col"
      >
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-zinc-900 dark:text-white" />
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg text-zinc-900 dark:text-white">
                CEE<span className="text-amber-500 ml-2">HelpZone</span>
              </span>
              <span className="text-[10px] font-medium text-zinc-500 -mt-0.5">Assam • PCM Platform</span>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {([
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "content", label: "Content", icon: FileText },
              { id: "codes", label: "Mock Tests", icon: Code },
              { id: "analytics", label: "Analytics", icon: PieChart },
              { id: "settings", label: "Settings", icon: Settings },
            ] as const).map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={admin.image} />
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
                {admin.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{admin.name}</p>
              <p className="text-xs text-zinc-500 truncate">{admin.email}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 lg:w-80 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
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
      className={`w-4 h-4 transition-transform ${
        sidebarOpen ? "rotate-90" : "-rotate-90"
      }`}
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
          <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
            <AvatarImage src={session.user?.image ?? ""} />
            <AvatarFallback>
              {session.user?.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">
            {session.user?.name}
          </p>

          <p className="text-xs text-zinc-500 truncate">
            {session.user?.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="cursor-pointer"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

      <DropdownMenuItem
  onClick={() => setActiveTab("settings")}
  className="cursor-pointer"
>
  <User className="mr-2 h-4 w-4" />
  Profile Settings
</DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
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
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Platform overview</p>
                  </div>
                  <Button onClick={fetchStats} disabled={loadingStats} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                    {loadingStats ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" /> Refresh</>}
                  </Button>
                </div>

                {/* Stats */}
                {loadingStats ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="border-zinc-200 dark:border-zinc-800 animate-pulse bg-white dark:bg-zinc-900 h-32" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <Card key={stat.title} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stat.value}</p>
                                <div className="flex items-center gap-1 mt-2">
                                  {stat.trend === "up" && <ChevronUp className="w-4 h-4 text-emerald-500" />}
                                  {stat.trend === "down" && <ChevronDown className="w-4 h-4 text-red-500" />}
                                  <span className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-red-600" : "text-zinc-500"}`}>
                                    {stat.change}
                                  </span>
                                  {stat.trend !== "neutral" && <span className="text-xs text-zinc-400">vs last month</span>}
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                <Icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
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
                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                      <CardDescription>Latest user actions across the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.feed.length === 0 ? (
                        <p className="text-sm text-zinc-400 py-4 text-center">No activity yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {stats.feed.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === "success" ? "bg-emerald-500" : item.type === "upgrade" ? "bg-amber-500" : item.type === "join" ? "bg-blue-500" : "bg-purple-500"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.user}</p>
                                <p className="text-xs text-zinc-500 truncate">{item.action}</p>
                              </div>
                              <span className="text-xs text-zinc-400 shrink-0">{item.time}</span>
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
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Users</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">{userTotal.toLocaleString()} total students</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={userFilter} onValueChange={(v) => { setUserFilter(v as any); setUserPage(1); }}>
                      <SelectTrigger className="w-40 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <SelectValue placeholder="Filter tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="NORMAL">Free</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="SUPER_PREMIUM">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportCSV} className="border-zinc-200 dark:border-zinc-800">
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-16"><Spinner /></div>
                  ) : users.length === 0 ? (
                    <div className="py-16 text-center text-zinc-400">No users found.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                          <TableHead className="text-zinc-500">User</TableHead>
                          <TableHead className="text-zinc-500">Tier</TableHead>
                          <TableHead className="text-zinc-500">Mocks</TableHead>
                          <TableHead className="text-zinc-500">Avg Score</TableHead>
                          <TableHead className="text-zinc-500">Status</TableHead>
                          <TableHead className="text-right text-zinc-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.image ?? ""} />
                                  <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
                                    {(user.name ?? "??").slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name ?? "—"}</p>
                                  <p className="text-xs text-zinc-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={user.tier === "NORMAL" ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"}>
                                {user.tier === "SUPER_PREMIUM" ? "Elite" : user.tier}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-zinc-700 dark:text-zinc-300">{user.mocksTaken}</TableCell>
                            <TableCell className="text-zinc-700 dark:text-zinc-300">{user.avgScore || "—"}</TableCell>
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
                                <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                    <p className="text-sm text-zinc-500">Showing {(userPage - 1) * 20 + 1}–{Math.min(userPage * 20, userTotal)} of {userTotal}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)} className="border-zinc-200 dark:border-zinc-800">Previous</Button>
                      <Button variant="outline" size="sm" disabled={userPage * 20 >= userTotal} onClick={() => setUserPage((p) => p + 1)} className="border-zinc-200 dark:border-zinc-800">Next</Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── CONTENT ─────────────────────────────────────────────────── */}
            {activeTab === "content" && (
              <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Content Library</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">PYQs, notes, and study materials</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Link to mock test creator for "Mock" content */}
                    <Link href="/admin/tests/new">
                      <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
                        <Plus className="w-4 h-4 mr-2" /> New Mock Test
                      </Button>
                    </Link>
                    <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                          <Upload className="w-4 h-4 mr-2" /> Upload Content
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                            <p className="text-xs text-zinc-500">Upload to your storage (S3/Cloudinary) and paste the URL here.</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddContentOpen(false)}>Cancel</Button>
                          <Button onClick={saveContent} disabled={savingContent || !newContent.title || !newContent.fileUrl} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                            {savingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={contentFilter} onValueChange={(v) => setContentFilter(v as any)}>
                    <SelectTrigger className="w-40 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
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

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  {loadingContent ? (
                    <div className="flex items-center justify-center py-16"><Spinner /></div>
                  ) : content.length === 0 ? (
                    <div className="py-16 text-center text-zinc-400">No content yet. Upload a PYQ or note to get started.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                          <TableHead className="text-zinc-500">Title</TableHead>
                          <TableHead className="text-zinc-500">Subject</TableHead>
                          <TableHead className="text-zinc-500">Type</TableHead>
                          <TableHead className="text-zinc-500">Downloads</TableHead>
                          <TableHead className="text-zinc-500">Status</TableHead>
                          <TableHead className="text-right text-zinc-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {content.map((item) => (
                          <TableRow key={item.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">{item.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{item.subject}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800">{item.type}</Badge>
                            </TableCell>
                            <TableCell className="text-zinc-700 dark:text-zinc-300">{item.downloads.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={item.status === "published" ? "bg-emerald-500 hover:bg-emerald-600" : item.status === "draft" ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700" : "bg-red-100 text-red-700"}>
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
                                <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Mock Tests</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage tests and their access codes</p>
                  </div>
                  <Link href="/admin/tests/new">
                    <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                      <Plus className="w-4 h-4 mr-2" /> Create Test
                    </Button>
                  </Link>
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  {loadingCodes ? (
                    <div className="flex items-center justify-center py-16"><Spinner /></div>
                  ) : codes.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <p className="text-zinc-400">No mock tests yet.</p>
                      <Link href="/admin/tests/new">
                        <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
                          <Plus className="w-4 h-4 mr-2" /> Create your first test
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                          <TableHead className="text-zinc-500">Test</TableHead>
                          <TableHead className="text-zinc-500">Access Code</TableHead>
                          <TableHead className="text-zinc-500">Questions</TableHead>
                          <TableHead className="text-zinc-500">Attempts</TableHead>
                          <TableHead className="text-zinc-500">Tier</TableHead>
                          <TableHead className="text-zinc-500">Status</TableHead>
                          <TableHead className="text-right text-zinc-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {codes.map((code) => (
                          <TableRow key={code.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 max-w-[180px] truncate">{code.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                                {code.accessCode}
                                <CopyButton text={code.accessCode} />
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-700 dark:text-zinc-300">{code.questionsCount}</TableCell>
                            <TableCell className="text-zinc-700 dark:text-zinc-300">{code.attemptsCount}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
                                {code.requiredTier === "NORMAL" ? "Free" : code.requiredTier === "PREMIUM" ? "Premium" : "Elite"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={code.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}>
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
                                <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Analytics</h1>

                {loadingAnalytics ? (
                  <div className="flex justify-center py-16"><Spinner /></div>
                ) : analytics ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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

                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                            <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "white", color: "#1e293b" }}
                            formatter={(v) => [
  `₹${Number(v).toLocaleString("en-IN")}`,
  "Revenue",
]} />
                            <Bar dataKey="amount" fill="#18181b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-16 text-zinc-400">No analytics data available yet.</div>
                )}
              </motion.div>
            )}

            {/* ── SETTINGS ────────────────────────────────────────────────── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
                <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Settings Panel</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">Platform configuration coming in next update.</p>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}