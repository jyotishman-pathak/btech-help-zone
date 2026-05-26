"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Plus, Search, Loader2, MoreHorizontal, Trash2, Copy, Check,
    ArrowLeft, Tag, Calendar, Percent,
    ChevronLeft,
    Users,
    X,
    Edit2,
    ToggleRight,
    Save,
    ToggleLeft,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { Badge } from "../../../../components/ui/badge";
import { AdminPageWrapper } from "../../../../components/dashboard/AdminPageWrapper";
import { cn } from "../../../../lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

































interface Coupon {
    id: string;
    code: string;
    discount: number;
    maxUses: number;
    used: number;
    isActive: boolean;
    expiresAt: string | null;
    description: string | null;
    createdAt: string;
    batch: { id: string; name: string } | null;
    _count?: { payments: number };
}

interface Batch { id: string; name: string; }

const EMPTY_FORM = { code: "", discount: "", maxUses: "100", batchId: "", expiresAt: "", description: "" };

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState("");
    const [mutating, setMutating] = useState<string | null>(null);

    // Inline edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ maxUses: "", discount: "", description: "", expiresAt: "" });

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const [c, b] = await Promise.all([
                fetch("/api/admin/coupons").then((r) => r.json()),
                fetch("/api/admin/batches").then((r) => r.json()),
            ]);
            setCoupons(Array.isArray(c) ? c : []);
            setBatches(Array.isArray(b) ? b.filter((b: any) => !b.isFree) : []); // only paid batches make sense
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const createCoupon = async () => {
        setFormError("");
        if (!form.code.trim()) { setFormError("Code is required"); return; }
        if (!form.discount || Number(form.discount) < 1 || Number(form.discount) > 100) {
            setFormError("Discount must be 1–100%"); return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: form.code.trim().toUpperCase(),
                    discount: Number(form.discount),
                    maxUses: Number(form.maxUses) || 100,
                    batchId: form.batchId || null,
                    expiresAt: form.expiresAt || null,
                    description: form.description || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error ?? "Failed to create"); return; }
            setCoupons((prev) => [data, ...prev]);
            setForm(EMPTY_FORM);
            setShowCreate(false);
        } finally { setCreating(false); }
    };

    const toggleActive = async (coupon: Coupon) => {
        setMutating(coupon.id);
        try {
            const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !coupon.isActive }),
            });
            if (res.ok) setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c));
        } finally { setMutating(null); }
    };

    const saveEdit = async (coupon: Coupon) => {
        setMutating(coupon.id);
        try {
            const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    maxUses: Number(editForm.maxUses),
                    discount: Number(editForm.discount),
                    description: editForm.description || null,
                    expiresAt: editForm.expiresAt || null,
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, ...updated } : c));
                setEditingId(null);
            }
        } finally { setMutating(null); }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm("Delete this coupon? This cannot be undone.")) return;
        setMutating(id);
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
            if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
        } finally { setMutating(null); }
    };

    const totalSavings = coupons.reduce((s, c) => s + (c._count?.payments ?? 0), 0);
    const activeCoupons = coupons.filter((c) => c.isActive).length;

    const isExpired = (c: Coupon) => !!c.expiresAt && new Date(c.expiresAt) < new Date();
    const isFull = (c: Coupon) => c.used >= c.maxUses;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button></Link>
                        <div>
                            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Coupons</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{coupons.length} total · {activeCoupons} active</p>
                        </div>
                    </div>
                    <Button onClick={() => { setShowCreate(true); setFormError(""); setForm(EMPTY_FORM); }}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                        <Plus className="w-4 h-4 mr-2" /> Create Coupon
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Coupons", value: coupons.length, icon: Tag, bg: "bg-violet-50 dark:bg-violet-900/20", color: "text-violet-600 dark:text-violet-400" },
                        { label: "Active", value: activeCoupons, icon: Check, bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Times Used", value: totalSavings, icon: Users, bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-600 dark:text-blue-400" },
                        { label: "Expired", value: coupons.filter(isExpired).length, icon: Calendar, bg: "bg-amber-50 dark:bg-amber-900/20", color: "text-amber-600 dark:text-amber-400" },
                    ].map(({ label, value, icon: Icon, bg, color }) => (
                        <Card key={label} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                                    <Icon className={cn("w-5 h-5", color)} />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
                                    <p className="text-xs text-zinc-500">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Coupons Table */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
                    ) : coupons.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                            <Tag className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                            <p className="text-zinc-500 font-medium">No coupons yet</p>
                            <Button onClick={() => setShowCreate(true)} variant="outline" className="border-zinc-200 dark:border-zinc-800">
                                <Plus className="w-4 h-4 mr-2" /> Create your first coupon
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                                        {["Code", "Discount", "Used / Max", "For Batch", "Expires", "Status", "Actions"].map((h) => (
                                            <TableHead key={h} className="text-xs font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coupons.map((coupon) => {
                                        const expired = isExpired(coupon);
                                        const maxedOut = isFull(coupon);
                                        const isEditing = editingId === coupon.id;

                                        return (
                                            <TableRow key={coupon.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">

                                                {/* Code */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <code className="font-mono font-black text-zinc-900 dark:text-zinc-100 text-sm tracking-wider">
                                                            {coupon.code}
                                                        </code>
                                                        <CopyBtn text={coupon.code} />
                                                    </div>
                                                    {coupon.description && (
                                                        <p className="text-xs text-zinc-500 mt-0.5">{coupon.description}</p>
                                                    )}
                                                </TableCell>

                                                {/* Discount */}
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number" min="1" max="100"
                                                            value={editForm.discount}
                                                            onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                                                            className="h-7 w-20 text-sm"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <Percent className="w-3.5 h-3.5 text-violet-500" />
                                                            <span className="font-black text-zinc-900 dark:text-zinc-100">{coupon.discount}%</span>
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Used / Max */}
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number" min={coupon.used}
                                                            value={editForm.maxUses}
                                                            onChange={(e) => setEditForm({ ...editForm, maxUses: e.target.value })}
                                                            className="h-7 w-24 text-sm"
                                                        />
                                                    ) : (
                                                        <div>
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{coupon.used}</span>
                                                                <span className="text-zinc-400">/</span>
                                                                <span className="text-zinc-500">{coupon.maxUses}</span>
                                                            </div>
                                                            <div className="w-20 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1">
                                                                <div
                                                                    className={cn("h-1.5 rounded-full transition-all", maxedOut ? "bg-red-500" : "bg-emerald-500")}
                                                                    style={{ width: `${Math.min((coupon.used / coupon.maxUses) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Batch */}
                                                <TableCell>
                                                    {coupon.batch ? (
                                                        <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs whitespace-nowrap">
                                                            {coupon.batch.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-zinc-400">All batches</span>
                                                    )}
                                                </TableCell>

                                                {/* Expires */}
                                                <TableCell className="whitespace-nowrap">
                                                    {isEditing ? (
                                                        <Input
                                                            type="date"
                                                            value={editForm.expiresAt}
                                                            onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                                                            className="h-7 text-sm"
                                                        />
                                                    ) : coupon.expiresAt ? (
                                                        <div>
                                                            <p className={cn("text-xs font-medium", expired ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400")}>
                                                                {new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                            </p>
                                                            {expired && <p className="text-[10px] text-red-500">Expired</p>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-zinc-400">No expiry</span>
                                                    )}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    {maxedOut ? (
                                                        <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs">Maxed Out</Badge>
                                                    ) : expired ? (
                                                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">Expired</Badge>
                                                    ) : coupon.isActive ? (
                                                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">Active</Badge>
                                                    ) : (
                                                        <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs">Inactive</Badge>
                                                    )}
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <Button size="sm" onClick={() => saveEdit(coupon)} disabled={mutating === coupon.id} className="h-7 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                                                                    {mutating === coupon.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-7 border-zinc-200 dark:border-zinc-800">
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
                                                                    onClick={() => { setEditingId(coupon.id); setEditForm({ maxUses: String(coupon.maxUses), discount: String(coupon.discount), description: coupon.description ?? "", expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "" }); }}
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost" size="icon" className={cn("h-7 w-7", coupon.isActive ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600")}
                                                                    onClick={() => toggleActive(coupon)}
                                                                    disabled={mutating === coupon.id}
                                                                >
                                                                    {coupon.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500"
                                                                    onClick={() => deleteCoupon(coupon.id)}
                                                                    disabled={mutating === coupon.id}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create Coupon Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <Tag className="w-5 h-5" /> Create Coupon
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Coupon Code *</Label>
                                <Input
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="WELCOME20"
                                    className="font-mono font-bold tracking-widest"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Discount (%) *</Label>
                                <Input type="number" min="1" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Max Uses</Label>
                                <Input type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="100" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Expiry Date</Label>
                                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Restrict to Batch</Label>
                            <Select value={form.batchId || "all"} onValueChange={(v) => setForm({ ...form, batchId: v === "all" ? "" : v })}>
                                <SelectTrigger><SelectValue placeholder="All paid batches" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All batches (global)</SelectItem>
                                    {batches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Description (optional)</Label>
                            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Welcome offer for new students" />
                        </div>

                        {/* Preview */}
                        {form.code && form.discount && (
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
                                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Preview</p>
                                <div className="flex items-center gap-3">
                                    <code className="font-mono font-black text-zinc-900 dark:text-zinc-100 text-lg tracking-widest">{form.code || "CODE"}</code>
                                    <Badge className="bg-violet-600 text-white">{form.discount}% OFF</Badge>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {Number(form.maxUses) || 100} uses · {form.batchId ? batches.find((b) => b.id === form.batchId)?.name : "All batches"} · {form.expiresAt ? `Expires ${new Date(form.expiresAt).toLocaleDateString("en-IN")}` : "No expiry"}
                                </p>
                            </div>
                        )}

                        {formError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)} className="border-zinc-200 dark:border-zinc-800">Cancel</Button>
                        <Button onClick={createCoupon} disabled={creating} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                            {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><Check className="w-4 h-4 mr-2" /> Create Coupon</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}