"use client";

import { useState, useEffect, useTransition } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area,
} from "recharts";
import {
  Atom, Calculator, Microscope, Trophy, Flame, Zap, Target,
  TrendingUp, TrendingDown, Clock, Calendar, CheckCircle2,
  Circle, AlertCircle, Crown, BookOpen, ChevronRight, Lock,
  BrainCircuit, GraduationCap, ArrowUpRight, Timer, Activity,
  LayoutDashboard, BarChart3, Star, Play, CheckCheck,
  ChevronDown, ChevronUp, Minus, Sparkles, Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import Link from "next/link";

import { toggleTopicCompletion } from "../../actions/topic.actions";
import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../@/components/ui/collapsible";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User { name?: string | null; email?: string | null; image?: string | null; emailVerified?: Date | null; }
type Tier = "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";

export interface DashboardData {
  subjects: Array<{
    name: string;
    progress: number;
    topicsDone: number;
    topicsTotal: number;
    topics: Array<{ id: string; name: string; completed: boolean }>;
  }>;
  scoreHistory: Array<{ test: string; total: number; accuracy: number }>;
  recentTests: Array<{
    id: string; name: string; score: number; maxScore: number;
    date: string; accuracy: number; trend: "up" | "down";
  }>;
  leaderboard: Array<{ rank: number; name: string; avatar: string; score: number; isUser?: boolean }>;
  collegePredictor: Array<{ name: string; cutoff: number; current: number; status: string; safe: boolean; color: string }>;
  radarData: Array<{ subject: string; score: number }>;
  earnedBadges: Array<{ name: string; key: string }>;
  streak: number;
  bestScore: number;
  avgAccuracy: number;
  totalAttempts: number;
  userRank?: number;
  enrolledTests: Array<{
    testId: string; testTitle: string; duration: number; totalMarks: number;
    isActive: boolean; examType: string; batchName: string; batchSlug: string; attempted: boolean;
  }>;
  hasActiveEnrollments: boolean;
  dynamicGoals: Array<{ id: string; text: string; done: boolean; link?: string; type: string }>;
}

// ─── Static maps ─────────────────────────────────────────────────────────────

const CEE_DATE = "2026-06-14T10:00:00";

const SUBJECT_META: Record<string, { icon: React.ElementType; accent: string; bg: string; bar: string }> = {
  Physics: {
    icon: Atom,
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    bar: "[&>div]:bg-blue-500",
  },
  Chemistry: {
    icon: Microscope,
    accent: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    bar: "[&>div]:bg-violet-500",
  },
  Mathematics: {
    icon: Calculator,
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    bar: "[&>div]:bg-emerald-500",
  },
};
const FALLBACK_META = {
  icon: BookOpen,
  accent: "text-zinc-600 dark:text-zinc-400",
  bg: "bg-zinc-100 dark:bg-zinc-800",
  bar: "[&>div]:bg-zinc-500",
};

const BADGE_ICONS: Record<string, React.ElementType> = {
  streak: Flame, rank: Trophy, veteran: Star, firstblood: Zap,
};

const GOAL_ICONS: Record<string, React.ElementType> = {
  streak: Flame, topic: BookOpen, test: Timer,
};

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

function CountdownBlock() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft(CEE_DATE));
    const t = setInterval(() => setTime(getTimeLeft(CEE_DATE)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-0.5 sm:gap-2 flex-nowrap justify-center sm:justify-start w-full whitespace-nowrap">
      {[
        { val: mounted ? time.days : 0, label: "D" },
        { val: mounted ? time.hours : 0, label: "H" },
        { val: mounted ? time.minutes : 0, label: "M" },
        { val: mounted ? time.seconds : 0, label: "S" },
      ].map(({ val, label }, i) => (
        <div key={label} className="flex items-center gap-0.5 shrink-0">
          {i > 0 && (
            <span className="text-xs sm:text-lg font-bold text-zinc-500 shrink-0 select-none">:</span>
          )}
          <div className="flex flex-col items-center bg-white/10 dark:bg-zinc-900/10 rounded-md sm:rounded-lg px-1.5 sm:px-3 py-1 sm:py-2 min-w-[36px] sm:min-w-[60px] shrink-0">
            <span className="text-sm sm:text-xl lg:text-2xl font-black tabular-nums leading-none">
              {String(val).padStart(2, "0")}
            </span>
            <span className="text-[7px] sm:text-[10px] uppercase tracking-wider opacity-70 mt-0.5">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatMini({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className={cn("p-3 sm:p-4 rounded-xl", bg)}>
      <Icon className={cn("w-4 h-4 mb-2", color)} />
      <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
      <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sub ?? label}</p>
    </div>
  );
}

function TopicRow({
  topic,
  onToggle,
}: {
  topic: { id: string; name: string; completed: boolean };
  onToggle: (id: string, current: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(topic.id, topic.completed)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
        topic.completed
          ? "bg-emerald-50 dark:bg-emerald-900/10"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
        topic.completed
          ? "bg-emerald-500 border-emerald-500"
          : "border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400"
      )}>
        {topic.completed && <CheckCheck className="w-3 h-3 text-white" />}
      </div>
      <span className={cn(
        "text-sm transition-colors truncate min-w-0",
        topic.completed
          ? "text-zinc-400 dark:text-zinc-600 line-through"
          : "text-zinc-700 dark:text-zinc-300 font-medium"
      )}>
        {topic.name}
      </span>
      {!topic.completed && (
        <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
          Click to complete
        </span>
      )}
    </button>
  );
}

function TierGate({
  tier, required, children, upsellTitle, upsellDescription, overrideAccess = false,
}: {
  tier: Tier; required: Tier; children: React.ReactNode;
  upsellTitle?: string; upsellDescription?: string;
  overrideAccess?: boolean;
}) {
  const levels: Record<Tier, number> = { NORMAL: 0, PREMIUM: 1, SUPER_PREMIUM: 2 };
  if (overrideAccess || levels[tier] >= levels[required]) return <>{children}</>;

  return (
    <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <CardContent className="p-4 sm:p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{upsellTitle ?? "Premium Feature"}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{upsellDescription}</p>
        </div>
        <Link href="/pricing">
          <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
            Upgrade to {required}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}{p.dataKey === "accuracy" ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardShell({ user, tier = "NORMAL", data, userFeatures }: {
  user?: User; tier?: Tier; data: DashboardData;
  userFeatures?: { hasPredictor?: boolean; hasAnalytics?: boolean; hasCounselling?: boolean };
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set([data.subjects[0]?.name]));
  const [isPending, startTransition] = useTransition();

  // Optimistic subject state for topic completion
  const [subjectsState, setSubjectsState] = useState(data.subjects);

  const toggleSubject = (name: string) => {
    setOpenSubjects((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleTopicToggle = (subjectName: string, topicId: string, current: boolean) => {
    // Optimistic update
    setSubjectsState((prev) =>
      prev.map((s) => {
        if (s.name !== subjectName) return s;
        const updatedTopics = s.topics.map((t) =>
          t.id === topicId ? { ...t, completed: !current } : t
        );
        const newDone = updatedTopics.filter((t) => t.completed).length;
        return {
          ...s,
          topics: updatedTopics,
          topicsDone: newDone,
          progress: s.topicsTotal > 0 ? Math.round((newDone / s.topicsTotal) * 100) : 0,
        };
      })
    );

    // Server action
    startTransition(async () => {
      try {
        await toggleTopicCompletion(topicId);
      } catch {
        // Revert on error
        setSubjectsState(data.subjects);
      }
    });
  };

  const {
    scoreHistory, recentTests, leaderboard, collegePredictor,
    radarData, earnedBadges, streak, bestScore, avgAccuracy,
    totalAttempts, userRank, enrolledTests, hasActiveEnrollments, dynamicGoals,
  } = data;

  const hasAttempts = totalAttempts > 0;
  const overallProgress = subjectsState.length > 0
    ? Math.round(subjectsState.reduce((s, sub) => s + sub.progress, 0) / subjectsState.length)
    : 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-16 overflow-x-hidden">
      {/* Subtle dot grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "radial-gradient(#555 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl relative space-y-4 sm:space-y-6">
        
        {/* Email Verification Banner */}
        {user && !user.emailVerified && (
          <div className="bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-200 dark:bg-amber-800/50 p-2 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Please verify your email address</h4>
                <p className="text-xs sm:text-sm mt-0.5 opacity-90">Verify your email to secure your account and access all features.</p>
              </div>
            </div>
            <Link href="/student/settings" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm h-9">
                Verify Now
              </Button>
            </Link>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
        >
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
              Hey, {user?.name?.split(" ")[0] || "Warrior"} 👋
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs sm:text-sm flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">
                {hasActiveEnrollments ? "Continue from where you left off." : "CEE 2026 — let's get that rank."}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                <Flame className="w-3.5 h-3.5" /> {streak}d streak
              </div>
            )}
            {hasActiveEnrollments && (
              <Link href="/student/batches">
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> My Batches
                </div>
              </Link>
            )}
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white dark:border-zinc-900 shadow-sm shrink-0">
              <AvatarImage src={user?.image ?? ""} />
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs sm:text-sm">
                {user?.name?.slice(0, 2).toUpperCase() ?? "ST"}
              </AvatarFallback>
            </Avatar>
          </div>
        </motion.div>

        {/* ── RESPONSIVE HERO SECTION ──────────────────────────────────────── */}
        <div className="space-y-3 sm:space-y-4">
          {/* Countdown — Compact and responsive */}
          <Card className="bg-zinc-900 dark:bg-zinc-100 border-none shadow-xl text-white dark:text-zinc-900">
            <CardContent className="p-3 sm:p-6 space-y-2 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-zinc-400 dark:text-zinc-600 flex items-center gap-1 mb-0.5 sm:mb-1">
                    <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Assam CEE 2026
                  </p>
                  <h2 className="text-base sm:text-xl font-bold leading-tight">Final Countdown</h2>
                </div>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 dark:text-zinc-600 shrink-0" />
              </div>
              <CountdownBlock />
              <p className="text-[9px] sm:text-[11px] text-zinc-500 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> 14 May 2026 · 10:00 AM IST
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid — Mobile: 2 col, Desktop: 4 col */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Rank card */}
            <Card className="bg-zinc-900 dark:bg-zinc-100 border-none shadow-xl text-white dark:text-zinc-900">
              <CardContent className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex justify-between items-start">
                  <div className="bg-white/10 dark:bg-zinc-900/10 p-1.5 sm:p-2 rounded-lg">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  {userRank && userRank <= 10 && (
                    <span className="text-[8px] sm:text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                      Top {userRank}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-lg sm:text-3xl font-black leading-tight">{userRank ? `#${userRank}` : "—"}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 leading-tight">
                    {hasAttempts ? "Rank" : "—"}
                  </p>
                </div>
                <p className="text-[8px] sm:text-xs text-zinc-500 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  <span className="truncate">{totalAttempts} test{totalAttempts !== 1 ? "s" : ""}</span>
                </p>
              </CardContent>
            </Card>

            {/* Accuracy card */}
            <Card className="bg-zinc-900 dark:bg-zinc-100 border-none shadow-xl text-white dark:text-zinc-900">
              <CardContent className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                <div className="bg-white/10 dark:bg-zinc-900/10 p-1.5 sm:p-2 rounded-lg w-fit">
                  <BrainCircuit className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-lg sm:text-3xl font-black leading-tight">{hasAttempts ? `${avgAccuracy}%` : "—"}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 leading-tight">Accuracy</p>
                </div>
                <div className="w-full bg-white/10 dark:bg-zinc-900/10 rounded-full h-1">
                  <div
                    className="bg-white dark:bg-zinc-900 h-1 rounded-full transition-all"
                    style={{ width: `${hasAttempts ? avgAccuracy : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Streak card */}
            {streak > 0 && (
              <Card className="bg-zinc-900 dark:bg-zinc-100 border-none shadow-xl text-white dark:text-zinc-900">
                <CardContent className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="bg-white/10 dark:bg-zinc-900/10 p-1.5 sm:p-2 rounded-lg w-fit">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-3xl font-black leading-tight">{streak}d</p>
                    <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 leading-tight">Streak</p>
                  </div>
                  <p className="text-[8px] sm:text-xs text-zinc-500 font-medium">On fire! 🔥</p>
                </CardContent>
              </Card>
            )}

            {/* Best Score card */}
            <Card className="bg-zinc-900 dark:bg-zinc-100 border-none shadow-xl text-white dark:text-zinc-900">
              <CardContent className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                <div className="bg-white/10 dark:bg-zinc-900/10 p-1.5 sm:p-2 rounded-lg w-fit">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-lg sm:text-3xl font-black leading-tight">{bestScore || "—"}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 leading-tight">Best</p>
                </div>
                <p className="text-[8px] sm:text-xs text-zinc-500">All-time high</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Main Layout ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Left: tabs */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 h-10 sm:h-12 rounded-xl">
                {[
                  { value: "overview", icon: LayoutDashboard, label: "Overview" },
                  { value: "analytics", icon: BarChart3, label: "Analytics" },
                  { value: "syllabus", icon: BookOpen, label: "Syllabus" },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 transition-all rounded-lg px-1 sm:px-3"
                  >
                    <Icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.slice(0, 3)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── OVERVIEW ────────────────────────────────────────────── */}
              <TabsContent value="overview" className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 animate-in fade-in-0 slide-in-from-bottom-2">

                {/* Overall progress bar */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Overall Syllabus Progress</p>
                      <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-zinc-900 dark:[&>div]:bg-zinc-100" />
                    <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      {subjectsState.reduce((s, sub) => s + sub.topicsDone, 0)} of{" "}
                      {subjectsState.reduce((s, sub) => s + sub.topicsTotal, 0)} topics completed
                    </p>
                  </CardContent>
                </Card>

                {/* Subject mini cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {subjectsState.length === 0 ? (
                    <div className="col-span-1 sm:col-span-3">
                      <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-none">
                        <CardContent className="py-8 text-center space-y-2">
                          <BookOpen className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                          <p className="font-semibold text-zinc-700 dark:text-zinc-300">Syllabus Not Available</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            The syllabus is currently being updated. Check back later.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    subjectsState.map((sub) => {
                      const meta = SUBJECT_META[sub.name] ?? FALLBACK_META;
                      const Icon = meta.icon;
                      return (
                        <Card
                          key={sub.name}
                          className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                          onClick={() => { setActiveTab("syllabus"); setOpenSubjects(new Set([sub.name])); }}
                        >
                          <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <div className={cn("p-2 rounded-lg", meta.bg)}>
                                <Icon className={cn("w-4 h-4", meta.accent)} />
                              </div>
                              <span className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">{sub.progress}%</span>
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{sub.name}</p>
                              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                {sub.topicsDone}/{sub.topicsTotal} topics
                              </p>
                            </div>
                            <Progress value={sub.progress} className={cn("h-1.5 bg-zinc-100 dark:bg-zinc-800", meta.bar)} />
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>

                {/* Mock Tests */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardHeader className="pb-3 px-3 sm:px-6 pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <Timer className="w-4 h-4 text-zinc-500" /> Mock Tests
                      </CardTitle>
                      <Link href={hasActiveEnrollments ? "/student/my-batches" : "/cee/mock"}>
                        <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 gap-1 h-8 px-2">
                          View all <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 px-3 sm:px-6 pb-4 sm:pb-6">
                    {hasActiveEnrollments ? (
                      // Show enrolled batch tests
                      enrolledTests.length === 0 ? (
                        <div className="py-8 text-center">
                          <Timer className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                          <p className="text-sm text-zinc-500">No tests in your batches yet.</p>
                        </div>
                      ) : (
                        <>
                          {enrolledTests.slice(0, 4).map((bt) => (
                            <div
                              key={bt.testId}
                              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                              <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                                bt.attempted
                                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                                  : "bg-zinc-100 dark:bg-zinc-800"
                              )}>
                                {bt.attempted
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  : <Play className="w-4 h-4 text-zinc-400" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{bt.testTitle}</p>
                                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                  {bt.batchName} · {bt.duration}m · {bt.totalMarks} marks
                                </p>
                              </div>
                              <Link href={`/cee/mock/${bt.testId}`}>
                                <Button
                                  size="sm"
                                  variant={bt.attempted ? "outline" : "default"}
                                  disabled={!bt.isActive}
                                  className={cn(
                                    "h-8 text-xs shrink-0",
                                    !bt.attempted && "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                                  )}
                                >
                                  {bt.attempted ? "Reattempt" : bt.isActive ? "Start" : "Soon"}
                                </Button>
                              </Link>
                            </div>
                          ))}
                          {enrolledTests.length > 4 && (
                            <Link href="student/my-batches">
                              <Button variant="outline" className="w-full h-9 text-sm border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500">
                                +{enrolledTests.length - 4} more tests in My Batches
                              </Button>
                            </Link>
                          )}
                        </>
                      )
                    ) : (
                      // No enrollments
                      recentTests.length === 0 ? (
                        <div className="py-8 text-center space-y-3">
                          <Timer className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                          <div>
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No tests attempted yet</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              You get 1 free mock test — no signup required.
                            </p>
                          </div>
                          <Link href="/cee/mock">
                            <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 h-9">
                              <Zap className="w-3.5 h-3.5 mr-1.5" /> Take Free Mock
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <>
                          {recentTests.slice(0, 3).map((test) => (
                            <div key={test.id} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                              <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                                test.trend === "up" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"
                              )}>
                                {test.trend === "up"
                                  ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                                  : <TrendingDown className="w-4 h-4 text-red-500" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{test.name}</p>
                                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">{test.date} · {test.accuracy}% accuracy</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                  {test.score}<span className="text-zinc-400 text-xs font-normal">/{test.maxScore}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-1">
                            <Link href="/cee/mock" className="flex-1">
                              <Button variant="outline" className="w-full h-9 text-sm border-zinc-200 dark:border-zinc-800">
                                Browse Tests
                              </Button>
                            </Link>
                            <Link href="/batches" className="flex-1">
                              <Button className="w-full h-9 text-sm bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                                Enroll in Batch
                              </Button>
                            </Link>
                          </div>
                        </>
                      )
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { href: "/batches", icon: Users, label: "Batches" },
                    { href: "/student/my-batches", icon: Target, label: "My Batches" },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href}>
                      <Button className="w-full h-auto py-3 sm:py-4 flex-col gap-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              {/* ── ANALYTICS ───────────────────────────────────────────── */}
              <TabsContent value="analytics" className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 animate-in fade-in-0 slide-in-from-bottom-2">

                {/* Stat row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatMini label="Attempts" value={totalAttempts} sub="Total tests taken" icon={Timer} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
                  <StatMini label="Best Score" value={bestScore || "—"} sub="All-time high" icon={Trophy} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20" />
                  <StatMini label="Avg Accuracy" value={hasAttempts ? `${avgAccuracy}%` : "—"} sub="Correct attempts" icon={Target} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                  <StatMini label="Streak" value={streak > 0 ? `${streak}d` : "—"} sub="Study days in row" icon={Flame} color="text-orange-600 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-900/20" />
                </div>

                {!hasAttempts ? (
                  <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardContent className="py-16 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">No data yet</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Your analytics will appear after your first mock test.
                      </p>
                      <Link href="/cee/mock">
                        <Button className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                          Take First Test
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Score Trajectory */}
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
                        <CardTitle className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Score Trajectory</CardTitle>
                        <CardDescription className="text-[11px] sm:text-xs">Your score across all attempts</CardDescription>
                      </CardHeader>
                      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={scoreHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                            <XAxis dataKey="test" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                              type="monotone" dataKey="total" name="Score"
                              stroke="#18181b" strokeWidth={2.5}
                              fill="url(#scoreGrad)"
                              dot={{ fill: "#18181b", r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Accuracy trend */}
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
                        <CardTitle className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Accuracy Trend</CardTitle>
                        <CardDescription className="text-[11px] sm:text-xs">% correct across attempts</CardDescription>
                      </CardHeader>
                      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={scoreHistory.slice(-8)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                            <XAxis dataKey="test" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" domain={[0, 100]} unit="%" />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="accuracy" name="Accuracy" fill="#18181b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Subject Strength Radar */}
                    {radarData.length > 0 && (
                      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Subject Strength Map
                              </CardTitle>
                              <CardDescription className="text-[11px] sm:text-xs">Based on topic completion rate</CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-zinc-100 dark:bg-zinc-800">
                              <Sparkles className="w-3 h-3 mr-1" /> Live
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
                          <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="#e4e4e7" />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#71717a" }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#a1a1aa" }} />
                              <Radar
                                name="Strength" dataKey="score"
                                stroke="#18181b" fill="#18181b" fillOpacity={0.1} strokeWidth={2}
                              />
                              <Tooltip content={<ChartTooltip />} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ── SYLLABUS ─────────────────────────────────────────────── */}
              <TabsContent value="syllabus" className="mt-3 sm:mt-4 space-y-3 animate-in fade-in-0 slide-in-from-bottom-2">

                {/* Overall */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">Total Progress</p>
                      <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-zinc-900 dark:[&>div]:bg-zinc-100" />
                    <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      {subjectsState.reduce((s, sub) => s + sub.topicsDone, 0)} /{" "}
                      {subjectsState.reduce((s, sub) => s + sub.topicsTotal, 0)} topics marked complete
                    </p>
                  </CardContent>
                </Card>

                {subjectsState.length === 0 ? (
                  <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-none">
                    <CardContent className="py-16 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Syllabus Not Available</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                          The course syllabus hasn't been published yet. Content will appear here once the curriculum is configured.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  subjectsState.map((sub) => {
                    const meta = SUBJECT_META[sub.name] ?? FALLBACK_META;
                    const Icon = meta.icon;
                    const isOpen = openSubjects.has(sub.name);

                    return (
                      <Card key={sub.name} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                        <Collapsible open={isOpen} onOpenChange={() => toggleSubject(sub.name)}>
                          <CollapsibleTrigger asChild>
                            <button className="w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left">
                              <div className={cn("p-2 rounded-lg shrink-0", meta.bg)}>
                                <Icon className={cn("w-4 h-4", meta.accent)} />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">{sub.name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{sub.progress}%</span>
                                    {isOpen ? (
                                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </div>
                                </div>
                                <Progress value={sub.progress} className={cn("h-1.5 bg-zinc-100 dark:bg-zinc-800", meta.bar)} />
                                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                  {sub.topicsDone}/{sub.topicsTotal} topics · tap to {isOpen ? "collapse" : "expand"}
                                </p>
                              </div>
                            </button>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                              {sub.topics.length === 0 ? (
                                <div className="py-6 text-center space-y-2">
                                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                                    <Minus className="w-5 h-5 text-zinc-400" />
                                  </div>
                                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No topics available</p>
                                  <p className="text-xs text-zinc-500">Topics for {sub.name} will be added soon.</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {sub.topics.map((topic) => (
                                    <TopicRow
                                      key={topic.id}
                                      topic={topic}
                                      onToggle={(id, current) => handleTopicToggle(sub.name, id, current)}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Subject stats footer */}
                              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] sm:text-xs text-zinc-500">
                                <span>{sub.topicsDone} done · {sub.topicsTotal - sub.topicsDone} remaining</span>
                                {sub.topicsDone === sub.topicsTotal && sub.topicsTotal > 0 && (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                    <CheckCircle2 className="w-3 h-3" /> Complete!
                                  </span>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Daily Goals — dynamic */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <CardHeader className="pb-3 px-3 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Target className="w-4 h-4 text-zinc-500" /> Today's Goals
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-zinc-500">
                  {dynamicGoals.filter((g) => g.done).length}/{dynamicGoals.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-3 sm:px-6 pb-4 sm:pb-6">
                {dynamicGoals.length === 0 ? (
                  <div className="py-4 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">All done!</p>
                    <p className="text-xs text-zinc-500">You're on top of everything.</p>
                  </div>
                ) : (
                  dynamicGoals.map((goal) => {
                    const GoalIcon = GOAL_ICONS[goal.type] ?? Target;
                    const inner = (
                      <div className={cn(
                        "flex items-start gap-3 p-2.5 sm:p-3 rounded-xl transition-colors",
                        goal.done
                          ? "bg-emerald-50 dark:bg-emerald-900/10"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                        goal.link && !goal.done && "cursor-pointer"
                      )}>
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          goal.done ? "bg-emerald-500" : "bg-zinc-100 dark:bg-zinc-800"
                        )}>
                          {goal.done
                            ? <CheckCheck className="w-3.5 h-3.5 text-white" />
                            : <GoalIcon className="w-3.5 h-3.5 text-zinc-500" />
                          }
                        </div>
                        <p className={cn(
                          "text-sm leading-snug min-w-0",
                          goal.done
                            ? "text-zinc-400 dark:text-zinc-600 line-through"
                            : "text-zinc-700 dark:text-zinc-300 font-medium"
                        )}>
                          {goal.text}
                        </p>
                        {goal.link && !goal.done && (
                          <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0 ml-auto mt-0.5" />
                        )}
                      </div>
                    );

                    return goal.link && !goal.done ? (
                      <Link key={goal.id} href={goal.link}>{inner}</Link>
                    ) : (
                      <div key={goal.id}>{inner}</div>
                    );
                  })
                )}

                {/* Progress bar for goals */}
                {dynamicGoals.length > 0 && (
                  <div className="pt-2">
                    <Progress
                      value={(dynamicGoals.filter((g) => g.done).length / dynamicGoals.length) * 100}
                      className="h-1.5 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-emerald-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* College Predictor — premium gate */}
            <TierGate
              tier={tier}
              required="NORMAL"
              upsellTitle="College Predictor"
              upsellDescription="See which Assam colleges you qualify for based on your mock scores."
              overrideAccess={userFeatures?.hasPredictor}
            >
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardHeader className="pb-3 px-3 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <GraduationCap className="w-4 h-4 text-zinc-500" /> College Predictor
                  </CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs text-zinc-500">
                    {bestScore > 0 ? `Based on your best score (${bestScore})` : "Take a mock test to activate"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
                  {collegePredictor.map((col) => (
                    <div key={col.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{col.name}</span>
                        <span className={cn("font-bold text-xs", col.color)}>{col.status}</span>
                      </div>
                      <Progress
                        value={bestScore > 0 ? Math.min((col.current / col.cutoff) * 100, 100) : 0}
                        className={cn("h-1.5 bg-zinc-100 dark:bg-zinc-800", col.safe ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500")}
                      />
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Cutoff: {col.cutoff}</span>
                        <span>You: {col.current || "—"}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TierGate>

            {/* Leaderboard */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <CardHeader className="pb-3 px-3 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Crown className="w-4 h-4 text-amber-500" /> Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {leaderboard.length === 0 ? (
                  <p className="px-3 sm:px-6 pb-4 text-sm text-zinc-400 dark:text-zinc-600 text-center">
                    No attempts yet — be first!
                  </p>
                ) : (
                  <ScrollArea className="h-[220px] px-3 sm:px-6 pb-4">
                    <div className="space-y-3 pt-1">
                      {leaderboard.map((entry, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-3 p-2 sm:p-2 rounded-xl transition-colors",
                            entry.isUser
                              ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 flex items-center justify-center text-xs font-black shrink-0",
                            idx === 0 ? "text-amber-500" :
                              idx === 1 ? "text-zinc-400" :
                                idx === 2 ? "text-orange-500" : "text-zinc-400"
                          )}>
                            {entry.rank}
                          </div>
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className={cn(
                              "text-[10px] font-bold",
                              entry.isUser
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                            )}>
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <p className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {entry.name}
                          </p>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 shrink-0">{entry.score}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardHeader className="pb-3 px-3 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Star className="w-4 h-4 text-amber-500" /> Badges Earned
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                  <div className="grid grid-cols-2 gap-2">
                    {earnedBadges.map((badge) => {
                      const Icon = BADGE_ICONS[badge.key] ?? Star;
                      return (
                        <div
                          key={badge.key}
                          className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 gap-1.5"
                        >
                          <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                          <span className="text-[10px] font-bold text-center leading-tight text-zinc-700 dark:text-zinc-300">
                            {badge.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}