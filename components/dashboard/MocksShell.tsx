"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer, Globe, Save, Flag, Eraser, Send, AlertCircle, CheckCircle2, XCircle,
  Clock, Trophy, ArrowLeftRight, Info, Play, X, Search, Loader2, Eye,
} from "lucide-react";
import { Button } from "../ui/button";

import { Progress } from "../ui/progress";
import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../ui/dialog";


// ─── Types ────────────────────────────────────────────────────────────────────

type Language = "en" | "as";
type TestStatus = "loading" | "idle" | "running" | "submitting" | "results" | "upgrade";
type QuestionStatus = "not_visited" | "not_answered" | "answered" | "marked" | "answered_marked";

interface Question {
  id: string;
  section: string;
  text: string;
  textAs?: string;
  imageUrl?: string;
  options: string[];
  optionsAs?: string[];
  marks: number;
  negativeMarks: number;
  order: number;
}

interface TestMeta {
  id: string;
  title: string;
  duration: number;
  totalMarks: number;
  examType: string;
  questions: Question[];
}

interface TestResult {
  correct: number; wrong: number; unattempted: number;
  score: number; totalMarks: number; timeTaken: number;
  accuracy: number;
  attemptId?: string;
}

interface CBTEngineProps {
  testId: string;
  user?: { id?: string; name?: string | null };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

const SS_KEY = (testId: string, userId?: string) => `cbt_${testId}_${userId ?? "anon"}`;

// ─── Component ───────────────────────────────────────────────────────────────

export function CBTEngine({ testId, user }: CBTEngineProps) {
  const [status, setStatus] = useState<TestStatus>("loading");
  const [lang, setLang] = useState<Language>("en");
  const [test, setTest] = useState<TestMeta | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  // answers: { questionId → selectedOptionIndex }
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  const currentQ = test?.questions[currentIdx];

  // ── Fetch test on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        if (res.status === 403) { setStatus("upgrade"); return; }
        if (!res.ok) throw new Error("Failed to load test");
        const data: TestMeta = await res.json();
        setTest(data);
        setTimeLeft(data.duration * 60);

        // Restore from sessionStorage if available
        const saved = sessionStorage.getItem(SS_KEY(testId, user?.id));
        if (saved) {
          const parsed = JSON.parse(saved);
          setAnswers(parsed.answers ?? {});
          setMarked(new Set(parsed.marked ?? []));
          setVisited(new Set(parsed.visited ?? []));
          setAttemptId(parsed.attemptId ?? null);
          if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
          if (parsed.currentIdx) setCurrentIdx(parsed.currentIdx);
        }

        setStatus("idle");
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [testId, user?.id]);

