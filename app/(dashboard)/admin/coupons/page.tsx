"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Loader2, MoreHorizontal, Trash2, Copy, Check,
  ArrowLeft, Tag, Calendar, Percent,
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

interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount: number;
  maxUses: number;
  used: number;
  expiresAt?: string | null;
  isActive: boolean;
  batchId?: string | null;
  batch?: { name: string } | null;
  createdAt: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    maxUses: "100",
    expiresAt: "",
    description: "",
    batchId: "",
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        const created = await res.json();
        setCoupons((prev) => [created, ...prev]);
        setIsCreateOpen(false);
        setNewCoupon({ code: "", discount: "", maxUses: "100", expiresAt: "", description: "", batchId: "" });
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    setMutating(id);
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)));
    } finally {
      setMutating(null);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon permanently?")) return;
    setMutating(id);
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setMutating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                Coupon Manager
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {coupons.length} coupons created
              </p>
            </div>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                <Plus className="w-4 h-4 mr-2" /> Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
                <DialogDescription>Create a discount code for students.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      placeholder="WELCOME50"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (%) *</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      min="1"
                      max="100"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Uses</Label>
                    <Input
                      type="number"
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expires At</Label>
                    <Input
                      type="date"
                      value={newCoupon.expiresAt}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Welcome discount for new users"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button
                  onClick={createCoupon}
                  disabled={saving || !newCoupon.code || !newCoupon.discount}
                  className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No coupons yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/70 dark:border-slate-700/50">
                  <TableHead className="text-slate-500">Code</TableHead>
                  <TableHead className="text-slate-500">Discount</TableHead>
                  <TableHead className="text-slate-500">Usage</TableHead>
                  <TableHead className="text-slate-500">Batch</TableHead>
                  <TableHead className="text-slate-500">Expires</TableHead>
                  <TableHead className="text-slate-500">Status</TableHead>
                  <TableHead className="text-right text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow
                    key={coupon.id}
                    className="border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                          {coupon.code}
                        </code>
                        <CopyButton text={coupon.code} />
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{coupon.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" variant="secondary">
                        <Percent className="w-3 h-3 mr-1" /> {coupon.discount}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {coupon.used} / {coupon.maxUses}
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300 text-sm">
                      {coupon.batch?.name ?? "All batches"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          coupon.isActive
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }
                        variant="secondary"
                      >
                        {coupon.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={mutating === coupon.id}>
                            {mutating === coupon.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => toggleActive(coupon.id, coupon.isActive)}
                            className="cursor-pointer"
                          >
                            {coupon.isActive ? "Disable" : "Enable"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteCoupon(coupon.id)}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
