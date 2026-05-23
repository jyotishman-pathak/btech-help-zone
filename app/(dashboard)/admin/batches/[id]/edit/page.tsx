"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft, Save, Plus, X, Loader2, Check,
    Trash2, Upload, Eye, ToggleLeft, ToggleRight,
    Timer, FileText, Search, Download, GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";
import { DEFAULT_LEAD_FIELDS } from "../../../../../../components/batch/LeadCaptureForm";

import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import { Textarea } from "../../../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import { cn } from "../../../../../../lib/utils";
import { Button } from "../../../../../../components/ui/button";
import { Badge } from "../../../../../../components/ui/badge";
import { uploadToCloudinary } from "../../../../../../lib/cloudinary-upload";
import { AdminPageWrapper } from "../../../../../../components/dashboard/AdminPageWrapper";

function LeadFormTab({ batchId }: { batchId: string }) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usingDefaults, setUsingDefaults] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/batches/${batchId}/lead-form`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.fields?.length) {
          setFields(data.fields);
          setUsingDefaults(false);
        } else {
          // Load default fields as starting point
          setFields(DEFAULT_LEAD_FIELDS.map((f, i) => ({ ...f, order: i })));
          setUsingDefaults(true);
        }
      })
      .finally(() => setLoading(false));
  }, [batchId]);

  const addField = () => {
    setFields([...fields, { id: `new-${Date.now()}`, label: "", fieldType: "text", required: true, placeholder: "", options: [] }]);
  };

  const removeField = (idx: number) => setFields(fields.filter((_, i) => i !== idx));

  const updateField = (idx: number, patch: any) => {
    const next = [...fields];
    next[idx] = { ...next[idx], ...patch };
    setFields(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/lead-form`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Register for Free Access", fields }),
      });
      if (res.ok) {
        setSaved(true);
        setUsingDefaults(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /></div>;

  return (
    <div className="space-y-4">
      {usingDefaults && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
          Showing default fields. Customize and save to use your own.
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, idx) => (
          <Card key={field.id ?? idx} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs">Field Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      placeholder="e.g. Phone Number"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Field Type</Label>
                    <Select value={field.fieldType} onValueChange={(v) => updateField(idx, { fieldType: v })}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                      className="rounded"
                    />
                    Required
                  </label>
                  <button onClick={() => removeField(idx)} className="p-1.5 rounded text-zinc-400 hover:text-red-500 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 ml-6">
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={field.placeholder ?? ""}
                  onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                  placeholder="Hint text shown inside the field"
                  className="text-sm"
                />
              </div>

              {field.fieldType === "select" && (
                <div className="space-y-1 ml-6">
                  <Label className="text-xs">Options (one per line)</Label>
                  <Textarea
                    value={(field.options ?? []).join("\n")}
                    onChange={(e) => updateField(idx, { options: e.target.value.split("\n").filter(Boolean) })}
                    placeholder={"Class 11\nClass 12\n12th Pass 2024"}
                    rows={4}
                    className="text-sm resize-none font-mono"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addField}
        className="w-full border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500"
      >
        <Plus className="w-4 h-4 mr-2" /> Add Field
      </Button>

      <Button
        onClick={save}
        disabled={saving}
        className={cn(
          "w-full",
          saved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
        )}
      >
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          : saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</>
            : <><Save className="w-4 h-4 mr-2" /> Save Lead Form</>}
      </Button>
    </div>
  );
}

function LeadsTab({ batchId }: { batchId: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/leads?batchId=${batchId}`)
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [batchId]);

  const exportCSV = () => {
    if (!leads.length) return;
    // Get all field names from first lead
    const allKeys = Object.keys(leads[0]?.data ?? {});
    const headers = ["Date", "Name", "Email", ...allKeys];
    const rows = leads.map((lead) => [
      new Date(lead.createdAt).toLocaleDateString("en-IN"),
      lead.user?.name ?? "—",
      lead.user?.email ?? "—",
      ...allKeys.map((k) => (lead.data as any)[k] ?? ""),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `leads-${batchId}.csv`;
    a.click();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{leads.length} submissions</p>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!leads.length} className="border-zinc-200 dark:border-zinc-800">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 dark:text-zinc-600">
          No enrollments yet for this batch.
        </div>
      ) : (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Account</th>
                {Object.keys(leads[0]?.data ?? {}).map((key) => (
                  <th key={key} className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{lead.user?.name ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{lead.user?.email ?? "—"}</p>
                  </td>
                  {Object.keys(leads[0]?.data ?? {}).map((key) => (
                    <td key={key} className="px-4 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {(lead.data as any)[key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default function BatchEditPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [batch, setBatch] = useState<any>(null);
    const [allTests, setAllTests] = useState<any[]>([]);
    const [allPYQs, setAllPYQs] = useState<any[]>([]);

    // Form state
    const [form, setForm] = useState<any>({});
    const [features, setFeatures] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [uploading, setUploading] = useState(false);
    const bannerRef = useRef<HTMLInputElement>(null);

    // Content search
    const [testSearch, setTestSearch] = useState("");
    const [pyqSearch, setPyqSearch] = useState("");

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/batches/${batchId}`).then((r) => r.json()),
            fetch("/api/admin/tests").then((r) => r.json()),
            fetch("/api/admin/pyq").then((r) => r.json()),
        ]).then(([batchData, testsData, pyqData]) => {
            setBatch(batchData);
            setForm({
                name: batchData.name,
                slug: batchData.slug,
                tagline: batchData.tagline ?? "",
                description: batchData.description ?? "",
                type: batchData.type,
                isFree: batchData.isFree,
                price: batchData.isFree ? "" : String(batchData.price / 100),
                originalPrice: batchData.originalPrice ? String(batchData.originalPrice / 100) : "",
                badge: batchData.badge ?? "",
                bannerUrl: batchData.bannerUrl ?? "",
                validDays: batchData.validDays ? String(batchData.validDays) : "",
                isActive: batchData.isActive,
                isPublished: batchData.isPublished,
            });
            setFeatures(batchData.features?.map((f: any) => f.text) ?? []);
            setAllTests(Array.isArray(testsData) ? testsData : []);
            setAllPYQs(Array.isArray(pyqData) ? pyqData : []);
        }).finally(() => setLoading(false));
    }, [batchId]);

    const update = (field: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
        setDirty(true);
        setSaved(false);
    };

    const handleBannerUpload = async (file: File) => {
        setUploading(true);
        try {
            const { url } = await uploadToCloudinary(file, { folder: "cee/batches", resourceType: "image" });
            update("bannerUrl", url);
        } catch { alert("Upload failed"); }
        finally { setUploading(false); }
    };

    const saveDetails = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/batches/${batchId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    slug: form.slug,
                    tagline: form.tagline || null,
                    description: form.description || null,
                    type: form.type,
                    isFree: form.isFree,
                    price: form.isFree ? 0 : (parseFloat(form.price || "0") * 100),
                    originalPrice: form.originalPrice ? parseFloat(form.originalPrice) * 100 : null,
                    badge: form.badge || null,
                    bannerUrl: form.bannerUrl || null,
                    validDays: form.validDays ? parseInt(form.validDays) : null,
                    isActive: form.isActive,
                    isPublished: form.isPublished,
                    features: features.filter(Boolean),
                }),
            });
            if (res.ok) {
                setDirty(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally { setSaving(false); }
    };

    // Assign/remove content
    const assignTest = async (testId: string, isAssigned: boolean) => {
        const method = isAssigned ? "DELETE" : "POST";
        await fetch(`/api/admin/batches/${batchId}/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                isAssigned
                    ? { type: "test", id: testId }
                    : { type: "test", ids: [testId] }
            ),
        });
        // For remove, use DELETE
        if (isAssigned) {
            await fetch(`/api/admin/batches/${batchId}/assign`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "test", id: testId }),
            });
        }
        // Refresh batch
        const updated = await fetch(`/api/admin/batches/${batchId}`).then((r) => r.json());
        setBatch(updated);
    };

    const assignPYQ = async (pyqId: string, isAssigned: boolean) => {
        if (isAssigned) {
            await fetch(`/api/admin/batches/${batchId}/assign`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "note", id: pyqId }),
            });
        } else {
            await fetch(`/api/admin/batches/${batchId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "note", ids: [pyqId] }),
            });
        }
        const updated = await fetch(`/api/admin/batches/${batchId}`).then((r) => r.json());
        setBatch(updated);
    };

    if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
    if (!batch) return <div className="text-center py-16 text-zinc-500">Batch not found.</div>;

    const assignedTestIds = new Set(batch.tests?.map((bt: any) => bt.test?.id ?? bt.testId) ?? []);
    const assignedPYQIds = new Set(batch.notes?.map((bn: any) => bn.note?.id ?? bn.noteId) ?? []);

    const filteredTests = allTests.filter((t) => t.title.toLowerCase().includes(testSearch.toLowerCase()));
    const filteredPYQs = allPYQs.filter((p: any) => p.title.toLowerCase().includes(pyqSearch.toLowerCase()));

    return (
        <AdminPageWrapper activeTab="batches" backHref="/admin/batches">
            <div className="max-w-4xl mx-auto space-y-6 pb-16">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="text-xs text-zinc-500 mb-1">Admin › Batches › {batch.name} › Edit</div>
                            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Edit Batch</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/batches/${batch.slug}`} target="_blank">
                            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800">
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            onClick={() => { update("isPublished", !form.isPublished); }}
                            className={cn(form.isPublished ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700", "text-white")}
                        >
                            {form.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="details">
                    <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 h-11">
                        <TabsTrigger value="details" className="text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="tests" className="text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900">
                            Tests ({assignedTestIds.size})
                        </TabsTrigger>
                        <TabsTrigger value="content" className="text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900">
                            PYQs ({assignedPYQIds.size})
                        </TabsTrigger>
                        <TabsTrigger value="lead-form" className="text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900">
                            Lead Form
                        </TabsTrigger>
                        <TabsTrigger value="leads" className="text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900">
                            Leads
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Details Tab ────────────────────────────────────────────────── */}
                    <TabsContent value="details" className="mt-4 space-y-4">
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Batch Info</CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={saveDetails}
                                        disabled={saving || !dirty}
                                        className={cn(
                                            saved && !dirty ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                                        )}
                                    >
                                        {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</>
                                            : saved && !dirty ? <><Check className="w-3.5 h-3.5 mr-1.5" /> Saved</>
                                                : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes</>}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Batch Name *</Label>
                                        <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Slug *</Label>
                                        <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="font-mono text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Tagline</Label>
                                    <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Your path to CEE success" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Description</Label>
                                    <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="resize-none text-sm" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Type</Label>
                                        <Select value={form.type} onValueChange={(v) => update("type", v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CEE_PREP">CEE Prep</SelectItem>
                                                <SelectItem value="BTECH">B.Tech</SelectItem>
                                                <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                                                <SelectItem value="FREE">Free</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Badge</Label>
                                        <Select value={form.badge || "none"} onValueChange={(v) => update("badge", v === "none" ? null : v)}>
                                            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="Most Popular">Most Popular</SelectItem>
                                                <SelectItem value="Bestseller">Bestseller</SelectItem>
                                                <SelectItem value="New">New</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Valid Days</Label>
                                        <Input type="number" value={form.validDays} onChange={(e) => update("validDays", e.target.value)} placeholder="∞ lifetime" />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => update("isFree", !form.isFree)}
                                            className={cn("relative w-10 h-5 rounded-full transition-colors", form.isFree ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700")}
                                        >
                                            <div className={cn("absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", form.isFree ? "translate-x-5" : "")} />
                                        </button>
                                        <Label>Free batch (no payment)</Label>
                                    </div>
                                    {!form.isFree && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Price (₹) *</Label>
                                                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="499" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Original Price (₹)</Label>
                                                <Input type="number" value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} placeholder="999" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Banner */}
                                <div className="space-y-1.5">
                                    <Label>Banner Image</Label>
                                    {form.bannerUrl ? (
                                        <div className="relative">
                                            <img src={form.bannerUrl} alt="Banner" className="w-full h-32 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700" />
                                            <button onClick={() => update("bannerUrl", "")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => bannerRef.current?.click()} disabled={uploading}
                                            className="w-full h-28 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-zinc-400 transition text-sm">
                                            {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : <><Upload className="w-5 h-5" /> Upload banner</>}
                                        </button>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" ref={bannerRef}
                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); }} />
                                </div>

                                {/* Features */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Features</Label>
                                        <Button variant="ghost" size="sm" onClick={() => { setFeatures([...features, ""]); setDirty(true); }}>
                                            <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                        </Button>
                                    </div>
                                    {features.map((f, i) => (
                                        <div key={i} className="flex gap-2">
                                            <Input
                                                value={f}
                                                onChange={(e) => {
                                                    const next = [...features];
                                                    next[i] = e.target.value;
                                                    setFeatures(next);
                                                    setDirty(true);
                                                }}
                                                placeholder={`Feature ${i + 1}`}
                                                className="text-sm"
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => { setFeatures(features.filter((_, j) => j !== i)); setDirty(true); }}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tests Tab ──────────────────────────────────────────────────── */}
                    <TabsContent value="tests" className="mt-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input placeholder="Search tests..." value={testSearch} onChange={(e) => setTestSearch(e.target.value)} className="pl-9" />
                        </div>
                        <div className="space-y-2">
                            {filteredTests.length === 0 ? (
                                <p className="text-center py-8 text-zinc-400 text-sm">
                                    No tests found.{" "}
                                    <Link href="/admin/tests/new" className="underline text-zinc-600 dark:text-zinc-300">Create one.</Link>
                                </p>
                            ) : filteredTests.map((test) => {
                                const isAssigned = assignedTestIds.has(test.id);
                                return (
                                    <div key={test.id} className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                                        isAssigned ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}>
                                        <div className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                                            isAssigned ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100" : "border-zinc-300 dark:border-zinc-700"
                                        )}>
                                            {isAssigned && <Check className="w-3 h-3 text-white dark:text-zinc-900" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">{test.title}</p>
                                            <p className="text-xs text-zinc-500">{test._count?.questions ?? 0} questions · {test.duration}m · {test.totalMarks} marks</p>
                                        </div>
                                        <Badge className={test.isActive ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"}>
                                            {test.isActive ? "Live" : "Draft"}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant={isAssigned ? "outline" : "default"}
                                            onClick={() => assignTest(test.id, isAssigned)}
                                            className={cn("shrink-0", !isAssigned && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900")}
                                        >
                                            {isAssigned ? "Remove" : "Add"}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* ── PYQs Tab ───────────────────────────────────────────────────── */}
                    <TabsContent value="content" className="mt-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input placeholder="Search PYQs..." value={pyqSearch} onChange={(e) => setPyqSearch(e.target.value)} className="pl-9" />
                        </div>
                        <div className="space-y-2">
                            {filteredPYQs.length === 0 ? (
                                <p className="text-center py-8 text-zinc-400 text-sm">
                                    No PYQs found.{" "}
                                    <Link href="/admin/pyq" className="underline text-zinc-600 dark:text-zinc-300">Upload one.</Link>
                                </p>
                            ) : filteredPYQs.map((pyq: any) => {
                                const isAssigned = assignedPYQIds.has(pyq.id);
                                return (
                                    <div key={pyq.id} className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                                        isAssigned ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}>
                                        <div className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                                            isAssigned ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100" : "border-zinc-300 dark:border-zinc-700"
                                        )}>
                                            {isAssigned && <Check className="w-3 h-3 text-white dark:text-zinc-900" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">{pyq.title}</p>
                                            <p className="text-xs text-zinc-500">{pyq.subject?.name ?? pyq.subject} · {pyq.year ?? "—"}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={isAssigned ? "outline" : "default"}
                                            onClick={() => assignPYQ(pyq.id, isAssigned)}
                                            className={cn("shrink-0", !isAssigned && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900")}
                                        >
                                            {isAssigned ? "Remove" : "Add"}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="lead-form" className="mt-4">
                        <LeadFormTab batchId={batchId} />
                    </TabsContent>

                    <TabsContent value="leads" className="mt-4">
                        <LeadsTab batchId={batchId} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminPageWrapper>
    );
}