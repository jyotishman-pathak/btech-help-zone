"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft, Save, Plus, Trash2, ChevronDown, ChevronUp,
    Check, X, Image as ImageIcon, Loader2, Eye, ToggleLeft,
    ToggleRight, GripVertical, Copy, ExternalLink, BookOpen, Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";





import { uploadToCloudinary } from "../../../../../../lib/cloudinary-upload";
import { cn } from "../../../../../../lib/utils";
import { Badge } from "../../../../../../components/ui/badge";
import { Label } from "../../../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/select";
import { Input } from "../../../../../../components/ui/input";
import { Textarea } from "../../../../../../components/ui/textarea";
import { Button } from "../../../../../../components/ui/button";
import { AdminPageWrapper } from "../../../../../../components/dashboard/AdminPageWrapper";


const SECTIONS = ["Physics", "Chemistry", "Mathematics", "General"];

interface Question {
    id: string;
    text: string;
    textAs: string | null;
    imageUrl: string | null;
    options: string[];
    optionsAs: string[];
    correctIndex: number;
    explanation?: string | null;
    explanationImageUrl?: string | null;
    marks: number;
    negativeMarks: number;
    section: string;
    order: number;
    // local state
    _expanded?: boolean;
    _saving?: boolean;
    _saved?: boolean;
    _dirty?: boolean;
    _uploading?: boolean;
}

interface Test {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    examType: string;
    isActive: boolean;
    totalMarks: number;
    accessCode: string;
    subjectId: string | null;
    batchTests: Array<{ batch: { id: string; name: string; type: string } }>;
}

// ── Inline save feedback ──────────────────────────────────────────────────────

function SaveButton({ saving, saved, dirty, onClick, label = "Save" }: {
    saving: boolean; saved: boolean; dirty: boolean;
    onClick: () => void; label?: string;
}) {
    return (
        <Button
            size="sm"
            onClick={onClick}
            disabled={saving || !dirty}
            className={cn(
                "h-8 text-xs transition-all",
                saved && !dirty
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
            )}
        >
            {saving
                ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</>
                : saved && !dirty
                    ? <><Check className="w-3 h-3 mr-1" /> Saved</>
                    : <><Save className="w-3 h-3 mr-1" /> {label}</>
            }
        </Button>
    );
}

// ── Question Editor ───────────────────────────────────────────────────────────

