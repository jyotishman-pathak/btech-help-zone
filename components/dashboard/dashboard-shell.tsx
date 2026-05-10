// components/dashboard/DashboardShell.tsx
"use client";

import { useState, useEffect } from "react";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  Atom, Calculator, Microscope, Trophy, Flame, Zap, Target, TrendingUp,
  Clock, Calendar, CheckCircle2, Circle, AlertCircle, Crown, BookOpen,
  ChevronRight, Lock, Star, BrainCircuit, GraduationCap, ArrowUpRight, Timer, Activity, LayoutDashboard,
  BarChart3, ChevronDown, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../../@/components/ui/progress";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback,  AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList,  TabsTrigger } from "../../@/components/ui/tabs";
import { ScrollArea } from "../../@/components/ui/scroll-area";

// Types
interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

type Tier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

// Mock Data
const CEE_DATE = "2027-05-15T09:00:00";

const SUBJECTS = [
  { name: "Physics", progress: 72, topicsDone: 32, topicsTotal: 45, icon: Atom, color: "text-zinc-700 dark:text-zinc-300", light: "bg-zinc-100 dark:bg-zinc-800" },
  { name: "Chemistry", progress: 58, topicsDone: 24, topicsTotal: 42, icon: Microscope, color: "text-zinc-700 dark:text-zinc-300", light: "bg-zinc-100 dark:bg-zinc-800" },
  { name: "Mathematics", progress: 81, topicsDone: 40, topicsTotal: 50, icon: Calculator, color: "text-zinc-700 dark:text-zinc-300", light: "bg-zinc-100 dark:bg-zinc-800" },
];

const SCORE_HISTORY = [
  { test: "Mock 1", total: 280 },
  { test: "Mock 2", total: 310 },
  { test: "Mock 3", total: 295 },
  { test: "Mock 4", total: 340 },
  { test: "Mock 5", total: 355 },
  { test: "Mock 6", total: 372 },
  { test: "Mock 7", total: 390 },
  { test: "Mock 8", total: 410 },
];

const RADAR_DATA = [
  { subject: "Mechanics", score: 85 },
  { subject: "Electro", score: 70 },
  { subject: "Organic", score: 60 },
  { subject: "Inorganic", score: 55 },
  { subject: "Calculus", score: 90 },
  { subject: "Algebra", score: 88 },
];

const RECENT_TESTS = [
  { id: 1, name: "Full Syllabus Mock #12", score: 410, max: 480, date: "2 hrs ago", rank: 45, accuracy: 85, trend: "up" as const },
  { id: 2, name: "Physics Mechanics Drills", score: 135, max: 160, date: "Yesterday", rank: 12, accuracy: 92, trend: "up" as const },
  { id: 3, name: "Chemistry Organic Blast", score: 98, max: 160, date: "2 days ago", rank: 89, accuracy: 61, trend: "down" as const },
  { id: 4, name: "Math Calculus Extreme", score: 150, max: 160, date: "3 days ago", rank: 3, accuracy: 94, trend: "up" as const },
];

const LEADERBOARD = [
  { rank: 1, name: "Rahul D.", avatar: "RD", college: "AEC", score: 445 },
  { rank: 2, name: "Priyanka G.", avatar: "PG", college: "JEC", score: 438 },
  { rank: 3, name: "You", avatar: "YO", college: "AEC", score: 410, isUser: true },
  { rank: 4, name: "Bikash S.", avatar: "BS", college: "BBEC", score: 405 },
  { rank: 5, name: "Ananya T.", avatar: "AT", college: "AEC", score: 398 },
];

const GOALS = [
  { id: 1, text: "Solve 50 Physics MCQs (Mechanics)", done: true },
  { id: 2, text: "Organic Chemistry Named Revisions", done: true },
  { id: 3, text: "Integration Practice Set - Level 3", done: false },
  { id: 4, text: "Previous Year CEE Paper 2024", done: false },
];

