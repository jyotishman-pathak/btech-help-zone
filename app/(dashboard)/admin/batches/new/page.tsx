"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Plus, X, Sparkles } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Label } from "../../../../../components/ui/label";


export default function NewBatchPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    type: "CEE_PREP",
    isFree: false,
    price: "",
    originalPrice: "",
    badge: "",
    bannerUrl: "",
    validDays: "",
    isActive: true,
  });
  const [features, setFeatures] = useState<string[]>([""]);

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      setError("Name and slug are required");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: form.isFree ? 0 : parseInt(form.price || "0") * 100, // convert to paise
          originalPrice: form.originalPrice
            ? parseInt(form.originalPrice) * 100
            : null,
          validDays: form.validDays ? parseInt(form.validDays) : null,
          features: features.filter((f) => f.trim()),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create batch");
        return;
      }

      router.push("/admin/batches");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/batches" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Create New Batch
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Set up a new learning program
            </p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
            <CardHeader>
              <CardTitle className="text-base">Batch Details</CardTitle>
              <CardDescription>Fill in the batch information below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch Name *</Label>
                  <Input
                    placeholder="e.g., Sarathi CEE Batch"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    placeholder="sarathi-cee-batch"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  placeholder="One-line description"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  placeholder="Detailed description of what this batch covers..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-y"
                />
              </div>

              {/* Type & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEE_PREP">CEE Prep</SelectItem>
                      <SelectItem value="BTECH">B.Tech</SelectItem>
                      <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                      <SelectItem value="FREE">Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input
                    placeholder="e.g., Most Popular, New"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isFree}
                      onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                      className="rounded"
                    />
                    This is a free batch
                  </label>
                </div>
                {!form.isFree && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="499"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Original Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="999"
                        value={form.originalPrice}
                        onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Validity (Days)</Label>
                      <Input
                        type="number"
                        placeholder="365 (blank = lifetime)"
                        value={form.validDays}
                        onChange={(e) => setForm({ ...form, validDays: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Banner URL */}
              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <Input
                  placeholder="https://res.cloudinary.com/..."
                  value={form.bannerUrl}
                  onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                />
              </div>

              {/* Features */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Features
                </Label>
                {features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Feature ${i + 1}`}
                      value={f}
                      onChange={(e) => {
                        const updated = [...features];
                        updated[i] = e.target.value;
                        setFeatures(updated);
                      }}
                    />
                    {features.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeatures([...features, ""])}
                  className="border-dashed"
                >
                  <Plus className="w-3 h-3 mr-1.5" /> Add Feature
                </Button>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-700/50">
                <Link href="/admin/batches">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Batch"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