function QuestionEditor({
    question, index, testId,
    onUpdate, onDelete, onMoveUp, onMoveDown,
    isFirst, isLast,
}: {
    question: Question;
    index: number;
    testId: string;
    onUpdate: (q: Question) => void;
    onDelete: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    const [local, setLocal] = useState<Question>(question);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [explanationUploading, setExplanationUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const explanationImgRef = useRef<HTMLInputElement>(null);

    const update = (patch: Partial<Question>) => {
        setLocal((prev) => ({ ...prev, ...patch }));
        setDirty(true);
        setSaved(false);
    };

    const updateOption = (idx: number, val: string) => {
        const next = [...local.options];
        next[idx] = val;
        update({ options: next });
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const { url } = await uploadToCloudinary(file, { folder: "cee/questions", resourceType: "image" });
            update({ imageUrl: url });
        } catch { alert("Image upload failed. Check Cloudinary."); }
        finally { setUploading(false); }
    };

    const handleExplanationImageUpload = async (file: File) => {
        setExplanationUploading(true);
        try {
            const { url } = await uploadToCloudinary(file, { folder: "cee/questions/explanations", resourceType: "image" });
            update({ explanationImageUrl: url });
        } catch { alert("Explanation image upload failed. Check Cloudinary."); }
        finally { setExplanationUploading(false); }
    };

    const saveQuestion = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tests/${testId}/questions/${local.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: local.text,
                    textAs: local.textAs,
                    imageUrl: local.imageUrl,
                    options: local.options,
                    optionsAs: local.optionsAs,
                    correctIndex: local.correctIndex,
                    marks: local.marks,
                    negativeMarks: local.negativeMarks,
                    section: local.section,
                    explanation: local.explanation,
                    explanationImageUrl: local.explanationImageUrl,
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate({ ...updated, _expanded: true });
                setDirty(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally { setSaving(false); }
    };

    const confirmDelete = async () => {
        if (!confirm(`Delete Q${index + 1}? This cannot be undone.`)) return;
        const res = await fetch(`/api/admin/tests/${testId}/questions/${local.id}`, { method: "DELETE" });
        if (res.ok) onDelete(local.id);
    };

    const isExpanded = question._expanded;

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            {/* Question header */}
            <div className="flex items-center gap-2 p-3 border-b border-zinc-100 dark:border-zinc-800">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                    <button
                        onClick={() => onMoveUp(local.id)}
                        disabled={isFirst}
                        className="p-0.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 transition"
                    >
                        <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onMoveDown(local.id)}
                        disabled={isLast}
                        className="p-0.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 transition"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Question number + preview */}
                <button
                    className="flex-1 flex items-center gap-2 text-left"
                    onClick={() => onUpdate({ ...question, _expanded: !isExpanded })}
                >
                    <Badge variant="outline" className="border-zinc-200 dark:border-zinc-700 text-xs shrink-0">
                        Q{index + 1}
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs shrink-0">
                        {local.section}
                    </Badge>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                        {local.text || "Empty question"}
                    </span>
                    <span className="text-xs text-zinc-400 shrink-0">+{local.marks}/-{local.negativeMarks}</span>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                    {dirty && (
                        <SaveButton saving={saving} saved={saved} dirty={dirty} onClick={saveQuestion} />
                    )}
                    <button
                        onClick={confirmDelete}
                        className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-zinc-400" />
                        : <ChevronDown className="w-4 h-4 text-zinc-400" />
                    }
                </div>
            </div>

            {/* Editor */}
            {isExpanded && (
                <CardContent className="p-4 space-y-4">
                    {/* Section + marks */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Section</Label>
                            <Select value={local.section} onValueChange={(v) => update({ section: v })}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Marks (+)</Label>
                            <Input
                                type="number" value={local.marks} className="h-8 text-sm"
                                onChange={(e) => update({ marks: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Negative (-)</Label>
                            <Input
                                type="number" value={local.negativeMarks} className="h-8 text-sm"
                                onChange={(e) => update({ negativeMarks: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Question text */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Question (English) *</Label>
                            <Textarea
                                value={local.text}
                                onChange={(e) => update({ text: e.target.value })}
                                rows={3} className="text-sm resize-none"
                                placeholder="Enter question in English..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Question (Assamese)</Label>
                            <Textarea
                                value={local.textAs ?? ""}
                                onChange={(e) => update({ textAs: e.target.value || null })}
                                rows={3} className="text-sm resize-none"
                                placeholder="অসমীয়াত প্ৰশ্ন..."
                            />
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">Question Image (optional)</Label>
                        {local.imageUrl ? (
                            <div className="flex items-start gap-3">
                                <img
                                    src={local.imageUrl} alt="Question"
                                    className="h-28 rounded-lg border border-zinc-200 dark:border-zinc-700 object-contain bg-zinc-50 dark:bg-zinc-800"
                                />
                                <button
                                    onClick={() => update({ imageUrl: null })}
                                    className="p-1.5 rounded bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 text-sm hover:border-zinc-400 transition"
                            >
                                {uploading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                    : <><ImageIcon className="w-4 h-4" /> Upload image</>
                                }
                            </button>
                        )}
                        <input
                            ref={fileRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        <Label className="text-xs">Options — click circle to mark correct answer</Label>
                        {local.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <button
                                    onClick={() => update({ correctIndex: i })}
                                    className={cn(
                                        "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs transition-all",
                                        local.correctIndex === i
                                            ? "border-emerald-500 bg-emerald-500 text-white"
                                            : "border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-emerald-400"
                                    )}
                                >
                                    {local.correctIndex === i ? <Check className="w-3 h-3" /> : "ABCD"[i]}
                                </button>
                                <Input
                                    value={opt}
                                    onChange={(e) => updateOption(i, e.target.value)}
                                    placeholder={`Option ${["A", "B", "C", "D"][i]}`}
                                    className="flex-1 h-8 text-sm"
                                />
                                <Input
                                    value={local.optionsAs?.[i] ?? ""}
                                    onChange={(e) => {
                                        const next = [...(local.optionsAs ?? ["", "", "", ""])];
                                        next[i] = e.target.value;
                                        update({ optionsAs: next });
                                    }}
                                    placeholder={`বিকল্প ${["ক", "খ", "গ", "ঘ"][i]}`}
                                    className="flex-1 h-8 text-sm"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Explanation Section */}
                    <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3 bg-blue-50/50 dark:bg-blue-900/10">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <Label className="text-xs text-blue-700 dark:text-blue-400 font-bold">
                                Solution Explanation (shown to students after submission)
                            </Label>
                        </div>

                        <Textarea
                            value={local.explanation ?? ""}
                            onChange={(e) => update({ explanation: e.target.value || null })}
                            placeholder="Explain the correct answer, steps, formula used, key concept..."
                            rows={4}
                            className="text-sm resize-none border-blue-200 dark:border-blue-800 focus:border-blue-400 bg-white dark:bg-zinc-900"
                        />

                        <div className="space-y-1.5">
                            <Label className="text-xs text-blue-600 dark:text-blue-400">Explanation Image (diagram, graph, etc.)</Label>
                            {local.explanationImageUrl ? (
                                <div className="flex items-start gap-3">
                                    <img
                                        src={local.explanationImageUrl}
                                        alt="Explanation"
                                        className="h-28 rounded-lg border border-blue-200 dark:border-blue-700 object-contain bg-white dark:bg-zinc-800"
                                    />
                                    <button
                                        onClick={() => update({ explanationImageUrl: null })}
                                        className="p-1.5 rounded bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => explanationImgRef.current?.click()}
                                    disabled={explanationUploading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-500 text-sm hover:border-blue-400 transition bg-white dark:bg-zinc-900"
                                >
                                    {explanationUploading
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                        : <><ImageIcon className="w-4 h-4" /> Upload explanation image</>
                                    }
                                </button>
                            )}
                            <input
                                ref={explanationImgRef} type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExplanationImageUpload(f); }}
                            />
                        </div>
                    </div>

                    {/* Save button at bottom of expanded question */}
                    <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <SaveButton saving={saving} saved={saved} dirty={dirty} onClick={saveQuestion} label="Save Question" />
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

// ── Main edit page ────────────────────────────────────────────────────────────

export default function TestEditPage() {
    const params = useParams();
    const router = useRouter();
    const testId = params.id as string;

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Metadata save state
    const [metaDirty, setMetaDirty] = useState(false);
    const [metaSaving, setMetaSaving] = useState(false);
    const [metaSaved, setMetaSaved] = useState(false);

    // Selected batches for assignment
    const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
    const [addingQuestion, setAddingQuestion] = useState(false);

    // Fetch test data
    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/tests/${testId}`).then((r) => r.json()),
            fetch("/api/admin/batches").then((r) => r.json()),
        ]).then(([testData, batchData]) => {
            if (testData.id) {
                setTest(testData);
                setQuestions(testData.questions.map((q: Question) => ({ ...q, _expanded: false })));
                setSelectedBatchIds(testData.batchTests?.map((bt: any) => bt.batch.id) ?? []);
            }
            setBatches(Array.isArray(batchData) ? batchData : []);
        }).finally(() => setLoading(false));
    }, [testId]);

    const updateTestField = (field: string, value: any) => {
        setTest((prev) => prev ? { ...prev, [field]: value } : prev);
        setMetaDirty(true);
        setMetaSaved(false);
    };

    const saveMetadata = async () => {
        if (!test) return;
        setMetaSaving(true);
        try {
            const res = await fetch(`/api/admin/tests/${testId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: test.title,
                    description: test.description,
                    duration: test.duration,
                    examType: test.examType,
                    isActive: test.isActive,
                    batchIds: selectedBatchIds,
                }),
            });
            if (res.ok) {
                setMetaDirty(false);
                setMetaSaved(true);
                setTimeout(() => setMetaSaved(false), 3000);
            }
        } finally { setMetaSaving(false); }
    };

    const addQuestion = async () => {
        setAddingQuestion(true);
        try {
            const res = await fetch(`/api/admin/tests/${testId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (res.ok) {
                const q = await res.json();
                setQuestions((prev) => [...prev, { ...q, _expanded: true }]);
            }
        } finally { setAddingQuestion(false); }
    };

    const updateQuestion = (updated: Question) => {
        setQuestions((prev) => prev.map((q) => q.id === updated.id ? updated : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i })));
    };

    const moveQuestion = async (id: string, direction: "up" | "down") => {
        const idx = questions.findIndex((q) => q.id === id);
        if (direction === "up" && idx === 0) return;
        if (direction === "down" && idx === questions.length - 1) return;

        const next = [...questions];
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];

        const reordered = next.map((q, i) => ({ ...q, order: i }));
        setQuestions(reordered);

        // Persist new order for both swapped questions
        await Promise.all([
            fetch(`/api/admin/tests/${testId}/questions/${reordered[idx].id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...reordered[idx], order: idx }),
            }),
            fetch(`/api/admin/tests/${testId}/questions/${reordered[swapIdx].id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...reordered[swapIdx], order: swapIdx }),
            }),
        ]);
    };

    const toggleBatch = (batchId: string) => {
        setSelectedBatchIds((prev) =>
            prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
        );
        setMetaDirty(true);
        setMetaSaved(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!test) {
        return (
            <div className="text-center py-16">
                <p className="text-zinc-500">Test not found.</p>
                <Link href="/admin/tests"><Button variant="outline" className="mt-4">Back to Tests</Button></Link>
            </div>
        );
    }

    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

    return (
        <AdminPageWrapper activeTab="tests" backHref="/admin/tests">
            <div className="max-w-4xl mx-auto space-y-6 pb-16">
                {/* Breadcrumb + Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                <span>Admin</span> › <span>Tests</span> ›
                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{test.title}</span>
                            </div>
                            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Edit Test</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/cee/mock/${testId}`} target="_blank">
                            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800">
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            onClick={() => { updateTestField("isActive", !test.isActive); setMetaDirty(true); }}
                            className={cn(
                                "transition-all",
                                test.isActive
                                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            )}
                        >
                            {test.isActive
                                ? <><ToggleLeft className="w-3.5 h-3.5 mr-1.5" /> Set Draft</>
                                : <><ToggleRight className="w-3.5 h-3.5 mr-1.5" /> Go Live</>
                            }
                        </Button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Questions", value: questions.length },
                        { label: "Total Marks", value: totalMarks },
                        { label: "Duration", value: `${test.duration}m` },
                        { label: "Status", value: test.isActive ? "Live" : "Draft" },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center">
                            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Test Metadata */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Test Details</CardTitle>
                            <SaveButton saving={metaSaving} saved={metaSaved} dirty={metaDirty} onClick={saveMetadata} label="Save Details" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Title *</Label>
                                <Input
                                    value={test.title}
                                    onChange={(e) => updateTestField("title", e.target.value)}
                                    placeholder="Full Syllabus Mock #1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Duration (mins)</Label>
                                    <Input
                                        type="number"
                                        value={test.duration}
                                        onChange={(e) => updateTestField("duration", parseInt(e.target.value) || 180)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Exam Type</Label>
                                    <Select value={test.examType} onValueChange={(v) => updateTestField("examType", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_MOCK">Full Mock</SelectItem>
                                            <SelectItem value="TOPIC_WISE">Topic Wise</SelectItem>
                                            <SelectItem value="YEAR_WISE">Year Wise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea
                                value={test.description ?? ""}
                                onChange={(e) => updateTestField("description", e.target.value || null)}
                                rows={2} className="resize-none text-sm"
                                placeholder="Brief description of this test..."
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <span>Access Code:</span>
                            <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-200">
                                {test.accessCode}
                            </code>
                            <button
                                onClick={() => navigator.clipboard.writeText(test.accessCode)}
                                className="text-zinc-400 hover:text-zinc-600 transition"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Batch Assignment */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-zinc-500" /> Batch Assignment
                                </CardTitle>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    {selectedBatchIds.length} batch{selectedBatchIds.length !== 1 ? "es" : ""} selected · changes save with Test Details
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {batches.length === 0 ? (
                            <p className="text-sm text-zinc-400 italic">
                                No batches yet.{" "}
                                <Link href="/admin/batches/new" className="underline text-zinc-600 dark:text-zinc-300">
                                    Create one first.
                                </Link>
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {batches.map((batch) => {
                                    const isSelected = selectedBatchIds.includes(batch.id);
                                    return (
                                        <button
                                            key={batch.id}
                                            onClick={() => toggleBatch(batch.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                                                isSelected
                                                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                                isSelected
                                                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100"
                                                    : "border-zinc-300 dark:border-zinc-700"
                                            )}>
                                                {isSelected && <Check className="w-3 h-3 text-white dark:text-zinc-900" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{batch.name}</p>
                                                <p className="text-xs text-zinc-500">{batch.type?.replace("_", " ")}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {metaDirty && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1">
                                ⚠ Click "Save Details" above to save batch assignment changes.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Questions Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                Questions ({questions.length})
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {totalMarks} total marks · Each save is instant
                            </p>
                        </div>
                        <Button
                            onClick={addQuestion}
                            disabled={addingQuestion}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                        >
                            {addingQuestion
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                                : <><Plus className="w-4 h-4 mr-2" /> Add Question</>
                            }
                        </Button>
                    </div>

                    {questions.length === 0 ? (
                        <Card className="border-dashed border-2 border-zinc-300 dark:border-zinc-700">
                            <CardContent className="py-12 text-center">
                                <p className="text-zinc-500 text-sm mb-3">No questions yet.</p>
                                <Button onClick={addQuestion} disabled={addingQuestion} variant="outline" className="border-zinc-300 dark:border-zinc-700">
                                    <Plus className="w-4 h-4 mr-2" /> Add First Question
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {questions.map((q, idx) => (
                                <QuestionEditor
                                    key={q.id}
                                    question={q}
                                    index={idx}
                                    testId={testId}
                                    onUpdate={updateQuestion}
                                    onDelete={deleteQuestion}
                                    onMoveUp={(id) => moveQuestion(id, "up")}
                                    onMoveDown={(id) => moveQuestion(id, "down")}
                                    isFirst={idx === 0}
                                    isLast={idx === questions.length - 1}
                                />
                            ))}
                        </div>
                    )}

                    {questions.length > 0 && (
                        <Button
                            onClick={addQuestion}
                            disabled={addingQuestion}
                            variant="outline"
                            className="w-full border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500"
                        >
                            {addingQuestion
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                                : <><Plus className="w-4 h-4 mr-2" /> Add Another Question</>
                            }
                        </Button>
                    )}
                </div>

                {/* Danger zone */}
                <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Danger Zone</p>
                            <p className="text-xs text-red-600 dark:text-red-400">Archiving removes this test from all batches and the student view.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                            onClick={async () => {
                                if (!confirm("Archive this test? This cannot be undone easily.")) return;
                                await fetch(`/api/admin/tests/${testId}`, { method: "DELETE" });
                                router.push("/admin/tests");
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Archive Test
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminPageWrapper>
    );
}