const COLLEGE_PREDICTOR = [
  { name: "AEC Guwahati", cutoff: 420, current: 410, status: "Close", color: "text-amber-600 dark:text-amber-400", safe: false },
  { name: "JEC Jorhat", cutoff: 380, current: 410, status: "Safe", color: "text-emerald-600 dark:text-emerald-400", safe: true },
  { name: "BBEC Kokrajhar", cutoff: 340, current: 410, status: "Safe", color: "text-emerald-600 dark:text-emerald-400", safe: true },
];

const BADGES = [
  { name: "7-Day Streak", icon: Flame },
  { name: "Top 50", icon: Trophy },
  { name: "Math Wizard", icon: Calculator },
  { name: "Early Bird", icon: Clock },
];

// Helpers
function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CircularProgress({ value, size = 70, stroke = 6, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-zinc-200 dark:text-zinc-800" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="text-zinc-900 dark:text-zinc-100 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function CountdownBlock() {
  const [time, setTime] = useState(getTimeLeft(CEE_DATE));
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft(CEE_DATE)), 1000);
    return () => clearInterval(t);
  }, []);

  const Box = ({ val, label }: { val: number; label: string }) => (
    <div className="flex flex-col items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 min-w-[70px] border border-zinc-200 dark:border-zinc-700">
      <span className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{val.toString().padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <Box val={time.days} label="Days" />
      <span className="text-xl font-bold text-zinc-500 dark:text-zinc-400">:</span>
      <Box val={time.hours} label="Hrs" />
      <span className="text-xl font-bold text-zinc-500 dark:text-zinc-400">:</span>
      <Box val={time.minutes} label="Min" />
      <span className="text-xl font-bold text-zinc-500 dark:text-zinc-400">:</span>
      <Box val={time.seconds} label="Sec" />
    </div>
  );
}