  // ── Persist to sessionStorage on every state change ─────────────────────
  useEffect(() => {
    if (!test || status === "loading") return;
    sessionStorage.setItem(
      SS_KEY(testId, user?.id),
      JSON.stringify({ answers, marked: [...marked], visited: [...visited], attemptId, timeLeft, currentIdx })
    );
  }, [answers, marked, visited, attemptId, timeLeft, currentIdx]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); finishTest(true); return 0; }
        return prev - 1;
      });
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [status]);

  // ── DB Autosave every 60s ────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "running" || !attemptId) return;
    autosaveRef.current = setInterval(async () => {
      await fetch(`/api/tests/${testId}/attempt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers }),
      });
    }, 60_000);
    return () => clearInterval(autosaveRef.current!);
  }, [status, attemptId, answers]);

  // ── Question status ──────────────────────────────────────────────────────
  const getQuestionStatus = useCallback(
    (qId: string, idx: number): QuestionStatus => {
      const isAnswered = answers[qId] !== undefined;
      const isMarked = marked.has(qId);
      const isVisited = visited.has(qId);
      if (!isVisited && idx !== currentIdx) return "not_visited";
      if (isAnswered && isMarked) return "answered_marked";
      if (isAnswered) return "answered";
      if (isMarked) return "marked";
      return "not_answered";
    },
    [answers, marked, visited, currentIdx]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStart = async () => {
    // Create attempt record
    const res = await fetch(`/api/tests/${testId}/attempt`, { method: "POST" });
    const attempt = await res.json();
    setAttemptId(attempt.id);
    if (test) {
      setVisited(new Set([test.questions[0].id]));
    }
    setStatus("running");
  };

  const handleSelectOption = (optIndex: number) => {
    if (status !== "running" || !currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
    setVisited((prev) => new Set(prev).add(currentQ.id));
  };

  const goTo = (idx: number) => {
    if (!test) return;
    setVisited((prev) => new Set(prev).add(test.questions[idx].id));
    setCurrentIdx(idx);
  };

  const handleSaveNext = () => {
    if (!currentQ) return;
    setVisited((prev) => new Set(prev).add(currentQ.id));
    if (test && currentIdx < test.questions.length - 1) setCurrentIdx((p) => p + 1);
  };

  const handleMarkReview = () => {
    if (!currentQ) return;
    setMarked((prev) => {
      const next = new Set(prev);
      next.has(currentQ.id) ? next.delete(currentQ.id) : next.add(currentQ.id);
      return next;
    });
    if (test && currentIdx < test.questions.length - 1) setCurrentIdx((p) => p + 1);
  };

  const handleClear = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  // Update finishTest to:
  const finishTest = async (auto = false) => {
    if (status === "submitting") return;
    clearInterval(timerRef.current!);
    clearInterval(autosaveRef.current!);
    setStatus("submitting");

    try {
      const res = await fetch(`/api/tests/${testId}/attempt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          markedForReview: [...marked],  // ← send marked question IDs
        }),
      });
      const data = await res.json();
      setResult({
        correct: data.correct,
        wrong: data.wrong,
        unattempted: data.unattempted,
        score: data.score,
        totalMarks: data.totalMarks,
        timeTaken,
        accuracy: data.correct + data.wrong > 0
          ? Math.round((data.correct / (data.correct + data.wrong)) * 100) : 0,
        attemptId: data.id,   // ← save attemptId for review link
      });
      sessionStorage.removeItem(SS_KEY(testId, user?.id));
      setStatus("results");
    } catch (e) {
      setStatus("running");
    }
  };

  // ─── Status colors ────────────────────────────────────────────────────────
  const statusColors: Record<QuestionStatus, string> = {
    not_visited: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    not_answered: "bg-red-500 text-white",
    answered: "bg-emerald-500 text-white",
    marked: "bg-amber-500 text-white",
    answered_marked: "bg-emerald-500 text-white ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950",
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // ─── Upgrade required ─────────────────────────────────────────────────────
  if (status === "upgrade") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">Upgrade Required</h2>
            <p className="text-slate-500 dark:text-slate-400">
              You have used your free test. Upgrade to Premium to unlock all mock tests.
            </p>
            <Button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Idle / Start screen ──────────────────────────────────────────────────
  if (status === "idle" && test) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center">
              <Timer className="w-8 h-8 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{test.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Bilingual · {test.examType.replace("_", " ")}</p>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex justify-between"><span>Duration</span><span className="font-semibold">{test.duration} mins</span></div>
              <div className="flex justify-between"><span>Questions</span><span className="font-semibold">{test.questions.length}</span></div>
              <div className="flex justify-between"><span>Total Marks</span><span className="font-semibold">{test.totalMarks}</span></div>
              <div className="flex justify-between"><span>Scheme</span><span className="font-semibold">+4 / −1 / 0</span></div>
            </div>
            <Button onClick={handleStart} className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
              <Play className="w-5 h-5 mr-2" /> Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Results screen ───────────────────────────────────────────────────────
  if (status === "results" && result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-50">Test Completed</h1>
            <p className="text-slate-500 dark:text-slate-400">Here is your performance breakdown</p>
          </div>
          <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-6 text-center">
              <p className="text-sm font-medium opacity-80">Total Score</p>
              <p className="text-5xl md:text-6xl font-black">
                {result.score}<span className="text-2xl opacity-60">/{result.totalMarks}</span>
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-sm flex-wrap">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {result.correct} Correct</span>
                <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-400" /> {result.wrong} Wrong</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {formatTime(result.timeTaken)}</span>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Accuracy</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{result.accuracy}%</span>
                </div>
                <Progress value={result.accuracy} className="h-3 bg-slate-100 dark:bg-slate-800 [&>div]:bg-slate-900 dark:[&>div]:bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Correct", val: result.correct },
                  { label: "Wrong", val: result.wrong },
                  { label: "Skipped", val: result.unattempted },
                  { label: "Accuracy", val: `${result.accuracy}%` },
                ].map((x) => (
                  <div key={x.label} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{x.val}</p>
                    <p className="text-xs text-slate-500">{x.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                {result.attemptId && (
                  <Link href={`/cee/mock/${testId}/result/${result.attemptId}`} className="flex-1">
                    <Button className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                      <Eye className="w-4 h-4 mr-2" /> Review All Answers
                    </Button>
                  </Link>
                )}
                <Button onClick={() => setStatus("idle")} variant="outline" className="flex-1 h-12 border-zinc-200 dark:border-zinc-800">
                  <ArrowLeftRight className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── Main Test UI ─────────────────────────────────────────────────────────
  if (!test || !currentQ) return null;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      <h1 className="sr-only">Test: {test.title} — {user?.name ?? "Student"}</h1>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white dark:text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">{test.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{test.questions.length} questions · {test.duration} mins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold font-mono",
              timeLeft < 300
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            )}>
              <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "as" : "en")}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {lang === "en" ? "English" : "অসমীয়া"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 container mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Palette — left */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500" /> Question Palette
              </CardTitle>
              <div className="grid grid-cols-4 gap-1 text-[10px] mt-2">
                {[
                  { l: "Not Visited", c: "bg-slate-200 dark:bg-slate-800" },
                  { l: "Not Ans", c: "bg-red-500" },
                  { l: "Answered", c: "bg-emerald-500" },
                  { l: "Marked", c: "bg-amber-500" },
                ].map((x) => (
                  <div key={x.l} className="flex flex-col items-center gap-1">
                    <div className={`w-4 h-4 rounded ${x.c}`} />
                    <span className="text-slate-500 dark:text-slate-400 text-center leading-tight">{x.l}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] lg:h-[calc(100vh-280px)]">
                <div className="grid grid-cols-5 gap-2 p-1">
                  {test.questions.map((q, idx) => {
                    const st = getQuestionStatus(q.id, idx);
                    return (
                      <button
                        key={q.id}
                        onClick={() => goTo(idx)}
                        className={cn(
                          "w-full aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition-all hover:scale-105 focus:ring-2 focus:ring-slate-400 focus:outline-none",
                          statusColors[st]
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Question Area — center */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-sm min-h-[500px] flex flex-col">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {currentQ.section}
                    </Badge>
                    <button
                      onClick={() => setLang(lang === "en" ? "as" : "en")}
                      className="md:hidden flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
                    >
                      <Globe className="w-3.5 h-3.5" /> {lang === "en" ? "EN" : "AS"}
                    </button>
                  </div>

                  {/* Question image */}
                  {currentQ.imageUrl && (
                    <img
                      src={currentQ.imageUrl}
                      alt="Question diagram"
                      className="mt-3 max-h-48 object-contain rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800"
                    />
                  )}

                  <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4 leading-relaxed">
                    <span className="text-slate-500 dark:text-slate-400 mr-2">Q{currentIdx + 1}.</span>
                    {lang === "en"
                      ? currentQ.text
                      : currentQ.textAs || currentQ.text}
                  </h2>
                </CardHeader>
                <CardContent className="flex-1 pt-6 space-y-3">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = answers[currentQ.id] === i;
                    const displayOpt =
                      lang === "as" && currentQ.optionsAs?.[i]
                        ? currentQ.optionsAs[i]
                        : opt;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                          isSelected
                            ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800/50"
                            : "border-slate-200/70 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0",
                          isSelected
                            ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                            : "border-slate-300 dark:border-slate-700 text-slate-500"
                        )}>
                          {["A", "B", "C", "D"][i]}
                        </div>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{displayOpt}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions — right */}
        <div className="lg:col-span-3 order-3 space-y-4">
          <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 sticky top-20">
            <CardContent className="p-4 space-y-3">
              <Button onClick={handleSaveNext} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                <Save className="w-4 h-4 mr-2" /> Save & Next
              </Button>
              <Button
                onClick={handleMarkReview}
                variant="outline"
                className="w-full h-11 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <Flag className="w-4 h-4 mr-2" /> Mark for Review & Next
              </Button>
              <Button
                onClick={handleClear}
                variant="ghost"
                className="w-full h-11 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Eraser className="w-4 h-4 mr-2" /> Clear Response
              </Button>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  variant="destructive"
                  className="w-full h-11 bg-red-600 hover:bg-red-700"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit Test
                </Button>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" /> +4 correct · −1 wrong
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Submit dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Submit Test?
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              You have <span className="font-bold text-slate-900 dark:text-slate-100">
                {test.questions.length - answeredCount}
              </span> unattempted questions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{answeredCount}</p>
              <p className="text-xs text-slate-500">Answered</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-xl font-black text-red-600 dark:text-red-400">{test.questions.length - answeredCount}</p>
              <p className="text-xs text-slate-500">Not Answered</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">{marked.size}</p>
              <p className="text-xs text-slate-500">Marked</p>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => { setShowSubmitDialog(false); finishTest(); }}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}