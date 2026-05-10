// components/admin/AdminShell.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../@/components/ui/table";






import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";


 import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import {
  Users, FileText, Timer, Settings, TrendingUp, Shield, Copy, Plus, Search, Filter, MoreHorizontal,
  Check, X, Eye, Edit, Trash2, Download, Upload, Calendar, Clock, MapPin, Mail, Phone, GraduationCap,
  ChevronDown, ChevronUp, RefreshCw, Sparkles, Lock, Unlock, Code, BarChart3, PieChart, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "../ui/button";
import { ScrollArea } from "../../@/components/ui/scroll-area";

import { Input } from "../../@/components/ui/input";
import { Badge } from "../ui/badge";


import { Label } from "../../@/components/ui/label";
import { Progress } from "../../@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../@/components/ui/dropdown-menu";


// Types
type AdminTab = "dashboard" | "users" | "content" | "codes" | "analytics" | "settings";

interface User {
  id: string;
  name: string;
  email: string;
  tier: "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";
  joined: string;
  lastActive: string;
  mocksTaken: number;
  avgScore: number;
  status: "active" | "suspended";
}

interface ContentItem {
  id: string;
  title: string;
  subject: "Physics" | "Chemistry" | "Mathematics" | "Mixed";
  type: "PYQ" | "Note" | "Mock";
  uploaded: string;
  views: number;
  status: "published" | "draft" | "archived";
}

interface AccessCode {
  id: string;
  code: string;
  test: string;
  maxUses: number;
  used: number;
  expires: string;
  active: boolean;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
}

// Mock Data
const STATS: StatCard[] = [
  { title: "Total Users", value: "2,847", change: "+12.5%", trend: "up", icon: Users },
  { title: "Active Today", value: "412", change: "+8.2%", trend: "up", icon: Activity },
  { title: "Mocks Completed", value: "1,923", change: "+24.1%", trend: "up", icon: Timer },
  { title: "Revenue (₹)", value: "1,84,290", change: "+18.7%", trend: "up", icon: TrendingUp },
];

const USERS: User[] = [
  { id: "1", name: "Rahul Das", email: "rahul.d@example.com", tier: "PREMIUM", joined: "2026-01-15", lastActive: "2 hrs ago", mocksTaken: 24, avgScore: 387, status: "active" },
  { id: "2", name: "Priyanka Gogoi", email: "priya.g@example.com", tier: "SUPER_PREMIUM", joined: "2026-02-03", lastActive: "5 min ago", mocksTaken: 41, avgScore: 421, status: "active" },
  { id: "3", name: "Bikash Sharma", email: "bikash.s@example.com", tier: "NORMAL", joined: "2026-03-12", lastActive: "1 day ago", mocksTaken: 3, avgScore: 215, status: "active" },
  { id: "4", name: "Ananya Borah", email: "ananya.b@example.com", tier: "PREMIUM", joined: "2026-01-28", lastActive: "3 hrs ago", mocksTaken: 18, avgScore: 356, status: "suspended" },
  { id: "5", name: "Debjit Saikia", email: "debjit.s@example.com", tier: "NORMAL", joined: "2026-04-01", lastActive: "Just now", mocksTaken: 1, avgScore: 198, status: "active" },
];

const CONTENT: ContentItem[] = [
  { id: "1", title: "CEE Physics 2024 Solved", subject: "Physics", type: "PYQ", uploaded: "2026-04-10", views: 1247, status: "published" },
  { id: "2", title: "Organic Chemistry Formula Sheet", subject: "Chemistry", type: "Note", uploaded: "2026-04-08", views: 892, status: "published" },
  { id: "3", title: "Full Syllabus Mock #15", subject: "Mixed", type: "Mock", uploaded: "2026-04-12", views: 2103, status: "published" },
  { id: "4", title: "Calculus Shortcuts PDF", subject: "Mathematics", type: "Note", uploaded: "2026-04-05", views: 634, status: "draft" },
  { id: "5", title: "CEE Chemistry 2023 Analysis", subject: "Chemistry", type: "PYQ", uploaded: "2026-03-28", views: 445, status: "archived" },
];

const ACCESS_CODES: AccessCode[] = [
  { id: "1", code: "CEE-PHY-2026-A7X9", test: "Physics Mechanics Mock", maxUses: 100, used: 73, expires: "2026-06-30", active: true },
  { id: "2", code: "CEE-CHE-2026-B2M4", test: "Organic Chemistry Blast", maxUses: 50, used: 50, expires: "2026-05-15", active: false },
  { id: "3", code: "CEE-MATH-2026-K8P1", test: "Calculus Extreme", maxUses: 200, used: 12, expires: "2026-07-31", active: true },
];

const SIGNUP_DATA = [
  { date: "Apr 1", users: 12 }, { date: "Apr 5", users: 28 }, { date: "Apr 10", users: 45 },
  { date: "Apr 15", users: 67 }, { date: "Apr 20", users: 89 }, { date: "Apr 25", users: 112 },
];

const REVENUE_DATA = [
  { month: "Jan", amount: 12400 }, { month: "Feb", amount: 18900 }, { month: "Mar", amount: 24500 },
  { month: "Apr", amount: 31200 }, { month: "May", amount: 42800 }, { month: "Jun", amount: 54100 },
];

// Helper Components
function StatCard({ stat }: { stat: StatCard }) {
  const Icon = stat.icon;
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{stat.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {stat.trend === "up" && <ChevronUp className="w-4 h-4 text-emerald-500" />}
              {stat.trend === "down" && <ChevronDown className="w-4 h-4 text-red-500" />}
              <span className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : stat.trend === "down" ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`}>
                {stat.change}
              </span>
              <span className="text-xs text-zinc-400">vs last month</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0">
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}

// Main Component
export function AdminShell() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "NORMAL" | "PREMIUM" | "SUPER_PREMIUM">("all");
  const [contentFilter, setContentFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [isAddCodeOpen, setIsAddCodeOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [newCode, setNewCode] = useState({ test: "", maxUses: 100, days: 30 });
  const [newContent, setNewContent] = useState({ title: "", subject: "Physics" as const, type: "Note" as const, file: null as File | null });

  // Generate random access code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "CEE-";
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      code += "-";
    }
    code += Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    return code;
  };

  const filteredUsers = USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = userFilter === "all" || u.tier === userFilter;
    return matchesSearch && matchesTier;
  });

  const filteredContent = CONTENT.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = contentFilter === "all" || c.status === contentFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-zinc-900 dark:bg-white blur opacity-20" />
              <Shield className="relative h-6 w-6 text-zinc-900 dark:text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black tracking-tight text-zinc-900 dark:text-white">CEE Admin</span>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 -mt-0.5">Assam • PCM</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "content", label: "Content", icon: FileText },
              { id: "codes", label: "Access Codes", icon: Code },
              { id: "analytics", label: "Analytics", icon: PieChart },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Admin User</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">admin@ceeprep.in</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 ml-0 ${sidebarOpen ? "md:ml-64" : ""} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Search users, content, codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 lg:w-80 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex">
                {sidebarOpen ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronUp className="w-4 h-4 rotate-90" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Overview of your CEE prep platform</p>
                  </div>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATS.map((stat) => (
                    <StatCard key={stat.title} stat={stat} />
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader>
                      <CardTitle className="text-base">User Signups</CardTitle>
                      <CardDescription>New registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={SIGNUP_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "white", color: "#1e293b" }} />
                          <Line type="monotone" dataKey="users" stroke="#18181b" strokeWidth={2} dot={{ fill: "#18181b", r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader>
                      <CardTitle className="text-base">Revenue Trend</CardTitle>
                      <CardDescription>Monthly subscription revenue (₹)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={REVENUE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "white", color: "#1e293b" }} />
                          <Bar dataKey="amount" fill="#18181b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription>Latest user actions and system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { user: "Priyanka G.", action: "Completed Mock #15", time: "5 min ago", type: "success" },
                        { user: "Rahul D.", action: "Upgraded to PREMIUM", time: "23 min ago", type: "upgrade" },
                        { user: "System", action: "New PYQ uploaded: Physics 2024", time: "1 hr ago", type: "content" },
                        { user: "Bikash S.", action: "Used access code CEE-PHY-2026-A7X9", time: "2 hrs ago", type: "code" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                          <div className={`w-2 h-2 rounded-full ${item.type === "success" ? "bg-emerald-500" : item.type === "upgrade" ? "bg-amber-500" : item.type === "content" ? "bg-blue-500" : "bg-purple-500"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.user}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.action}</p>
                          </div>
                          <span className="text-xs text-zinc-400">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* USERS */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">User Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">View, filter, and manage student accounts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={userFilter} onValueChange={(v) => setUserFilter(v as any)}>
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
                    <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
                                  {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                                <p className="text-xs text-zinc-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.tier === "NORMAL" ? "secondary" : "default"} className={user.tier === "NORMAL" ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"}>
                              {user.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-700 dark:text-zinc-300">{user.mocksTaken}</TableCell>
                          <TableCell className="text-zinc-700 dark:text-zinc-300">{user.avgScore}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "active" ? "outline" : "destructive"} className={user.status === "active" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : ""}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <DropdownMenuItem className="cursor-pointer"><Eye className="w-4 h-4 mr-2" /> View Profile</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Edit Tier</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Suspend</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            )}

            {/* CONTENT */}
            {activeTab === "content" && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Content Library</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage PYQs, notes, and mock tests</p>
                  </div>
                  <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                        <Plus className="w-4 h-4 mr-2" /> Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <DialogHeader>
                        <DialogTitle>Upload New Content</DialogTitle>
                        <DialogDescription>Add a new PYQ, note, or mock test for CEE aspirants.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input placeholder="e.g., CEE Physics 2025 Solved" value={newContent.title} onChange={(e) => setNewContent({ ...newContent, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select value={newContent.subject} onValueChange={(v) => setNewContent({ ...newContent, subject: v as any })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Physics">Physics</SelectItem>
                                <SelectItem value="Chemistry">Chemistry</SelectItem>
                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={newContent.type} onValueChange={(v) => setNewContent({ ...newContent, type: v as any })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PYQ">PYQ</SelectItem>
                                <SelectItem value="Note">Note</SelectItem>
                                <SelectItem value="Mock">Mock Test</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>File Upload</Label>
                          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                            <p className="text-sm text-zinc-500">Drag & drop or click to upload PDF/ZIP</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddContentOpen(false)}>Cancel</Button>
                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">Publish Content</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={contentFilter} onValueChange={(v) => setContentFilter(v as any)}>
                    <SelectTrigger className="w-40 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-200 dark:border-zinc-800">
                        <TableHead className="text-zinc-500">Title</TableHead>
                        <TableHead className="text-zinc-500">Subject</TableHead>
                        <TableHead className="text-zinc-500">Type</TableHead>
                        <TableHead className="text-zinc-500">Views</TableHead>
                        <TableHead className="text-zinc-500">Status</TableHead>
                        <TableHead className="text-right text-zinc-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((item) => (
                        <TableRow key={item.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{item.subject}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800">{item.type}</Badge>
                          </TableCell>
                          <TableCell className="text-zinc-700 dark:text-zinc-300">{item.views.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "published" ? "default" : item.status === "draft" ? "secondary" : "destructive"} className={item.status === "published" ? "bg-emerald-500 hover:bg-emerald-600" : item.status === "draft" ? "bg-zinc-100 dark:bg-zinc-800" : ""}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <DropdownMenuItem className="cursor-pointer"><Eye className="w-4 h-4 mr-2" /> Preview</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                {item.status !== "archived" && <DropdownMenuItem className="cursor-pointer text-amber-600"><Lock className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>}
                                {item.status === "archived" && <DropdownMenuItem className="cursor-pointer text-emerald-600"><Unlock className="w-4 h-4 mr-2" /> Restore</DropdownMenuItem>}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            )}

            {/* ACCESS CODES */}
            {activeTab === "codes" && (
              <motion.div
                key="codes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Access Codes</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Generate and manage admin-controlled test codes</p>
                  </div>
                  <Dialog open={isAddCodeOpen} onOpenChange={setIsAddCodeOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                        <Plus className="w-4 h-4 mr-2" /> Generate Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <DialogHeader>
                        <DialogTitle>Create New Access Code</DialogTitle>
                        <DialogDescription>Set parameters for a new admin-controlled mock test code.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Test Name</Label>
                          <Input placeholder="e.g., Physics Mechanics Mock" value={newCode.test} onChange={(e) => setNewCode({ ...newCode, test: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Uses</Label>
                            <Input type="number" value={newCode.maxUses} onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) || 0 })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Expiry (Days)</Label>
                            <Input type="number" value={newCode.days} onChange={(e) => setNewCode({ ...newCode, days: parseInt(e.target.value) || 0 })} />
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Preview Code</p>
                          <div className="flex items-center gap-2">
                            <code className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">{generateCode()}</code>
                            <CopyButton text={generateCode()} />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCodeOpen(false)}>Cancel</Button>
                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">Generate & Activate</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-200 dark:border-zinc-800">
                        <TableHead className="text-zinc-500">Code</TableHead>
                        <TableHead className="text-zinc-500">Test</TableHead>
                        <TableHead className="text-zinc-500">Usage</TableHead>
                        <TableHead className="text-zinc-500">Expires</TableHead>
                        <TableHead className="text-zinc-500">Status</TableHead>
                        <TableHead className="text-right text-zinc-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ACCESS_CODES.map((code) => (
                        <TableRow key={code.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <TableCell className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                              {code.code}
                              <CopyButton text={code.code} />
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-700 dark:text-zinc-300">{code.test}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={(code.used / code.maxUses) * 100} className="h-2 w-24 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-zinc-900 dark:[&>div]:bg-zinc-100" />
                              <span className="text-xs text-zinc-500">{code.used}/{code.maxUses}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-700 dark:text-zinc-300">{code.expires}</TableCell>
                          <TableCell>
                            <Badge variant={code.active ? "default" : "secondary"} className={code.active ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}>
                              {code.active ? "Active" : "Expired"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <DropdownMenuItem className="cursor-pointer"><Eye className="w-4 h-4 mr-2" /> View Usage</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Edit Limits</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600"><X className="w-4 h-4 mr-2" /> Deactivate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            )}

            {/* ANALYTICS & SETTINGS can be added similarly */}
            {["analytics", "settings"].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center h-64"
              >
                <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{activeTab === "analytics" ? "Analytics Module" : "Settings Panel"}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">Coming soon in the next update.</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Bell icon helper (since lucide-react doesn't export it by default in some setups)
function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}