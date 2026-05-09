"use client";



import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../@/components/ui/tabs";
import { Separator } from "../ui/separator"

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  Atom, Calculator, Microscope, Trophy, Flame, Zap, Target, TrendingUp,
  Clock, Calendar, CheckCircle2, Circle, AlertCircle, Crown, BookOpen,
  ChevronRight,Lock, Star, BrainCircuit, GraduationCap, ArrowUpRight, Timer, Activity, LayoutDashboard,
  BarChart3
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../../@/components/ui/progress";
import { Avatar,  AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../../@/components/ui/scroll-area";
import { useTier } from "../../hooks/use-tier";
import { FeatureGate } from "../subscription/feature-gate";


interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/* ─── Mock Data ─── */
const CEE_DATE = "2027-05-15T09:00:00";

const SUBJECTS = [
  { name: "Physics", progress: 72, topicsDone: 32, topicsTotal: 45, icon: Atom, color: "#6366f1", light: "bg-indigo-50", text: "text-indigo-600" },
  { name: "Chemistry", progress: 58, topicsDone: 24, topicsTotal: 42, icon: Microscope, color: "#10b981", light: "bg-emerald-50", text: "text-emerald-600" },
  { name: "Mathematics", progress: 81, topicsDone: 40, topicsTotal: 50, icon: Calculator, color: "#f59e0b", light: "bg-amber-50", text: "text-amber-600" },
];

const SCORE_HISTORY = [
  { test: "Mock 1", total: 280, physics: 85, chem: 70, math: 125 },
  { test: "Mock 2", total: 310, physics: 95, chem: 85, math: 130 },
  { test: "Mock 3", total: 295, physics: 88, chem: 82, math: 125 },
  { test: "Mock 4", total: 340, physics: 110, chem: 95, math: 135 },
  { test: "Mock 5", total: 355, physics: 115, chem: 100, math: 140 },
  { test: "Mock 6", total: 372, physics: 120, chem: 108, math: 144 },
  { test: "Mock 7", total: 390, physics: 128, chem: 115, math: 147 },
  { test: "Mock 8", total: 410, physics: 135, chem: 125, math: 150 },
];

const RADAR_DATA = [
  { subject: "Mechanics", A: 85, fullMark: 100 },
  { subject: "Electro", A: 70, fullMark: 100 },
  { subject: "Organic", A: 60, fullMark: 100 },
  { subject: "Inorganic", A: 55, fullMark: 100 },
  { subject: "Calculus", A: 90, fullMark: 100 },
  { subject: "Algebra", A: 88, fullMark: 100 },
];

const RECENT_TESTS = [
  { id: 1, name: "Full Syllabus Mock #12", score: 410, max: 480, date: "2 hrs ago", rank: 45, accuracy: 85, trend: "up" },
  { id: 2, name: "Physics Mechanics Drills", score: 135, max: 160, date: "Yesterday", rank: 12, accuracy: 92, trend: "up" },
  { id: 3, name: "Chemistry Organic Blast", score: 98, max: 160, date: "2 days ago", rank: 89, accuracy: 61, trend: "down" },
  { id: 4, name: "Math Calculus Extreme", score: 150, max: 160, date: "3 days ago", rank: 3, accuracy: 94, trend: "up" },
];

const LEADERBOARD = [
  { rank: 1, name: "Rahul D.", avatar: "RD", college: "AEC", score: 445 },
  { rank: 2, name: "Priyanka G.", avatar: "PG", college: "JEC", score: 438 },
  { rank: 3, name: "You", avatar: "YO", college: "AEC", score: 410, isUser: true },
  { rank: 4, name: "Bikash S.", avatar: "BS", college: "BBEC", score: 405 },
  { rank: 5, name: "Ananya T.", avatar: "AT", college: "AEC", score: 398 },
];

const GOALS = [
  { id: 1, text: "Solve 50 Physics MCQs (Mechanics)", done: true, subject: "Physics" },
  { id: 2, text: "Organic Chemistry Named Revisions", done: true, subject: "Chemistry" },
  { id: 3, text: "Integration Practice Set - Level 3", done: false, subject: "Mathematics" },
  { id: 4, text: "Previous Year CEE Paper 2024", done: false, subject: "Mixed" },
];

const COLLEGE_PREDICTOR = [
  { name: "AEC Guwahati", cutoff: 420, current: 410, status: "Close", color: "text-amber-500", safe: false },
  { name: "JEC Jorhat", cutoff: 380, current: 410, status: "Safe", color: "text-emerald-500", safe: true },
  { name: "BBEC Kokrajhar", cutoff: 340, current: 410, status: "Safe", color: "text-emerald-500", safe: true },
];

const BADGES = [
  { name: "7-Day Streak", icon: Flame, color: "text-orange-500 bg-orange-50" },
  { name: "Top 50", icon: Trophy, color: "text-yellow-500 bg-yellow-50" },
  { name: "Math Wizard", icon: Calculator, color: "text-indigo-500 bg-indigo-50" },
  { name: "Early Bird", icon: Clock, color: "text-sky-500 bg-sky-50" },
];

/* ─── Helpers ─── */
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

function CircularProgress({ value, color, size = 70, stroke = 6, children }: { value: number; color: string; size?: number; stroke?: number; children?: React.ReactNode }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-slate-100" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/* ─── Components ─── */
function CountdownBlock() {
  const [time, setTime] = useState(getTimeLeft(CEE_DATE));
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft(CEE_DATE)), 1000);
    return () => clearInterval(t);
  }, []);

  const Box = ({ val, label }: { val: number; label: string }) => (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-lg p-3 min-w-[70px] border border-white/10">
      <span className="text-2xl font-black tabular-nums">{val.toString().padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <Box val={time.days} label="Days" />
      <span className="text-xl font-bold opacity-50">:</span>
      <Box val={time.hours} label="Hrs" />
      <span className="text-xl font-bold opacity-50">:</span>
      <Box val={time.minutes} label="Min" />
      <span className="text-xl font-bold opacity-50">:</span>
      <Box val={time.seconds} label="Sec" />
    </div>
  );
}

