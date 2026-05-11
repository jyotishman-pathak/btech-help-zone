"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Image, X, ChevronDown, ChevronUp, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../../@/components/ui/label";
import { Input } from "../../@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { Textarea } from "../../@/components/ui/textarea";
import { Button } from "../../@/components/ui/button";
import { useRouter } from "next/navigation";

interface QuestionDraft {
  id: string;
  text: string;
  textAs: string;
  imageUrl: string | null;
  options: string[];
  optionsAs: string[];
  correctIndex: number;
  section: string;
  marks: number;
  negativeMarks: number;
  expanded: boolean;
}

const SECTIONS = ["Physics", "Chemistry", "Mathematics", "Biology"];

function makeQuestion(): QuestionDraft {
  return {
    id: Math.random().toString(36).slice(2),
    text: "",
    textAs: "",
    imageUrl: null,
    options: ["", "", "", ""],
    optionsAs: ["", "", "", ""],
    correctIndex: 0,
    section: "Physics",
    marks: 4,
    negativeMarks: 1,
    expanded: true,
  };
}

export function AdminTestCreator() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(180);
  const [requiredTier, setRequiredTier] = useState("NORMAL");
  const [examType, setExamType] = useState("FULL_MOCK");
  const [questions, setQuestions] = useState<QuestionDraft[]>([makeQuestion()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const router = useRouter();
  const updateQ = (id: string, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const updateOption = (qid: string, i: number, val: string, lang: "en" | "as") =>
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qid) return q;
        const arr = lang === "en" ? [...q.options] : [...q.optionsAs];
        arr[i] = val;
        return lang === "en" ? { ...q, options: arr } : { ...q, optionsAs: arr };
      })
    );

  const handleImage = (qid: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => updateQ(qid, { imageUrl: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Test title is required");
    for (const q of questions) {
      if (!q.text.trim()) return setError(`Question ${questions.indexOf(q) + 1} has no text`);
      if (q.options.some((o) => !o.trim()))
        return setError(`All 4 options required for Q${questions.indexOf(q) + 1}`);
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          duration,
          requiredTier,
          examType,
          questions: questions.map(({ id, expanded, ...q }) => q),
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
      <Card className="border-zinc-200 dark:border-zinc-800">
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
            <Select value={requiredTier} onValueChange={setRequiredTier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Free (1st test)</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="SUPER_PREMIUM">Super Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Exam Type</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_MOCK">Full Mock</SelectItem>
                <SelectItem value="TOPIC_WISE">Topic Wise</SelectItem>
                <SelectItem value="YEAR_WISE">Year Wise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <Card key={q.id} className="border-zinc-200 dark:border-zinc-800">
            {/* Question header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => updateQ(q.id, { expanded: !q.expanded })}
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
                  {q.section}
                </Badge>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-xs">
                  {q.text || "New question"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuestions((qs) => qs.filter((x) => x.id !== q.id));
                  }}
                  className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {q.expanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </div>
            </div>

            {q.expanded && (
              <CardContent className="pt-0 space-y-4">
                {/* Section + marks row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Section</Label>
                    <Select value={q.section} onValueChange={(v) => updateQ(q.id, { section: v })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Marks (+)</Label>
                    <Input
                      type="number"
                      value={q.marks}
                      onChange={(e) => updateQ(q.id, { marks: +e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Negative (-)</Label>
                    <Input
                      type="number"
                      value={q.negativeMarks}
                      onChange={(e) => updateQ(q.id, { negativeMarks: +e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Question text (EN + AS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Question (English) *</Label>
                    <Textarea
                      value={q.text}
                      onChange={(e) => updateQ(q.id, { text: e.target.value })}
                      placeholder="Type question in English..."
                      className="resize-none text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Question (Assamese)</Label>
                    <Textarea
                      value={q.textAs}
                      onChange={(e) => updateQ(q.id, { textAs: e.target.value })}
                      placeholder="অসমীয়াত প্ৰশ্ন লিখক..."
                      className="resize-none text-sm"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Image upload */}
                <div className="space-y-1">
                  <Label className="text-xs">Question Image (optional)</Label>
                  {q.imageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={q.imageUrl}
                        alt="Question"
                        className="h-32 rounded-lg border border-zinc-200 dark:border-zinc-700 object-contain bg-zinc-50 dark:bg-zinc-800"
                      />
                      <button
                        onClick={() => updateQ(q.id, { imageUrl: null })}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRefs.current[q.id]?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 text-sm hover:border-zinc-400 transition"
                    >
                      <Image className="w-4 h-4" /> Upload image
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileRefs.current[q.id] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImage(q.id, file);
                    }}
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <Label className="text-xs">Options — click circle to mark correct</Label>
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        onClick={() => updateQ(q.id, { correctIndex: i })}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs transition",
                          q.correctIndex === i
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-zinc-300 dark:border-zinc-700 text-zinc-500"
                        )}
                      >
                        {q.correctIndex === i ? <Check className="w-3 h-3" /> : "ABCD"[i]}
                      </button>
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(q.id, i, e.target.value, "en")}
                        placeholder={`Option ${["A","B","C","D"][i]} (English)`}
                        className="flex-1 h-9 text-sm"
                      />
                      <Input
                        value={q.optionsAs[i]}
                        onChange={(e) => updateOption(q.id, i, e.target.value, "as")}
                        placeholder={`বিকল্প ${["ক","খ","গ","ঘ"][i]}`}
                        className="flex-1 h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={() => setQuestions((qs) => [...qs, makeQuestion()])}
          className="w-full border-dashed border-zinc-300 dark:border-zinc-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
      </div>

      {/* Error + Submit */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}
      <Button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full h-12 text-base bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
        ) : saved ? (
          <><Check className="w-4 h-4 mr-2" /> Test Published!</>
        ) : (
          `Publish Test · ${questions.length} Questions`
        )}
      </Button>
    </div>
  );
}