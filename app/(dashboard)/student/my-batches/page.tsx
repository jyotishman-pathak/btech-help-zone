"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Timer, Download, Play, ChevronRight,
  Loader2, Trophy, CheckCircle2, Clock, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from  "../../../../components/ui/tabs";
import { cn } from "../../../../lib/utils";
import { Progress } from "../../../../components/ui/progress";



interface Attempt {
  testId: string;
  score: number;
  percentage: number;
  completedAt: string;
}

interface BatchTest {
  id: string;
  order: number;
  test: {
    id: string; title: string; duration: number;
    totalMarks: number; examType: string; isActive: boolean;
  };
  lastAttempt: Attempt | null;
}

interface BatchPYQ {
  id: string;
  pyq: { id: string; title: string; year: number | null; downloads: number; fileUrl: string; };
}

interface BatchNote {
  id: string;
  note: { id: string; title: string; type: string; fileUrl: string; downloads: number; };
}

interface Enrollment {
  id: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  batch: {
    id: string; name: string; slug: string; bannerUrl: string | null;
    type: string; isFree: boolean; validDays: number | null;
    features: { text: string }[];
    tests: BatchTest[];
    notes: BatchNote[];
    pyqs: BatchPYQ[];
    _count: { enrollments: number };
  };
}

export default function MyBatchesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEnrollment, setActiveEnrollment] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/my-batches")
      .then((r) => r.json())
      .then((data) => {
        setEnrollments(Array.isArray(data) ? data : []);
        if (data.length > 0) setActiveEnrollment(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (pyqId: string, fileUrl: string) => {
    setDownloading(pyqId);
    try {
      const res = await fetch(`/api/pyq/${pyqId}/download`, { method: "POST" });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  const handleNoteDownload = async (noteUrl: string) => {
    window.open(noteUrl, "_blank");
  };

  const daysLeft = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 86400000));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-zinc-400" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">No batches yet</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Enroll in a batch to start your structured learning journey.
          </p>
          <Link href="/batches">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 h-11 px-6">
              Browse Batches <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const active = enrollments.find((e) => e.id === activeEnrollment);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black">My Batches</h1>
          <p className="text-zinc-400 dark:text-zinc-600 mt-1">
            {enrollments.length} active enrollment{enrollments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left: Batch list */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
              Your Batches
            </h2>
            {enrollments.map((enrollment) => {
              const days = daysLeft(enrollment.expiresAt);
              const testsDone = enrollment.batch.tests.filter((t) => t.lastAttempt).length;
              const testsTotal = enrollment.batch.tests.length;
              const progress = testsTotal > 0 ? Math.round((testsDone / testsTotal) * 100) : 0;
              const isActive = activeEnrollment === enrollment.id;

              return (
                <button
                  key={enrollment.id}
                  onClick={() => setActiveEnrollment(enrollment.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-md"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  {enrollment.batch.bannerUrl ? (
                    <img src={enrollment.batch.bannerUrl} alt="" className="w-full h-16 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="w-full h-16 rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center mb-3">
                      <span className="text-2xl font-black text-zinc-400 dark:text-zinc-600">
                        {enrollment.batch.name.slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{enrollment.batch.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{enrollment.batch.type.replace("_", " ")}</p>

                  {testsTotal > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>{testsDone}/{testsTotal} tests done</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-zinc-900 dark:[&>div]:bg-zinc-100" />
                    </div>
                  )}

                  {days !== null && (
                    <p className={cn("text-[10px] mt-2 font-medium", days < 7 ? "text-red-500" : "text-zinc-400")}>
                      {days === 0 ? "Expires today" : `${days} days left`}
                    </p>
                  )}
                </button>
              );
            })}

            <Link href="/batches">
              <Button variant="outline" className="w-full border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
                <BookOpen className="w-4 h-4 mr-2" /> Browse more batches
              </Button>
            </Link>
          </div>

          {/* Right: Batch content */}
          {active && (
            <div className="lg:col-span-3">
              {/* Batch header */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{active.batch.name}</h2>
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px]">
                          ✓ Enrolled
                        </Badge>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        {active.batch.tests.length} tests · {active.batch.pyqs.length} PYQs · {active.batch.notes.length} notes
                      </p>
                    </div>
                    <Link href={`/batches/${active.batch.slug}`}>
                      <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800 shrink-0">
                        View Batch <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Progress stats */}
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      {
                        icon: Timer,
                        label: "Tests",
                        value: `${active.batch.tests.filter((t) => t.lastAttempt).length}/${active.batch.tests.length}`,
                        sub: "Completed",
                        color: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-50 dark:bg-blue-900/20",
                      },
                      {
                        icon: Download,
                        label: "PYQs",
                        value: active.batch.pyqs.length,
                        sub: "Available",
                        color: "text-violet-600 dark:text-violet-400",
                        bg: "bg-violet-50 dark:bg-violet-900/20",
                      },
                      {
                        icon: BookOpen,
                        label: "Notes",
                        value: active.batch.notes.length,
                        sub: "Available",
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-50 dark:bg-amber-900/20",
                      },
                    ].map((stat) => (
                      <div key={stat.label} className={cn("p-4 rounded-xl", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
                        <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.sub} {stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Tabs */}
              <Tabs defaultValue="tests">
                <TabsList className="w-full grid grid-cols-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 h-12 rounded-xl">
                  {[
                    { value: "tests", label: "Mock Tests", count: active.batch.tests.length },
                    { value: "pyqs", label: "PYQs", count: active.batch.pyqs.length },
                    { value: "notes", label: "Notes", count: active.batch.notes.length },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-sm font-semibold data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 transition-all gap-2"
                    >
                      {tab.label}
                      <span className="text-[10px] opacity-60">({tab.count})</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Tests Tab */}
                <TabsContent value="tests" className="mt-4 space-y-3">
                  {active.batch.tests.length === 0 ? (
                    <EmptyState icon={Timer} message="No mock tests in this batch yet." />
                  ) : (
                    active.batch.tests.map((bt, idx) => {
                      const attempted = !!bt.lastAttempt;
                      return (
                        <Card key={bt.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {/* Number */}
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0",
                                attempted ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                              )}>
                                {attempted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{bt.test.title}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {bt.test.duration} mins
                                  </span>
                                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> {bt.test.totalMarks} marks
                                  </span>
                                  {attempted && bt.lastAttempt && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <Trophy className="w-3 h-3" /> {bt.lastAttempt.score}/{bt.test.totalMarks}
                                      {" "}({Math.round(bt.lastAttempt.percentage)}%)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Link href={`/cee/mock/${bt.test.id}`}>
                                <Button
                                  size="sm"
                                  className={cn(
                                    "shrink-0",
                                    attempted
                                      ? "border-zinc-200 dark:border-zinc-700"
                                      : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                                  )}
                                  variant={attempted ? "outline" : "default"}
                                  disabled={!bt.test.isActive}
                                >
                                  <Play className="w-3.5 h-3.5 mr-1.5" />
                                  {attempted ? "Reattempt" : bt.test.isActive ? "Start" : "Unavailable"}
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </TabsContent>

                {/* PYQs Tab */}
                <TabsContent value="pyqs" className="mt-4">
                  {active.batch.pyqs.length === 0 ? (
                    <EmptyState icon={Download} message="No PYQs in this batch yet." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {active.batch.pyqs.map((bp) => (
                        <Card key={bp.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {bp.pyq.year && (
                                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{bp.pyq.year}</p>
                                )}
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 line-clamp-2">
                                  {bp.pyq.title}
                                </p>
                                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                                  <Download className="w-3 h-3" /> {bp.pyq.downloads.toLocaleString()} downloads
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleDownload(bp.pyq.id, bp.pyq.fileUrl)}
                                disabled={downloading === bp.pyq.id}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 shrink-0"
                              >
                                {downloading === bp.pyq.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <><Download className="w-3.5 h-3.5 mr-1" /> PDF</>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mt-4 space-y-3">
                  {active.batch.notes.length === 0 ? (
                    <EmptyState icon={BookOpen} message="No notes in this batch yet." />
                  ) : (
                    active.batch.notes.map((bn) => (
                      <Card key={bn.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{bn.note.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  {bn.note.type}
                                </Badge>
                                <span className="text-xs text-zinc-400">{bn.note.downloads} downloads</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNoteDownload(bn.note.fileUrl)}
                              className="border-zinc-200 dark:border-zinc-700 shrink-0"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" /> Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="py-16 text-center">
      <Icon className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">{message}</p>
    </div>
  );
}