function SubjectCard({ sub }: { sub: typeof SUBJECTS[0] }) {
  const Icon = sub.icon;
  return (
    <Card className="group relative overflow-hidden border-slate-200/60 hover:border-slate-300 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 ${sub.light} rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${sub.light} ${sub.text}`}>
            <Icon className="w-5 h-5" />
          </div>
          <Badge variant="secondary" className="font-mono">{sub.topicsDone}/{sub.topicsTotal}</Badge>
        </div>
        <CardTitle className="text-lg mt-3">{sub.name}</CardTitle>
        <CardDescription>{sub.topicsTotal - sub.topicsDone} topics remaining</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <CircularProgress value={sub.progress} color={sub.color} size={60} stroke={5}>
            <span className="text-xs font-bold text-slate-700">{sub.progress}%</span>
          </CircularProgress>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Syllabus</span>
              <span className="font-medium text-slate-700">{sub.progress}%</span>
            </div>
            <Progress value={sub.progress} className="h-2" />
            <Button size="sm" variant="ghost" className={`h-7 text-xs ${sub.text} hover:${sub.light}`}>
              Resume Study <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Shell ─── */
export function DashboardShell({ user }: { user?: User }) {
  const tier = useTier();
  const [activeTab, setActiveTab] = useState("overview");

  const isPremium = tier === "PREMIUM" || tier === "SUPER_PREMIUM";
  const isSuper = tier === "SUPER_PREMIUM";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <div className="container mx-auto p-4 md:p-6 max-w-7xl relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Welcome back, {user?.name?.split(" ")[0] || "Warrior"} 👋
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              CEE 2027 Rank Destroyer Mode {tier === "NORMAL" && "— Free Tier"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 px-3 py-1.5 text-sm border-amber-200 bg-amber-50 text-amber-700">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              12 Day Streak
            </Badge>
            {tier !== "NORMAL" && (
              <Badge className={`gap-1 ${tier === "SUPER_PREMIUM" ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-500 hover:bg-indigo-600"} text-white`}>
                {tier === "SUPER_PREMIUM" ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {tier}
              </Badge>
            )}
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Bento Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Countdown — ALL TIERS */}
          <Card className="md:col-span-2 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700 text-white border-none shadow-xl shadow-indigo-200">
            <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mb-1">
                    <Target className="w-4 h-4" /> Assam CEE 2027
                  </div>
                  <h2 className="text-2xl font-bold">The Final Countdown</h2>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <CountdownBlock />
              <div className="flex items-center gap-2 text-xs text-indigo-100/80 mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Exam Date: May 15, 2027 • 9:00 AM IST
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards — PREMIUM+ only, blurred for Normal */}
          <FeatureGate requiredTier="PREMIUM" currentTier={tier} fallback="blur">
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none shadow-xl shadow-orange-200">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-2 rounded-lg"><Activity className="w-5 h-5" /></div>
                  <Badge className="bg-white/20 text-white border-none">Top 2%</Badge>
                </div>
                <div>
                  <div className="text-3xl font-black">#45</div>
                  <div className="text-sm text-orange-100">Mock Test Rank</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-100 mt-2">
                  <ArrowUpRight className="w-3 h-3" /> Up 12 ranks
                </div>
              </CardContent>
            </Card>
          </FeatureGate>

          <FeatureGate requiredTier="PREMIUM" currentTier={tier} fallback="blur">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl shadow-emerald-200">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-2 rounded-lg"><BrainCircuit className="w-5 h-5" /></div>
                </div>
                <div>
                  <div className="text-3xl font-black">85.4%</div>
                  <div className="text-sm text-emerald-100">Avg. Accuracy</div>
                </div>
                <div className="w-full bg-black/10 rounded-full h-1.5 mt-3">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: "85%" }} />
                </div>
              </CardContent>
            </Card>
          </FeatureGate>

          {/* Normal tier filler cards */}
          {tier === "NORMAL" && (
            <>
              <Card className="bg-slate-100 border-dashed border-2 flex flex-col items-center justify-center p-6 text-center gap-2">
                <Lock className="w-6 h-6 text-slate-400" />
                <p className="text-sm font-semibold text-slate-600">Rank Tracking</p>
                <p className="text-xs text-muted-foreground">Upgrade to Premium</p>
              </Card>
              <Card className="bg-slate-100 border-dashed border-2 flex flex-col items-center justify-center p-6 text-center gap-2">
                <Lock className="w-6 h-6 text-slate-400" />
                <p className="text-sm font-semibold text-slate-600">Accuracy Stats</p>
                <p className="text-xs text-muted-foreground">Upgrade to Premium</p>
              </Card>
            </>
          )}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-white border shadow-sm p-1 h-12">
                <TabsTrigger value="overview" className="gap-2 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  <LayoutDashboard className="w-4 h-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  <BarChart3 className="w-4 h-4" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="syllabus" className="gap-2 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white">
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

                {/* Mock Tests — Normal: 1 only, Premium: 15, Super: Unlimited */}
                <Card className="border-slate-200/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Timer className="w-5 h-5 text-indigo-500" /> Mock Tests
                      </CardTitle>
                      {tier === "NORMAL" && (
                        <Badge variant="secondary" className="text-amber-600 bg-amber-50">1 Free Only</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tier === "NORMAL" ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">Full Syllabus Mock #1</div>
                            <div className="text-xs text-muted-foreground">480 marks • 3 hours</div>
                          </div>
                          <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Zap className="w-4 h-4 mr-2" /> Start Free Mock
                          </Button>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between opacity-60">
                          <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="font-semibold text-slate-700">Full Syllabus Mock #2</div>
                              <div className="text-xs text-muted-foreground">Locked</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Upgrade</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {RECENT_TESTS.map((test) => (
                          <div key={test.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${test.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                <TrendingUp className={`w-5 h-5 ${test.trend === "down" ? "rotate-180" : ""}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-slate-900">{test.name}</div>
                                <div className="text-xs text-muted-foreground">{test.date} • Rank #{test.rank}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900">{test.score}<span className="text-muted-foreground text-xs font-normal">/{test.max}</span></div>
                              <div className="text-xs text-muted-foreground">{test.accuracy}% accuracy</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button className="h-auto py-4 flex-col gap-2 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-bold">Past Year Papers</span>
                  </Button>
                  <Button className="h-auto py-4 flex-col gap-2 bg-violet-500 hover:bg-violet-600 text-white shadow-lg">
                    <Zap className="w-5 h-5" />
                    <span className="text-xs font-bold">Start Mock</span>
                  </Button>
                  <FeatureGate requiredTier="PREMIUM" currentTier={tier} fallback="hide">
                    <Button className="h-auto py-4 flex-col gap-2 bg-rose-500 hover:bg-rose-600 text-white shadow-lg">
                      <Target className="w-5 h-5" />
                      <span className="text-xs font-bold">Weak Areas</span>
                    </Button>
                  </FeatureGate>
                  <FeatureGate requiredTier="PREMIUM" currentTier={tier} fallback="hide">
                    <Button className="h-auto py-4 flex-col gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-lg">
                      <BrainCircuit className="w-5 h-5" />
                      <span className="text-xs font-bold">Revision</span>
                    </Button>
                  </FeatureGate>
                </div>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="mt-6 space-y-6 animate-in slide-in-from-bottom-4">
                <FeatureGate 
                  requiredTier="PREMIUM" 
                  currentTier={tier}
                  upsellTitle="Detailed Analytics"
                  upsellDescription="Track your score trajectory, subject breakdown, and identify weak topics."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-200/60 shadow-sm p-4">
                      <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Score Trajectory</CardTitle>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={SCORE_HISTORY}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[200, 480]} />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                          <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm p-4">
                      <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Subject-wise Breakdown</CardTitle>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={SCORE_HISTORY.slice(-5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                          <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                          <Bar dataKey="physics" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="chem" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="math" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>

                  {/* SUPER PREMIUM: Radar + AI */}
                  <FeatureGate 
                    requiredTier="SUPER_PREMIUM" 
                    currentTier={tier}
                    fallback="upsell"
                    upsellTitle="AI-Powered Deep Analytics"
                    upsellDescription="Topic strength radar, weakness prediction, and personalized study plans."
                  >
                    <Card className="border-slate-200/60 shadow-sm p-4">
                      <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Topic Strength Radar</CardTitle>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={RADAR_DATA}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                          <Radar name="You" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Card>
                  </FeatureGate>
                </FeatureGate>
              </TabsContent>

              {/* SYLLABUS TAB */}
              <TabsContent value="syllabus" className="mt-6 space-y-4 animate-in slide-in-from-bottom-4">
                {SUBJECTS.map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <Card key={sub.name} className="border-slate-200/60">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${sub.light}`}><Icon className={`w-5 h-5 ${sub.text}`} /></div>
                            <CardTitle className="text-base">{sub.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className={sub.text}>{sub.progress}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Progress value={sub.progress} className="h-2" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                              {i < (sub.progress / 20) ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
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
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" /> Daily Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {GOALS.map((goal) => (
                    <div key={goal.id} className={`flex items-start gap-3 p-2 rounded-lg ${goal.done ? "bg-slate-50" : "hover:bg-slate-50"}`}>
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${goal.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                        {goal.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={`text-sm ${goal.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}>
                        {goal.text}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white">
                  <Zap className="w-4 h-4 mr-2" /> Start Focus Mode
                </Button>
              </CardContent>
            </Card>

            {/* College Predictor — PREMIUM+ */}
            <FeatureGate 
              requiredTier="PREMIUM" 
              currentTier={tier}
              upsellTitle="College Predictor"
              upsellDescription="See which Assam government colleges you can get into based on your mock scores."
            >
              <Card className="border-slate-200/60 shadow-sm bg-gradient-to-b from-white to-slate-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-500" /> College Predictor
                  </CardTitle>
                  <CardDescription>Based on your last mock score (410)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {COLLEGE_PREDICTOR.map((col) => (
                    <div key={col.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700">{col.name}</span>
                        <span className={`font-bold ${col.color}`}>{col.status}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${col.safe ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min((col.current / col.cutoff) * 100, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Cutoff: {col.cutoff}</span>
                        <span>You: {col.current}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </FeatureGate>

            {/* Leaderboard — PREMIUM+ */}
            <FeatureGate 
              requiredTier="PREMIUM" 
              currentTier={tier}
              fallback="blur"
            >
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" /> Top Warriors
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[280px] px-6 pb-4">
                    <div className="space-y-4 pt-2">
                      {LEADERBOARD.map((entry, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl ${entry.isUser ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50"}`}>
                          <div className={`w-6 text-center text-sm font-black ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-slate-400"}`}>
                            {entry.rank}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-[10px] font-bold ${entry.isUser ? "bg-indigo-600 text-white" : "bg-slate-200"}`}>
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{entry.name}</div>
                            <div className="text-[10px] text-muted-foreground">{entry.college} Target</div>
                          </div>
                          <div className="text-sm font-bold text-slate-900">{entry.score}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* Badges — ALL TIERS */}
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map((badge) => (
                <div key={badge.name} className={`flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 ${badge.color} bg-opacity-10`}>
                  <badge.icon className={`w-6 h-6 mb-1 ${badge.color.split(" ")[0]}`} />
                  <span className="text-[10px] font-bold text-center leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>

            {/* Battle Arena — SUPER PREMIUM only */}
            <FeatureGate 
              requiredTier="SUPER_PREMIUM" 
              currentTier={tier}
              upsellTitle="Battle Arena"
              upsellDescription="1v1 live battles with other CEE aspirants. Super Premium only."
            >
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-amber-500 text-white p-3 rounded-xl">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Battle Arena Live</div>
                    <div className="text-xs text-muted-foreground">12 players online now</div>
                  </div>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Join</Button>
                </CardContent>
              </Card>
            </FeatureGate>

          </div>
        </div>
      </div>
    </div>
  );
}