function SubjectCard({ sub }: { sub: typeof SUBJECTS[0] }) {
  const Icon = sub.icon;
  return (
    <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 ${sub.light} rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${sub.light}`}>
            <Icon className={`w-5 h-5 ${sub.color}`} />
          </div>
          <Badge variant="secondary" className="font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
            {sub.topicsDone}/{sub.topicsTotal}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 text-zinc-900 dark:text-zinc-100">{sub.name}</CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">{sub.topicsTotal - sub.topicsDone} topics remaining</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <CircularProgress value={sub.progress} size={60} stroke={5}>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{sub.progress}%</span>
          </CircularProgress>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Syllabus</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{sub.progress}%</span>
            </div>
            <Progress value={sub.progress} className="h-2 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-zinc-900 dark:[&>div]:bg-zinc-100" />
            <Button size="sm" variant="ghost" className={`h-7 text-xs ${sub.color} hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
              Resume Study <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Tier Gate Component (inline for safety)
function TierGate({ tier, required, fallback, children, upsellTitle, upsellDescription }: { 
  tier: Tier; 
  required: Tier; 
  fallback?: "blur" | "hide" | "upsell"; 
  children: React.ReactNode;
  upsellTitle?: string;
  upsellDescription?: string;
}) {
  const tiers: Record<Tier, number> = { NORMAL: 0, PREMIUM: 1, SUPER_PREMIUM: 2 };
  const hasAccess = tiers[tier] >= tiers[required];

  if (hasAccess) return <>{children}</>;

  if (fallback === "hide") return null;

  if (fallback === "upsell") {
    return (
      <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 text-center">
        <Lock className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{upsellTitle || "Premium Feature"}</h4>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{upsellDescription || "Upgrade to unlock this feature."}</p>
        <Button size="sm" className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
          Upgrade to {required}
        </Button>
      </Card>
    );
  }

  // Default: blur
  return (
    <div className="relative">
      <div className="blur-sm select-none pointer-events-none opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="secondary" className="bg-zinc-900/90 text-white dark:bg-white/90 dark:text-zinc-900 px-4 py-2">
          <Lock className="w-3.5 h-3.5 mr-1.5" /> {required} Required
        </Badge>
      </div>
    </div>
  );
}

// Main Component
export function DashboardShell({ user, tier = "NORMAL" }: { user?: User; tier?: Tier }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isPremium = tier === "PREMIUM" || tier === "SUPER_PREMIUM";
  const isSuper = tier === "SUPER_PREMIUM";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(#808080 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <div className="container mx-auto p-4 md:p-6 max-w-7xl relative">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back, {user?.name?.split(" ")[0] || "Warrior"} 👋
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              CEE 2027 Rank Destroyer Mode {tier === "NORMAL" && "— Free Tier"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1 px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              12 Day Streak
            </Badge>
            {tier !== "NORMAL" && (
              <Badge className={`gap-1 ${tier === "SUPER_PREMIUM" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"} hover:opacity-90`}>
                {tier === "SUPER_PREMIUM" ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {tier}
              </Badge>
            )}
            <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-950 shadow-sm">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
          </div>
        </motion.div>

        {/* Bento Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Countdown — ALL TIERS */}
          <Card className="md:col-span-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-none shadow-xl">
            <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 text-sm font-medium mb-1">
                    <Target className="w-4 h-4" /> Assam CEE 2027
                  </div>
                  <h2 className="text-2xl font-bold">The Final Countdown</h2>
                </div>
                <div className="bg-white/10 dark:bg-zinc-900/10 p-2 rounded-lg backdrop-blur-sm">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <CountdownBlock />
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-600 mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Exam Date: May 15, 2027 • 9:00 AM IST
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards — PREMIUM+ only */}
          <TierGate tier={tier} required="PREMIUM" fallback="blur">
            <Card className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-none shadow-xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-white/10 dark:bg-zinc-900/10 p-2 rounded-lg"><Activity className="w-5 h-5" /></div>
                  <Badge className="bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900 border-none">Top 2%</Badge>
                </div>
                <div>
                  <div className="text-3xl font-black">#45</div>
                  <div className="text-sm text-zinc-400 dark:text-zinc-600">Mock Test Rank</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600 mt-2">
                  <ArrowUpRight className="w-3 h-3" /> Up 12 ranks
                </div>
              </CardContent>
            </Card>
          </TierGate>

          <TierGate tier={tier} required="PREMIUM" fallback="blur">
            <Card className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-none shadow-xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-white/10 dark:bg-zinc-900/10 p-2 rounded-lg"><BrainCircuit className="w-5 h-5" /></div>
                </div>
                <div>
                  <div className="text-3xl font-black">85.4%</div>
                  <div className="text-sm text-zinc-400 dark:text-zinc-600">Avg. Accuracy</div>
                </div>
                <div className="w-full bg-zinc-800 dark:bg-zinc-200 rounded-full h-1.5 mt-3">
                  <div className="bg-white dark:bg-zinc-900 h-1.5 rounded-full" style={{ width: "85%" }} />
                </div>
              </CardContent>
            </Card>
          </TierGate>

          {/* Normal tier filler cards */}
          {tier === "NORMAL" && (
            <>
              <Card className="bg-zinc-100 dark:bg-zinc-900 border-dashed border-2 border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-center gap-2">
                <Lock className="w-6 h-6 text-zinc-400" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Rank Tracking</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Upgrade to Premium</p>
              </Card>
              <Card className="bg-zinc-100 dark:bg-zinc-900 border-dashed border-2 border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-center gap-2">
                <Lock className="w-6 h-6 text-zinc-400" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Accuracy Stats</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Upgrade to Premium</p>
              </Card>
            </>
          )}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-1 h-12">
                <TabsTrigger value="overview" className="gap-2 text-sm font-semibold data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 transition-all">
                  <LayoutDashboard className="w-4 h-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 text-sm font-semibold data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 transition-all">
                  <BarChart3 className="w-4 h-4" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="syllabus" className="gap-2 text-sm font-semibold data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 transition-all">
                  <BookOpen className="w-4 h-4" /> Syllabus
                </TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="mt-6 space-y-6 animate-in slide-in-from-bottom-4">
                
                {/* Subject Cards — ALL TIERS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SUBJECTS.map((sub) => (
                    <SubjectCard key={sub.name} sub={sub} />
                  ))}
                </div>

                {/* Mock Tests — Tier Gated */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <Timer className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Mock Tests
                      </CardTitle>
                      {tier === "NORMAL" && (
                        <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">1 Free Only</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tier === "NORMAL" ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Full Syllabus Mock #1</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">480 marks • 3 hours</div>
                          </div>
                          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                            <Zap className="w-4 h-4 mr-2" /> Start Free Mock
                          </Button>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between opacity-60">
                          <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-zinc-400" />
                            <div>
                              <div className="font-semibold text-zinc-700 dark:text-zinc-300">Full Syllabus Mock #2</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">Locked</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800">Upgrade</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {RECENT_TESTS.map((test) => (
                          <div key={test.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${test.trend === "up" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
                                <TrendingUp className={`w-5 h-5 ${test.trend === "down" ? "rotate-180" : ""}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{test.name}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{test.date} • Rank #{test.rank}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-zinc-900 dark:text-zinc-100">{test.score}<span className="text-zinc-500 dark:text-zinc-400 text-xs font-normal">/{test.max}</span></div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">{test.accuracy}% accuracy</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button className="h-auto py-4 flex-col gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-lg">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-bold">Past Year Papers</span>
                  </Button>
                  <Button className="h-auto py-4 flex-col gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-lg">
                    <Zap className="w-5 h-5" />
                    <span className="text-xs font-bold">Start Mock</span>
                  </Button>
                  <TierGate tier={tier} required="PREMIUM" fallback="hide">
                    <Button className="h-auto py-4 flex-col gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-lg">
                      <Target className="w-5 h-5" />
                      <span className="text-xs font-bold">Weak Areas</span>
                    </Button>
                  </TierGate>
                  <TierGate tier={tier} required="PREMIUM" fallback="hide">
                    <Button className="h-auto py-4 flex-col gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-lg">
                      <BrainCircuit className="w-5 h-5" />
                      <span className="text-xs font-bold">Revision</span>
                    </Button>
                  </TierGate>
                </div>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="mt-6 space-y-6 animate-in slide-in-from-bottom-4">
                <TierGate 
                  tier={tier}
                  required="PREMIUM"
                  fallback="upsell"
                  upsellTitle="Detailed Analytics"
                  upsellDescription="Track your score trajectory, subject breakdown, and identify weak topics."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4">
                      <CardTitle className="text-sm font-semibold mb-4 text-zinc-700 dark:text-zinc-300">Score Trajectory</CardTitle>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={SCORE_HISTORY}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[200, 480]} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", backgroundColor: "white", color: "#1e293b" }} />
                          <Line type="monotone" dataKey="total" stroke="#18181b" strokeWidth={3} dot={{ fill: "#18181b", r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4">
                      <CardTitle className="text-sm font-semibold mb-4 text-zinc-700 dark:text-zinc-300">Subject-wise Breakdown</CardTitle>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={SCORE_HISTORY.slice(-5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "white", color: "#1e293b" }} />
                          <Bar dataKey="total" fill="#18181b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>

                  {/* SUPER PREMIUM: Radar */}
                  <TierGate 
                    tier={tier}
                    required="SUPER_PREMIUM"
                    fallback="upsell"
                    upsellTitle="AI-Powered Deep Analytics"
                    upsellDescription="Topic strength radar, weakness prediction, and personalized study plans."
                  >
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4 mt-4">
                      <CardTitle className="text-sm font-semibold mb-4 text-zinc-700 dark:text-zinc-300">Topic Strength Radar</CardTitle>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={RADAR_DATA}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                          <Radar name="You" dataKey="score" stroke="#18181b" fill="#18181b" fillOpacity={0.1} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Card>
                  </TierGate>
                </TierGate>
              </TabsContent>

              {/* SYLLABUS TAB */}
              <TabsContent value="syllabus" className="mt-6 space-y-4 animate-in slide-in-from-bottom-4">
                {SUBJECTS.map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <Card key={sub.name} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${sub.light}`}><Icon className={`w-5 h-5 ${sub.color}`} /></div>
                            <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">{sub.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className={`${sub.color} border-zinc-200 dark:border-zinc-800`}>{sub.progress}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Progress value={sub.progress} className="h-2 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-zinc-900 dark:[&>div]:bg-zinc-100" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                              {i < (sub.progress / 20) ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />}
                              <span className="truncate">Chapter {i + 1}: {sub.name} Core Topic</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Daily Goals — ALL TIERS */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Target className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /> Daily Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {GOALS.map((goal) => (
                    <div key={goal.id} className={`flex items-start gap-3 p-2 rounded-lg ${goal.done ? "bg-zinc-50 dark:bg-zinc-900/50" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"}`}>
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${goal.done ? "bg-emerald-500 border-emerald-500" : "border-zinc-300 dark:border-zinc-700"}`}>
                        {goal.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={`text-sm ${goal.done ? "text-zinc-400 line-through" : "text-zinc-700 dark:text-zinc-300 font-medium"}`}>
                        {goal.text}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                  <Zap className="w-4 h-4 mr-2" /> Start Focus Mode
                </Button>
              </CardContent>
            </Card>

            {/* College Predictor — PREMIUM+ */}
            <TierGate 
              tier={tier}
              required="PREMIUM"
              fallback="upsell"
              upsellTitle="College Predictor"
              upsellDescription="See which Assam government colleges you can get into based on your mock scores."
            >
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <GraduationCap className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /> College Predictor
                  </CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">Based on your last mock score (410)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {COLLEGE_PREDICTOR.map((col) => (
                    <div key={col.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{col.name}</span>
                        <span className={`font-bold ${col.color}`}>{col.status}</span>
                      </div>
                      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${col.safe ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min((col.current / col.cutoff) * 100, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span>Cutoff: {col.cutoff}</span>
                        <span>You: {col.current}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TierGate>

            {/* Leaderboard — PREMIUM+ */}
            <TierGate 
              tier={tier}
              required="PREMIUM"
              fallback="blur"
            >
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Crown className="w-4 h-4 text-amber-500" /> Top Warriors
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[280px] px-6 pb-4">
                    <div className="space-y-4 pt-2">
                      {LEADERBOARD.map((entry, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl ${entry.isUser ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"}`}>
                          <div className={`w-6 text-center text-sm font-black ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-zinc-400" : idx === 2 ? "text-orange-500" : "text-zinc-400"}`}>
                            {entry.rank}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-[10px] font-bold ${entry.isUser ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}>
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">{entry.name}</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{entry.college} Target</div>
                          </div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{entry.score}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TierGate>

            {/* Badges — ALL TIERS */}
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map((badge) => (
                <div key={badge.name} className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <badge.icon className="w-6 h-6 mb-1 text-zinc-700 dark:text-zinc-300" />
                  <span className="text-[10px] font-bold text-center leading-tight text-zinc-700 dark:text-zinc-300">{badge.name}</span>
                </div>
              ))}
            </div>

            {/* Battle Arena — SUPER PREMIUM only */}
            <TierGate 
              tier={tier}
              required="SUPER_PREMIUM"
              fallback="upsell"
              upsellTitle="Battle Arena"
              upsellDescription="1v1 live battles with other CEE aspirants. Super Premium only."
            >
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-amber-500 text-white p-3 rounded-xl">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Battle Arena Live</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">12 players online now</div>
                  </div>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Join</Button>
                </CardContent>
              </Card>
            </TierGate>

          </div>
        </div>
      </div>
    </div>
  );
}