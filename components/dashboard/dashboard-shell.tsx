"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import {
  Atom, Calculator, Microscope, Trophy, Flame, Zap, Target,
  TrendingUp, Clock, Calendar, CheckCircle2, Circle, AlertCircle,
  Crown, BookOpen, ChevronRight, Lock, BrainCircuit, GraduationCap,
  ArrowUpRight, Timer, Activity, LayoutDashboard, BarChart3, Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

type Tier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

export interface DashboardData {
  subjects: Array<{
    name: string;
    progress: number;
    topicsDone: number;
    topicsTotal: number;
  }>;
  scoreHistory: Array<{ test: string; total: number }>;
  recentTests: Array<{
    id: string;
    name: string;
    score: number;
    maxScore: number;
    date: string;
    accuracy: number;
    trend: "up" | "down";
  }>;
  leaderboard: Array<{
    rank: number;
    name: string;
    avatar: string;
    score: number;
    isUser?: boolean;
  }>;
  collegePredictor: Array<{
    name: string;
    cutoff: number;
    current: number;
    status: string;
    safe: boolean;
    color: string;
  }>;
  radarData: Array<{ subject: string; score: number }>;
  earnedBadges: Array<{ name: string; key: string }>;
  streak: number;
  bestScore: number;
  totalAttempts: number;
  userRank?: number;
}

// ─── Static mappings (icons can't be serialized from server) ─────────────────

const SUBJECT_META: Record<string, { icon: React.ElementType; color: string; light: string }> = {
  Physics:     { icon: Atom,       color: "text-slate-700 dark:text-slate-300", light: "bg-slate-100 dark:bg-slate-800" },
  Chemistry:   { icon: Microscope, color: "text-slate-700 dark:text-slate-300", light: "bg-slate-100 dark:bg-slate-800" },
  Mathematics: { icon: Calculator, color: "text-slate-700 dark:text-slate-300", light: "bg-slate-100 dark:bg-slate-800" },
};

const FALLBACK_META = { icon: BookOpen, color: "text-slate-700 dark:text-slate-300", light: "bg-slate-100 dark:bg-slate-800" };

const BADGE_ICONS: Record<string, React.ElementType> = {
  streak:     Flame,
  rank:       Trophy,
  veteran:    Star,
  firstblood: Zap,
};

const STATIC_GOALS = [
  { id: 1, text: "Solve 50 Physics MCQs (Mechanics)", done: false },
  { id: 2, text: "Organic Chemistry Named Revisions", done: false },
  { id: 3, text: "Integration Practice Set - Level 3", done: false },
  { id: 4, text: "Previous Year CEE Paper 2024", done: false },
];

const CEE_DATE = "2026-05-15T09:00:00";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CircularProgress({ value, size = 70, stroke = 6, children }: {
  value: number; size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-slate-200 dark:text-slate-800" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="text-slate-900 dark:text-slate-100 transition-all duration-1000 ease-out"
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
    <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 min-w-[70px] border border-slate-200/70 dark:border-slate-700/50">
      <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-slate-100">{val.toString().padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-3">
      <Box val={time.days} label="Days" />
      <span className="text-xl font-bold text-slate-500">:</span>
      <Box val={time.hours} label="Hrs" />
      <span className="text-xl font-bold text-slate-500">:</span>
      <Box val={time.minutes} label="Min" />
      <span className="text-xl font-bold text-slate-500">:</span>
      <Box val={time.seconds} label="Sec" />
    </div>
  );
}

function TierGate({ tier, required, fallback = "blur", children, upsellTitle, upsellDescription }: {
  tier: Tier; required: Tier; fallback?: "blur" | "hide" | "upsell";
  children: React.ReactNode; upsellTitle?: string; upsellDescription?: string;
}) {
  const levels: Record<Tier, number> = { NORMAL: 0, PREMIUM: 1, SUPER_PREMIUM: 2 };
  if (levels[tier] >= levels[required]) return <>{children}</>;
  if (fallback === "hide") return null;
  if (fallback === "upsell") {
    return (
      <Card className="rounded-2xl border-dashed border-2 border-slate-200/70 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 p-6 text-center">
        <Lock className="w-8 h-8 mx-auto text-slate-400 mb-3" />
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{upsellTitle ?? "Premium Feature"}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{upsellDescription ?? "Upgrade to unlock."}</p>
        <Link href="/student/pricing">
          <Button size="sm" className="mt-4 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
            Upgrade to {required}
          </Button>
        </Link>
      </Card>
    );
  }
  return (
    <div className="relative">
      <div className="blur-sm select-none pointer-events-none opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Badge variant="secondary" className="bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 px-4 py-2">
          <Lock className="w-3.5 h-3.5 mr-1.5" /> {required} Required
        </Badge>
      </div>
    </div>
  );
}

