"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CheckCircle2, XCircle, MinusCircle, Flag, Clock, Target,
    Trophy, ArrowLeft, ChevronDown, ChevronUp, Lightbulb,
    BarChart3, RotateCcw, TrendingUp, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";


// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionResult {
    id: string; order: number; section: string;
    text: string; textAs: string | null; imageUrl: string | null;
    options: string[]; optionsAs: string[];
    correctIndex: number;
    explanation: string | null; explanationImageUrl: string | null;
    marks: number; negativeMarks: number;
    userAnswer: number | null;
    isCorrect: boolean; isSkipped: boolean; isMarked: boolean;
    marksEarned: number;
}

interface ResultData {
    attempt: { id: string; score: number; percentage: number; completedAt: Date | null; timeTaken: number };
    test: { id: string; title: string; totalMarks: number; duration: number };
    stats: { correct: number; wrong: number; skipped: number; marked: number; accuracy: number };
    subjectBreakdown: Array<{ section: string; total: number; correct: number; wrong: number; score: number; maxScore: number }>;
    questions: QuestionResult[];
}

type FilterType = "all" | "correct" | "wrong" | "skipped" | "marked";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${sec}s`;
}

const STATUS_CONFIG = {
    correct: { label: "Correct", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
    wrong: { label: "Wrong", icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
    skipped: { label: "Skipped", icon: MinusCircle, color: "text-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-900/20", border: "border-zinc-200 dark:border-zinc-800", badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400" },
};

function getQuestionStatus(q: QuestionResult): keyof typeof STATUS_CONFIG {
    if (q.isSkipped) return "skipped";
    return q.isCorrect ? "correct" : "wrong";
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ q, index, lang }: { q: QuestionResult; index: number; lang: "en" | "as" }) {
    const [expanded, setExpanded] = useState(false);
    const status = getQuestionStatus(q);
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    const displayOptions = lang === "as" && q.optionsAs?.length === 4 ? q.optionsAs : q.options;

    return (
        <Card className={cn("border-2 transition-all", cfg.border, q.isMarked && "ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-zinc-950")}>
            {/* Header */}
            <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(!expanded)}
            >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon className={cn("w-4 h-4", cfg.color)} />
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Q{index + 1}</span>
                    <Badge className={cn("text-[10px] font-bold", cfg.badge)}>{cfg.label}</Badge>
                    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px]">
                        {q.section}
                    </Badge>
                    {q.isMarked && (
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px]">
                            <Flag className="w-2.5 h-2.5 mr-1" /> Marked
                        </Badge>
                    )}
                    <span className={cn("text-xs font-bold ml-auto", q.marksEarned > 0 ? "text-emerald-600 dark:text-emerald-400" : q.marksEarned < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-500")}>
                        {q.marksEarned > 0 ? "+" : ""}{q.marksEarned} marks
                    </span>
                </div>

                <div className="shrink-0 text-zinc-400">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="px-4 pb-5 space-y-5 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    {/* Question image */}
                    {q.imageUrl && (
                        <img src={q.imageUrl} alt="Question" className="max-h-48 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
                    )}

                    {/* Question text */}
                    <p className="text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                        {lang === "as" && q.textAs ? q.textAs : q.text}
                    </p>

                    {/* Options */}
                    <div className="space-y-2">
                        {displayOptions.map((opt, i) => {
                            const isUserAnswer = q.userAnswer === i;
                            const isCorrectAnswer = q.correctIndex === i;

                            let optionStyle = "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300";
                            let labelStyle = "border-zinc-300 dark:border-zinc-700 text-zinc-500";
                            let indicator = null;

                            if (isCorrectAnswer) {
                                optionStyle = "border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100";
                                labelStyle = "border-emerald-500 bg-emerald-500 text-white";
                                indicator = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
                            }

                            if (isUserAnswer && !isCorrectAnswer) {
                                optionStyle = "border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100";
                                labelStyle = "border-red-500 bg-red-500 text-white";
                                indicator = <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
                            }

                            return (
                                <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl border-2 transition-all", optionStyle)}>
                                    <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5", labelStyle)}>
                                        {["A", "B", "C", "D"][i]}
                                    </div>
                                    <span className="text-sm flex-1 leading-relaxed">{opt}</span>
                                    <div className="shrink-0 flex items-center gap-1.5">
                                        {indicator}
                                        {isUserAnswer && isCorrectAnswer && (
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Your answer</span>
                                        )}
                                        {isUserAnswer && !isCorrectAnswer && (
                                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400">Your answer</span>
                                        )}
                                        {!isUserAnswer && isCorrectAnswer && (
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Correct</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* User skipped indicator */}
                    {q.isSkipped && (
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                            <MinusCircle className="w-4 h-4 shrink-0" />
                            <span>You skipped this question. Correct answer: <strong className="text-zinc-700 dark:text-zinc-300">{["A", "B", "C", "D"][q.correctIndex]}</strong></span>
                        </div>
                    )}

                    {/* Explanation */}
                    {(q.explanation || q.explanationImageUrl) && (
                        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Lightbulb className="w-4 h-4 shrink-0" />
                                <span className="text-sm font-bold">Explanation</span>
                            </div>
                            {q.explanation && (
                                <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed whitespace-pre-wrap">
                                    {q.explanation}
                                </p>
                            )}
                            {q.explanationImageUrl && (
                                <img
                                    src={q.explanationImageUrl}
                                    alt="Explanation diagram"
                                    className="max-h-64 object-contain rounded-lg border border-blue-200 dark:border-blue-700"
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResultReview({ data, testId }: { data: ResultData; testId: string }) {
    const [filter, setFilter] = useState<FilterType>("all");
    const [lang, setLang] = useState<"en" | "as">("en");
    const [expandAll, setExpandAll] = useState(false);

    const { attempt, test, stats, subjectBreakdown, questions } = data;

    const filteredQuestions = questions.filter((q) => {
        if (filter === "all") return true;
        if (filter === "correct") return q.isCorrect;
        if (filter === "wrong") return !q.isCorrect && !q.isSkipped;
        if (filter === "skipped") return q.isSkipped;
        if (filter === "marked") return q.isMarked;
        return true;
    });

    const FILTERS: Array<{ key: FilterType; label: string; count: number; color: string }> = [
        { key: "all", label: "All", count: questions.length, color: "data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-white dark:data-[active=true]:text-zinc-900" },
        { key: "correct", label: "Correct", count: stats.correct, color: "data-[active=true]:bg-emerald-600 data-[active=true]:text-white" },
        { key: "wrong", label: "Wrong", count: stats.wrong, color: "data-[active=true]:bg-red-600 data-[active=true]:text-white" },
        { key: "skipped", label: "Skipped", count: stats.skipped, color: "data-[active=true]:bg-zinc-500 data-[active=true]:text-white" },
        { key: "marked", label: "Marked", count: stats.marked, color: "data-[active=true]:bg-amber-500 data-[active=true]:text-white" },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-16">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/my-batches">
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Test Result</p>
                        <h1 className="text-lg font-black text-zinc-900 dark:text-zinc-50 truncate">{test.title}</h1>
                    </div>
                    <Link href={`/cee/mock/${testId}`}>
                        <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800 shrink-0">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reattempt
                        </Button>
                    </Link>
                </div>

                {/* Score hero */}
                <Card className="bg-zinc-900 dark:bg-white border-none shadow-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 text-white dark:text-zinc-900">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-zinc-400 dark:text-zinc-600 font-medium mb-1">Your Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black">{attempt.score}</span>
                                        <span className="text-2xl text-zinc-400 dark:text-zinc-500 font-medium">/ {test.totalMarks}</span>
                                    </div>
                                    <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">
                                        {Math.round(attempt.percentage)}% · {stats.accuracy}% accuracy
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: CheckCircle2, label: "Correct", value: stats.correct, color: "text-emerald-400 dark:text-emerald-600" },
                                        { icon: XCircle, label: "Wrong", value: stats.wrong, color: "text-red-400 dark:text-red-600" },
                                        { icon: MinusCircle, label: "Skipped", value: stats.skipped, color: "text-zinc-400 dark:text-zinc-500" },
                                        { icon: Clock, label: "Time", value: formatTime(attempt.timeTaken), color: "text-blue-400 dark:text-blue-600" },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <Icon className={cn("w-4 h-4 shrink-0", color)} />
                                            <div>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">{label}</p>
                                                <p className="text-sm font-bold text-white dark:text-zinc-900">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-5">
                                <div className="flex h-3 rounded-full overflow-hidden bg-white/10 dark:bg-zinc-900/10">
                                    <div
                                        className="bg-emerald-500 transition-all"
                                        style={{ width: `${(stats.correct / questions.length) * 100}%` }}
                                    />
                                    <div
                                        className="bg-red-500 transition-all"
                                        style={{ width: `${(stats.wrong / questions.length) * 100}%` }}
                                    />
                                    <div
                                        className="bg-zinc-500 transition-all"
                                        style={{ width: `${(stats.skipped / questions.length) * 100}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Correct</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Wrong</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" /> Skipped</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subject breakdown */}
                {subjectBreakdown.length > 1 && (
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-zinc-500" /> Subject Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subjectBreakdown.map((sub) => {
                                const pct = sub.maxScore > 0 ? Math.round((Math.max(0, sub.score) / sub.maxScore) * 100) : 0;
                                const accuracy = sub.correct + sub.wrong > 0 ? Math.round((sub.correct / (sub.correct + sub.wrong)) * 100) : 0;
                                return (
                                    <div key={sub.section} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{sub.section}</span>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                <span className="text-emerald-600 dark:text-emerald-400">{sub.correct}✓</span>
                                                <span className="text-red-600 dark:text-red-400">{sub.wrong}✗</span>
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{sub.score}/{sub.maxScore}</span>
                                            </div>
                                        </div>
                                        <Progress value={pct} className="h-2 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-zinc-900 dark:[&>div]:bg-zinc-100" />
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Filter + controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                data-active={filter === f.key}
                                onClick={() => setFilter(f.key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                    filter === f.key
                                        ? f.key === "correct" ? "bg-emerald-600 text-white border-emerald-600"
                                            : f.key === "wrong" ? "bg-red-600 text-white border-red-600"
                                                : f.key === "marked" ? "bg-amber-500 text-white border-amber-500"
                                                    : f.key === "skipped" ? "bg-zinc-600 text-white border-zinc-600"
                                                        : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                                        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                )}
                            >
                                {f.label}
                                <span className="bg-white/20 dark:bg-zinc-900/20 rounded px-1.5 py-0.5">
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setLang(lang === "en" ? "as" : "en")}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                            {lang === "en" ? "EN" : "অস"}
                        </button>
                    </div>
                </div>

                {/* Empty filter state */}
                {filteredQuestions.length === 0 && (
                    <div className="text-center py-12">
                        <CheckCircle2 className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">No {filter} questions</p>
                    </div>
                )}

                {/* Questions */}
                <div className="space-y-3">
                    {filteredQuestions.map((q, idx) => (
                        <QuestionCard key={q.id} q={q} index={questions.indexOf(q)} lang={lang} />
                    ))}
                </div>

                {/* Bottom actions */}
                {filteredQuestions.length > 0 && (
                    <div className="flex gap-3 pt-4">
                        <Link href="/my-batches" className="flex-1">
                            <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Batches
                            </Button>
                        </Link>
                        <Link href={`/cee/mock/${testId}`} className="flex-1">
                            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                                <RotateCcw className="w-4 h-4 mr-2" /> Reattempt Test
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}