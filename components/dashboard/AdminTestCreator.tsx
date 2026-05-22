"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Image,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  BookOpen,
  Lightbulb,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "../../lib/cloudinary-upload";


interface QuestionDraft {
  id: string;
  text: string;
  textAs: string;
  imageUrl: string | null;
  uploading?: boolean;
  options: string[];
  optionsAs: string[];
  correctIndex: number;
  section: string;
  marks: number;
  negativeMarks: number;
  expanded: boolean;
  explanation: string;
  explanationImageUrl: string | null;
  explanationUploading?: boolean;
}

const SECTIONS = ["Physics", "Chemistry", "Mathematics", "Biology"];

function makeQuestion(): QuestionDraft {
  return {
    id: Math.random().toString(36).slice(2),
    text: "",
    textAs: "",
    imageUrl: null,
    uploading: false,
    options: ["", "", "", ""],
    optionsAs: ["", "", "", ""],
    correctIndex: 0,
    section: "Physics",
    marks: 4,
    negativeMarks: 1,
    expanded: true,
    explanation: "",
    explanationImageUrl: null,
  };
}

export function AdminTestCreator() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(180);
  const [requiredTier, setRequiredTier] = useState("NORMAL");
  const [examType, setExamType] = useState("FULL_MOCK");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    makeQuestion(),
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [availableBatches, setAvailableBatches] = useState<{ id: string; name: string; type: string }[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const explanationFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/batches")
      .then((r) => r.json())
      .then((data) => setAvailableBatches(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const updateQ = (id: string, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );

  const updateOption = (
    qid: string,
    i: number,
    val: string,
    lang: "en" | "as"
  ) =>
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qid) return q;

        const arr = lang === "en" ? [...q.options] : [...q.optionsAs];
        arr[i] = val;

        return lang === "en"
          ? { ...q, options: arr }
          : { ...q, optionsAs: arr };
      })
    );

  const handleExplanationImage = async (qid: string, file: File) => {
    updateQ(qid, { explanationUploading: true } as any);
    try {
      const { url } = await uploadToCloudinary(file, {
        folder: "cee/questions/explanations",
        resourceType: "image",
      });
      updateQ(qid, { explanationImageUrl: url, explanationUploading: false } as any);
    } catch (err) {
      console.error("Explanation image upload failed:", err);
      setError("Explanation image upload failed.");
      updateQ(qid, { explanationUploading: false } as any);
    }
  };

  const handleImage = async (qid: string, file: File) => {
    updateQ(qid, { uploading: true } as any);
    try {
      const { url } = await uploadToCloudinary(file, {
        folder: "cee/questions",
        resourceType: "image",
      });
      updateQ(qid, { imageUrl: url, uploading: false } as any);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Image upload failed. Check your internet connection.");
      updateQ(qid, { uploading: false } as any);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Test title is required");

    for (const q of questions) {
      if (!q.text.trim())
        return setError(
          `Question ${questions.indexOf(q) + 1} has no text`
        );

      if (q.options.some((o) => !o.trim()))
        return setError(
          `All 4 options required for Q${questions.indexOf(q) + 1}`
        );
    }

    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          duration,
          requiredTier,
          examType,
          batchIds: selectedBatchIds,
          questions: questions.map(
            ({ id, expanded, uploading, explanationUploading, ...q }) => q
          ),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setSaved(true);

      setTimeout(() => {
        router.push("/admin");
      }, 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Test Meta */}
      <Card className="border-slate-200/70 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg">Test Details</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <Label>Test Title *</Label>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="CEE Full Syllabus Mock #13"
            />
          </div>

          <div className="space-y-1">
            <Label>Duration (minutes)</Label>

            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Access Tier</Label>

            <Select
              value={requiredTier}
              onValueChange={setRequiredTier}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="NORMAL">
                  Free (1st test)
                </SelectItem>

                <SelectItem value="PREMIUM">
                  Premium
                </SelectItem>

                <SelectItem value="SUPER_PREMIUM">
                  Super Premium
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Exam Type</Label>

            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="FULL_MOCK">
                  Full Mock
                </SelectItem>

                <SelectItem value="TOPIC_WISE">
                  Topic Wise
                </SelectItem>

                <SelectItem value="YEAR_WISE">
                  Year Wise
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <Card
            key={q.id}
            className="border-slate-200/70 dark:border-slate-700/50"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() =>
                updateQ(q.id, {
                  expanded: !q.expanded,
                })
              }
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {idx + 1}
                </Badge>

                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  {q.section}
                </Badge>

                <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                  {q.text || "New question"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setQuestions((qs) =>
                      qs.filter((x) => x.id !== q.id)
                    );
                  }}
                  className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {q.expanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {q.expanded && (
              <CardContent className="pt-0 space-y-4">
                {/* Section */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Section</Label>

                    <Select
                      value={q.section}
                      onValueChange={(v) =>
                        updateQ(q.id, { section: v })
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {SECTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Marks (+)</Label>

                    <Input
                      type="number"
                      value={q.marks}
                      onChange={(e) =>
                        updateQ(q.id, {
                          marks: +e.target.value,
                        })
                      }
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Negative (-)</Label>

                    <Input
                      type="number"
                      value={q.negativeMarks}
                      onChange={(e) =>
                        updateQ(q.id, {
                          negativeMarks: +e.target.value,
                        })
                      }
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Question (English) *
                    </Label>

                    <Textarea
                      value={q.text}
                      onChange={(e) =>
                        updateQ(q.id, {
                          text: e.target.value,
                        })
                      }
                      placeholder="Type question in English..."
                      className="resize-none text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">
                      Question (Assamese)
                    </Label>

                    <Textarea
                      value={q.textAs}
                      onChange={(e) =>
                        updateQ(q.id, {
                          textAs: e.target.value,
                        })
                      }
                      placeholder="অসমীয়াত প্ৰশ্ন লিখক..."
                      className="resize-none text-sm"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    Question Image (optional)
                  </Label>

                  {q.imageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={q.imageUrl}
                        alt="Question"
                        className="h-32 rounded-lg border border-slate-200/70 dark:border-slate-700/50 object-contain bg-slate-50 dark:bg-slate-800"
                      />

                      <button
                        onClick={() =>
                          updateQ(q.id, {
                            imageUrl: null,
                          })
                        }
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : q.uploading ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading to Cloudinary...
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        fileRefs.current[q.id]?.click()
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-sm hover:border-slate-400 transition"
                    >
                      <Image className="w-4 h-4" />
                      Upload image
                    </button>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => {
                      fileRefs.current[q.id] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) handleImage(q.id, file);
                    }}
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <Label className="text-xs">
                    Options — click circle to mark correct
                  </Label>

                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={() =>
                          updateQ(q.id, {
                            correctIndex: i,
                          })
                        }
                        className={cn(
                          "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs transition",
                          q.correctIndex === i
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-700 text-slate-500"
                        )}
                      >
                        {q.correctIndex === i ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          "ABCD"[i]
                        )}
                      </button>

                      <Input
                        value={opt}
                        onChange={(e) =>
                          updateOption(
                            q.id,
                            i,
                            e.target.value,
                            "en"
                          )
                        }
                        placeholder={`Option ${
                          ["A", "B", "C", "D"][i]
                        } (English)`}
                        className="flex-1 h-9 text-sm"
                      />

                      <Input
                        value={q.optionsAs[i]}
                        onChange={(e) =>
                          updateOption(
                            q.id,
                            i,
                            e.target.value,
                            "as"
                          )
                        }
                        placeholder={`বিকল্প ${
                          ["ক", "খ", "গ", "ঘ"][i]
                        }`}
                        className="flex-1 h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation Section */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3 bg-blue-50/50 dark:bg-blue-900/10 mt-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <Label className="text-xs text-blue-700 dark:text-blue-400 font-bold">
                      Solution Explanation (shown to students after submission)
                    </Label>
                  </div>

                  <Textarea
                    value={q.explanation}
                    onChange={(e) => updateQ(q.id, { explanation: e.target.value })}
                    placeholder="Explain the correct answer, steps, formula used, key concept..."
                    rows={4}
                    className="text-sm resize-none border-blue-200 dark:border-blue-800 focus:border-blue-400 bg-white dark:bg-slate-900"
                  />

                  <div className="space-y-1.5">
                    <Label className="text-xs text-blue-600 dark:text-blue-400">Explanation Image (diagram, graph, etc.)</Label>
                    {q.explanationImageUrl ? (
                      <div className="flex items-start gap-3">
                        <img
                          src={q.explanationImageUrl}
                          alt="Explanation"
                          className="h-28 rounded-lg border border-blue-200 dark:border-blue-700 object-contain bg-white dark:bg-slate-800"
                        />
                        <button
                          onClick={() => updateQ(q.id, { explanationImageUrl: null })}
                          className="p-1.5 rounded bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => explanationFileRefs.current[q.id]?.click()}
                        disabled={q.explanationUploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-500 text-sm hover:border-blue-400 transition bg-white dark:bg-slate-900"
                      >
                        {q.explanationUploading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                          : <><Image className="w-4 h-4" /> Upload explanation image</>
                        }
                      </button>
                    )}
                    <input
                      ref={(el) => { explanationFileRefs.current[q.id] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExplanationImage(q.id, f); }}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={() =>
            setQuestions((qs) => [...qs, makeQuestion()])
          }
          className="w-full border-dashed border-slate-300 dark:border-slate-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Batch Assignment */}
      <Card className="border-slate-200/70 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg">Assign to Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {availableBatches.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No batches available
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableBatches.map((batch) => {
                const isSelected = selectedBatchIds.includes(batch.id);
                return (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => {
                      setSelectedBatchIds((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== batch.id)
                          : [...prev, batch.id]
                      );
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border transition",
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    {batch.name}
                    <span className="ml-1.5 text-xs opacity-70">
                      ({batch.type})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {selectedBatchIds.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              {selectedBatchIds.length} batch{selectedBatchIds.length > 1 ? "es" : ""} selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

{/* Batch Assignment */}
<Card className="border-zinc-200 dark:border-zinc-800">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-base flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-zinc-500" />
        Assign to Batches
      </CardTitle>
      <span className="text-xs text-zinc-500">
        {selectedBatchIds.length} selected
      </span>
    </div>
    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
      Students enrolled in selected batches will see this test.
    </p>
  </CardHeader>
  <CardContent>
    {availableBatches.length === 0 ? (
      <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">
        No batches created yet.{" "}
        <a href="/admin/batches/new" className="underline text-zinc-600 dark:text-zinc-300">
          Create one first.
        </a>
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {availableBatches.map((batch) => {
          const isSelected = selectedBatchIds.includes(batch.id);
          return (
            <button
              key={batch.id}
              type="button"
              onClick={() =>
                setSelectedBatchIds((prev) =>
                  isSelected ? prev.filter((id) => id !== batch.id) : [...prev, batch.id]
                )
              }
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
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {batch.name}
                </p>
                <p className="text-xs text-zinc-500">{batch.type.replace("_", " ")}</p>
              </div>
            </button>
          );
        })}
      </div>
    )}
  </CardContent>
</Card>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Test Published!
          </>
        ) : (
          `Publish Test · ${questions.length} Questions`
        )}
      </Button>
    </div>
  );
}