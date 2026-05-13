// app/(dashboard)/admin/pyq/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Check, Loader2, X, ChevronLeft, Cloud, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { uploadToCloudinary } from "../../../../lib/cloudinary-upload";

import { Select, SelectContent, SelectItem,  SelectTrigger, SelectValue } from "../../../../components/ui/select";
import {  Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../../components/ui/button";
interface Subject { id: string; name: string; }
interface Batch { id: string; name: string; type: string; }

export default function AdminPYQPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({
    title: "", subjectId: "", year: String(new Date().getFullYear()), requiredTier: "NORMAL",
  });
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/subjects").then((r) => r.json()),
      fetch("/api/admin/batches").then((r) => r.json()),
    ]).then(([s, b]) => {
      setSubjects(Array.isArray(s) ? s : []);
      setBatches(Array.isArray(b) ? b : []);
    });
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
        onProgress: setUploadProgress,
      });
      setUploading(false);
      setSaving(true);

      const res = await fetch("/api/admin/pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fileUrl: url, batchIds: selectedBatchIds }),
      });
      setSaving(false);

      if (res.ok) {
        setSaved(true);
        setForm({ title: "", subjectId: "", year: String(new Date().getFullYear()), requiredTier: "NORMAL" });
        setFile(null);
        setSelectedBatchIds([]);
        setUploadProgress(0);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to save PYQ.");
      }
    } catch {
      setError("Upload failed. Check your internet connection.");
      setUploading(false);
      setSaving(false);
    }
  };

  const isLoading = uploading || saving;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Upload PYQ</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Add previous year question paper</p>
          </div>
        </div>

        {/* Paper Details */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader><CardTitle className="text-base">Paper Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Assam CEE Physics 2024 Solved" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Exam Year</Label>
                <Input type="number" min="2000" max="2030" value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Access Tier</Label>
              <Select value={form.requiredTier} onValueChange={(v) => setForm({ ...form, requiredTier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Free for all</SelectItem>
                  <SelectItem value="PREMIUM">Premium required</SelectItem>
                  <SelectItem value="SUPER_PREMIUM">Elite required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PDF Upload */}
            <div className="space-y-1.5">
              <Label>PDF File *</Label>
              {file ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="p-1 rounded text-zinc-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 p-8 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 transition text-zinc-500">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Click to upload PDF</span>
                  <span className="text-xs text-zinc-400">Max 20MB</span>
                </button>
              )}
              <input type="file" accept="application/pdf" className="hidden" ref={fileRef}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
            </div>
          </CardContent>
        </Card>

        {/* Batch Assignment */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-500" /> Assign to Batches
              </CardTitle>
              {selectedBatchIds.length > 0 && (
                <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {selectedBatchIds.length} selected
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
              Students enrolled in selected batches can access this PYQ.
            </p>
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
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                        isSelected
                          ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100"
                          : "border-zinc-300 dark:border-zinc-700"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white dark:text-zinc-900" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{batch.name}</p>
                        <p className="text-xs text-zinc-500">{batch.type.replace("_", " ")}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
          {uploading ? (
            <div className="w-full space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading... {uploadProgress}%
              </div>
            </div>
          ) : saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="w-4 h-4 mr-2" /> Published!</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Upload PYQ</>
          )}
        </Button>
      </div>
    </div>
  );
}