function SubjectCard({ sub }: { sub: DashboardData["subjects"][0] }) {
  const meta = SUBJECT_META[sub.name] ?? FALLBACK_META;
  const Icon = meta.icon;
  return (
    <Card className="rounded-2xl group relative overflow-hidden border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 ${meta.light} rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${meta.light}`}>
            <Icon className={`w-5 h-5 ${meta.color}`} />
          </div>
          <Badge variant="secondary" className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/50">
            {sub.topicsDone}/{sub.topicsTotal}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 text-slate-900 dark:text-slate-100">{sub.name}</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {sub.topicsTotal === 0
            ? "No topics added yet"
            : `${sub.topicsTotal - sub.topicsDone} topics remaining`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sub.topicsTotal === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-600 italic">Topics will appear once admin adds them.</p>
        ) : (
          <div className="flex items-center gap-4">
            <CircularProgress value={sub.progress} size={60} stroke={5}>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{sub.progress}%</span>
            </CircularProgress>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Syllabus</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{sub.progress}%</span>
              </div>
              <Progress value={sub.progress} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-slate-900 dark:[&>div]:bg-slate-100" />
              <Button size="sm" variant="ghost" className={`h-7 text-xs ${meta.color} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                Resume Study <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardShell({ user, tier = "NORMAL", data }: {
  user?: User; tier?: Tier; data: DashboardData;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    subjects, scoreHistory, recentTests, leaderboard,
    collegePredictor, radarData, earnedBadges, streak,
    bestScore, totalAttempts, userRank,
  } = data;

  const hasAttempts = totalAttempts > 0;

  return (
<div className="bg-[#F7F5FF] dark:bg-[#0D0B1A] pb-12">      
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(#808080 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container mx-auto p-4 md:p-6 max-w-7xl relative">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Welcome back, {user?.name?.split(" ")[0] || "Warrior"} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              CEE 2027 Rank Destroyer Mode {tier === "NORMAL" && "— Free Tier"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <Badge variant="secondary" className="gap-1 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/50">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> {streak} Day Streak
              </Badge>
            )}
            {tier !== "NORMAL" && (
              <Badge className="gap-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90">
                {tier === "SUPER_PREMIUM" ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />} {tier}
              </Badge>
            )}
            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-950 shadow-sm">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
          </div>
        </motion.div>

        {/* Bento Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl md:col-span-2 bg-gradient-to-br from-indigo-950 to-violet-950 text-white shadow-xl border-none ring-1 ring-indigo-500/20 border-none shadow-xl">
            <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 text-sm font-medium mb-1">
                    <Target className="w-4 h-4" /> Assam CEE 2027
                  </div>
                  <h2 className="text-2xl font-bold">The Final Countdown</h2>
                </div>
                <div className="bg-white/10 dark:bg-slate-900/10 p-2 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <CountdownBlock />
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600 mt-2">
                <AlertCircle className="w-3.5 h-3.5" /> Exam Date: May 15, 2027 • 9:00 AM IST
              </div>
            </CardContent>
          </Card>

          <TierGate tier={tier} required="PREMIUM" fallback="blur">
            <Card className="rounded-2xl bg-gradient-to-br from-indigo-950 to-violet-950 text-white shadow-xl border-none ring-1 ring-indigo-500/20 border-none shadow-xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-white/10 dark:bg-slate-900/10 p-2 rounded-lg"><Activity className="w-5 h-5" /></div>
                  {userRank && <Badge className="bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900 border-none">
                    {userRank <= 10 ? `Top ${userRank}` : `Rank #${userRank}`}
                  </Badge>}
                </div>
                <div>
                  <div className="text-3xl font-black">{userRank ? `#${userRank}` : "—"}</div>
                  <div className="text-sm text-slate-400 dark:text-slate-600">
                    {hasAttempts ? "Mock Test Rank" : "Take a test to rank"}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-600 mt-2">
                  <ArrowUpRight className="w-3 h-3" />
                  {totalAttempts} attempt{totalAttempts !== 1 ? "s" : ""} completed
                </div>
              </CardContent>
            </Card>
          </TierGate>

          <TierGate tier={tier} required="PREMIUM" fallback="blur">
            <Card className="rounded-2xl bg-gradient-to-br from-indigo-950 to-violet-950 text-white shadow-xl border-none ring-1 ring-indigo-500/20 border-none shadow-xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="bg-white/10 dark:bg-slate-900/10 p-2 rounded-lg w-fit">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-3xl font-black">
                    {hasAttempts
                      ? `${Math.round(recentTests.reduce((s, t) => s + t.accuracy, 0) / Math.max(recentTests.length, 1))}%`
                      : "—"}
                  </div>
                  <div className="text-sm text-slate-400 dark:text-slate-600">Avg. Accuracy</div>
                </div>
                <div className="w-full bg-slate-800 dark:bg-slate-200 rounded-full h-1.5 mt-3">
                  <div className="bg-white dark:bg-[#12101F] h-1.5 rounded-full transition-all"
                    style={{ width: `${hasAttempts ? Math.round(recentTests.reduce((s, t) => s + t.accuracy, 0) / Math.max(recentTests.length, 1)) : 0}%` }} />
                </div>
              </CardContent>
            </Card>
          </TierGate>

          {tier === "NORMAL" && (
            <>
              <Card className="rounded-2xl bg-slate-100 dark:bg-slate-900 border-dashed border-2 border-slate-200/70 dark:border-slate-700/50 flex flex-col items-center justify-center p-6 text-center gap-2">
                <Lock className="w-6 h-6 text-slate-400" /><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rank Tracking</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upgrade to Premium</p>
              </Card>
              <Card className="rounded-2xl bg-slate-100 dark:bg-slate-900 border-dashed border-2 border-slate-200/70 dark:border-slate-700/50 flex flex-col items-center justify-center p-6 text-center gap-2">
                <Lock className="w-6 h-6 text-slate-400" /><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Accuracy Stats</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upgrade to Premium</p>
              </Card>
            </>
          )}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 shadow-sm p-1 h-12">
                {[
                  { value: "overview", icon: LayoutDashboard, label: "Overview" },
                  { value: "analytics", icon: BarChart3, label: "Analytics" },
                  { value: "syllabus", icon: BookOpen, label: "Syllabus" },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger key={value} value={value} className="gap-2 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 transition-all">
                    <Icon className="w-4 h-4" /> {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="mt-6 space-y-6 animate-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subjects.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-slate-400 dark:text-slate-600">
                      No subjects added yet. Ask your admin to set up the syllabus.
                    </div>
                  ) : (
                  subjects.map((sub, index) => (
  <SubjectCard
    key={`${sub.name || "subject"}-${index}`}
    sub={sub}
  />
))
                  )}
                </div>

                {/* Mock Tests */}
                <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Timer className="w-5 h-5 text-slate-700 dark:text-slate-300" /> Mock Tests
                      </CardTitle>
                      {tier === "NORMAL" && (
                        <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                          1 Free Only
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentTests.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No tests taken yet.</p>
                        <Link href="/cee/mock">
                          <Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                            <Zap className="w-4 h-4 mr-2" /> Take Your First Mock
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentTests.map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${test.trend === "up" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
                                <TrendingUp className={`w-5 h-5 ${test.trend === "down" ? "rotate-180" : ""}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{test.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{test.date}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {test.score}<span className="text-slate-500 dark:text-slate-400 text-xs font-normal">/{test.maxScore}</span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{test.accuracy}% accuracy</div>
                            </div>
                          </div>
                        ))}
                        <Link href="/cee/mock">
                          <Button variant="outline" className="w-full mt-2 border-slate-200/70 dark:border-slate-700/50">
                            View All Tests <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/cee/pyq">
                    <Button className="w-full h-auto py-4 flex-col gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-none dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg">
                      <BookOpen className="w-5 h-5" /><span className="text-xs font-bold">Past Year Papers</span>
                    </Button>
                  </Link>
                  <Link href="/cee/mock">
                    <Button className="w-full h-auto py-4 flex-col gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-none dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg">
                      <Zap className="w-5 h-5" /><span className="text-xs font-bold">Start Mock</span>
                    </Button>
                  </Link>
                  <TierGate tier={tier} required="PREMIUM" fallback="hide">
                    <Button className="w-full h-auto py-4 flex-col gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-none dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg">
                      <Target className="w-5 h-5" /><span className="text-xs font-bold">Weak Areas</span>
                    </Button>
                  </TierGate>
                  <TierGate tier={tier} required="PREMIUM" fallback="hide">
                    <Button className="w-full h-auto py-4 flex-col gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-none dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg">
                      <BrainCircuit className="w-5 h-5" /><span className="text-xs font-bold">Revision</span>
                    </Button>
                  </TierGate>
                </div>
              </TabsContent>

              {/* ANALYTICS */}
              <TabsContent value="analytics" className="mt-6 space-y-6 animate-in slide-in-from-bottom-4">
                <TierGate tier={tier} required="PREMIUM" fallback="upsell"
                  upsellTitle="Detailed Analytics"
                  upsellDescription="Track your score trajectory, subject breakdown, and identify weak topics.">
                  {scoreHistory.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 dark:text-slate-600">
                      Complete a mock test to see your analytics.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] shadow-sm p-4">
                        <CardTitle className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">Score Trajectory</CardTitle>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={scoreHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, "auto"]} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", backgroundColor: "white", color: "#1e293b" }} />
                            <Line type="monotone" dataKey="total" stroke="#18181b" strokeWidth={3} dot={{ fill: "#18181b", r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                      <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] shadow-sm p-4">
                        <CardTitle className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">Recent Performance</CardTitle>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={scoreHistory.slice(-5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "white", color: "#1e293b" }} />
                            <Bar dataKey="total" fill="#18181b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </div>
                  )}

                  <TierGate tier={tier} required="SUPER_PREMIUM" fallback="upsell"
                    upsellTitle="AI-Powered Deep Analytics"
                    upsellDescription="Topic strength radar, weakness prediction, and personalised study plans.">
                    {radarData.length > 0 && (
                      <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] shadow-sm p-4 mt-4">
                        <CardTitle className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">Topic Strength Radar</CardTitle>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                            <Radar name="You" dataKey="score" stroke="#18181b" fill="#18181b" fillOpacity={0.1} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </Card>
                    )}
                  </TierGate>
                </TierGate>
              </TabsContent>

              {/* SYLLABUS */}
              <TabsContent value="syllabus" className="mt-6 space-y-4 animate-in slide-in-from-bottom-4">
                {subjects.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-600">No subjects available yet.</div>
                ) : subjects.map((sub) => {
                  const meta = SUBJECT_META[sub.name] ?? FALLBACK_META;
                  const Icon = meta.icon;
                  return (
                    <Card key={sub.name} className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${meta.light}`}><Icon className={`w-5 h-5 ${meta.color}`} /></div>
                            <CardTitle className="text-base text-slate-900 dark:text-slate-100">{sub.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className={`${meta.color} border-slate-200/70 dark:border-slate-700/50`}>{sub.progress}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Progress value={sub.progress} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-slate-900 dark:[&>div]:bg-slate-100" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Array.from({ length: Math.min(5, sub.topicsTotal || 5) }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              {i < sub.topicsDone
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />}
                              <span className="truncate">{sub.name} — Topic {i + 1}</span>
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

            {/* Daily Goals — static (no schema yet) */}
            <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Target className="w-4 h-4 text-slate-700 dark:text-slate-300" /> Daily Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {STATIC_GOALS.map((goal) => (
                    <div key={goal.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${goal.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-700"}`}>
                        {goal.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={`text-sm ${goal.done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300 font-medium"}`}>
                        {goal.text}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-none dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                  <Zap className="w-4 h-4 mr-2" /> Start Focus Mode
                </Button>
              </CardContent>
            </Card>

            {/* College Predictor */}
            <TierGate tier={tier} required="PREMIUM" fallback="upsell"
              upsellTitle="College Predictor"
              upsellDescription="See which Assam government colleges you qualify for based on your mock scores.">
              <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" /> College Predictor
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {bestScore > 0 ? `Based on your best score (${bestScore})` : "Take a mock test to see predictions"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {collegePredictor.map((col) => (
                    <div key={col.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{col.name}</span>
                        <span className={`font-bold ${col.color}`}>{col.status}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${col.safe ? "bg-emerald-500" : "bg-amber-500"} transition-all duration-700`}
                          style={{ width: bestScore > 0 ? `${Math.min((col.current / col.cutoff) * 100, 100)}%` : "0%" }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Cutoff: {col.cutoff}</span><span>You: {col.current}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TierGate>

            {/* Leaderboard */}
            <TierGate tier={tier} required="PREMIUM" fallback="blur">
              <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Crown className="w-4 h-4 text-amber-500" /> Top Warriors
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {leaderboard.length === 0 ? (
                    <p className="px-6 pb-4 text-sm text-slate-400 dark:text-slate-600">No attempts yet — be the first!</p>
                  ) : (
                    <ScrollArea className="h-[280px] px-6 pb-4">
                      <div className="space-y-4 pt-2">
                        {leaderboard.map((entry, idx) => (
                          <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl ${entry.isUser ? "bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50" : "hover:bg-slate-50 dark:hover:bg-slate-900/50"}`}>
                            <div className={`w-6 text-center text-sm font-black ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-500" : "text-slate-400"}`}>
                              {entry.rank}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`text-[10px] font-bold ${entry.isUser ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                                {entry.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{entry.name}</div>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.score}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TierGate>

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {earnedBadges.map((badge) => {
                  const Icon = BADGE_ICONS[badge.key] ?? Star;
                  return (
                    <div key={badge.key} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                      <Icon className="w-6 h-6 mb-1 text-slate-700 dark:text-slate-300" />
                      <span className="text-[10px] font-bold text-center leading-tight text-slate-700 dark:text-slate-300">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}