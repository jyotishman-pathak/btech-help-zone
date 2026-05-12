"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Check, Loader2, X, ChevronLeft } from "lucide-react";

import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Input } from "../../../../components/ui/input";
import { uploadToCloudinary } from "../../../../lib/cloudinary-upload";

interface Subject {
  id: string;
  name: string;
}

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
        console.error("Failed to load subjects:", err);
        setError("Failed to load subjects");
      }
    };
    loadSubjects();
  }, []);



// Replace the upload block in handleSubmit with:
const handleSubmit = async () => {
  if (!form.title || !form.subjectId || !file) {
    setError("Title, subject, and PDF are required.");
    return;
  }
  setError("");
  setUploading(true);

  try {
    // Upload directly from browser to Cloudinary
    const { url } = await uploadToCloudinary(file, {
      folder: "cee/pyq",
      resourceType: "raw",            // PDFs are "raw" resource type
      onProgress: (pct) => setUploadProgress(pct),
    });
    setUploading(false);

    // Save metadata to your DB
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

  const isLoading = uploading || saving;

  const tiers = [
    { value: "NORMAL", label: "Free" },
    { value: "PREMIUM", label: "Premium" },
    { value: "SUPER_PREMIUM", label: "Elite" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              Upload PYQ
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add previous year question paper
            </p>
          </div>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-base">Paper Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Assam CEE Physics 2024 Solved"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
  <Label>Subject *</Label>
  <div className="flex flex-wrap gap-2">
    {subjects.length > 0 ? (
      subjects.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, subjectId: s.id }))}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            form.subjectId === s.id
              ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
              : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-500"
          }`}
        >
          {s.name}
        </button>
      ))
    ) : (
      <p className="text-sm text-zinc-400">Loading subjects...</p>
    )}
  </div>
</div>
            {/* Exam Year */}
            <div className="space-y-1.5">
              <Label>Exam Year</Label>
              <Input
                type="number"
                min="2000"
                max="2030"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="max-w-[160px]"
              />
            </div>

            {/* Access Tier */}
            <div className="space-y-1.5">
              <Label>Access Tier</Label>
              <div className="flex gap-2">
                {tiers.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, requiredTier: t.value })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      form.requiredTier === t.value
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-500"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PDF Upload */}
            <div className="space-y-1.5">
              <Label>PDF File *</Label>
              {file ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 rounded text-zinc-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 p-8 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 transition text-zinc-500 dark:text-zinc-400"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Click to upload PDF</span>
                  <span className="text-xs text-zinc-400">Max 20MB</span>
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
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit */}
          <Button
  onClick={handleSubmit}
  disabled={isLoading}
  className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
>
  {uploading ? (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Uploading... {uploadProgress}%</span>
      </div>

      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
        <div
          className="bg-zinc-900 dark:bg-white h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  ) : saving ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Saving...
    </>
  ) : saved ? (
    <>
      <Check className="w-4 h-4 mr-2" />
      Published!
    </>
  ) : (
    <>
      <Upload className="w-4 h-4 mr-2" />
      Upload PYQ
    </>
  )}
</Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}