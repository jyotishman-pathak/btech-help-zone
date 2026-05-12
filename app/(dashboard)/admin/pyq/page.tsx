// app/(dashboard)/admin/pyq/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Check, Loader2, X, ChevronLeft, Cloud, Sparkles } from "lucide-react";
import Link from "next/link";
import { uploadToCloudinary } from "../../../../lib/cloudinary-upload";

interface Subject {
  id: string;
  name: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "from-blue-500 to-indigo-600",
  Chemistry: "from-violet-500 to-purple-600",
  Mathematics: "from-emerald-500 to-teal-600",
};

export default function AdminPYQPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState({
    title: "",
    subjectId: "",
    year: String(new Date().getFullYear()),
    requiredTier: "NORMAL",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setError("");
        const res = await fetch("/api/admin/subjects");
        if (!res.ok) {
          const err = await res.json();
          setError(`Error ${res.status}: ${err.error ?? "Unknown"}`);
          return;
        }
        const data = await res.json();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load subjects");
      }
    };
    loadSubjects();
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.subjectId || !file) {
      setError("Title, subject, and PDF are required.");
      return;
    }
    setError("");
    setUploading(true);

    try {
      const { url } = await uploadToCloudinary(file, {
        folder: "cee/pyq",
        resourceType: "raw",
        onProgress: (pct) => setUploadProgress(pct),
      });
      setUploading(false);

      setSaving(true);
      const res = await fetch("/api/admin/pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fileUrl: url }),
      });
      setSaving(false);

      if (res.ok) {
        setSaved(true);
        setForm({ title: "", subjectId: "", year: String(new Date().getFullYear()), requiredTier: "NORMAL" });
        setFile(null);
        setUploadProgress(0);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to save PYQ.");
      }
    } catch (err) {
      setError("Upload failed. Check your internet connection.");
      setUploading(false);
      setSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
  };

  const isLoading = uploading || saving;
  const selectedSubject = subjects.find((s) => s.id === form.subjectId);

  const tiers = [
    { value: "NORMAL", label: "Free", desc: "All users" },
    { value: "PREMIUM", label: "Premium", desc: "₹499/mo" },
    { value: "SUPER_PREMIUM", label: "Elite", desc: "₹999/mo" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <button className="w-9 h-9 rounded-xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Upload PYQ</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add a previous year question paper</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-slate-900 dark:text-slate-100">Paper Details</p>
          </div>

          <div className="p-6 space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title <span className="text-red-400">*</span></label>
              <input
                placeholder="e.g., Assam CEE Physics 2024 Solved"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-600 transition font-medium"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {subjects.length > 0 ? (
                  subjects.map((s) => {
                    const isSelected = form.subjectId === s.id;
                    const gradient = SUBJECT_COLORS[s.name] ?? "from-slate-500 to-slate-600";
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, subjectId: s.id }))}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border ${isSelected
                            ? `bg-gradient-to-r ${gradient} text-white border-transparent shadow-md`
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                          }`}
                      >
                        {s.name}
                      </button>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading subjects…
                  </div>
                )}
              </div>
            </div>

            {/* Year + Tier row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Exam Year</label>
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-600 transition font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Access Tier</label>
                <div className="flex gap-2">
                  {tiers.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, requiredTier: t.value })}
                      className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all border ${form.requiredTier === t.value
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">PDF File <span className="text-red-400">*</span></label>
              {file ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/40">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(1)} MB · PDF
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`w-full flex flex-col items-center gap-3 p-10 rounded-2xl border-2 border-dashed transition-all ${dragOver
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                    }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF only · Max 20 MB</p>
                  </div>
                </button>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Uploading to Cloudinary…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><Check className="w-4 h-4" /> Published successfully!</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload PYQ</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}