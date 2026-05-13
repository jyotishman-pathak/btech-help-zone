"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Loader2, MoreHorizontal, Edit, Trash2,
  Eye, EyeOff, Users, BookOpen, FileText, ArrowLeft,
} from "lucide-react";
import Link from "next/link";


import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Card } from "../../../../components/ui/card";


interface AdminBatch {
  id: string;
  name: string;
  slug: string;
  type: string;
  isFree: boolean;
  price: number;
  isActive: boolean;
  isPublished: boolean;
  badge?: string | null;
  features: Array<{ text: string }>;
  _count: { enrollments: number; tests: number; notes: number };
}

const TYPE_BADGE: Record<string, string> = {
  CEE_PREP: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  BTECH: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  COMPETITIVE: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  FREE: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
};

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [mutating, setMutating] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      const res = await fetch(`/api/admin/batches?${params}`);
      if (res.ok) setBatches(await res.json());
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const togglePublish = async (id: string, published: boolean) => {
    setMutating(id);
    try {
      await fetch(`/api/admin/batches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !published }),
      });
      setBatches((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isPublished: !published } : b))
      );
    } finally {
      setMutating(null);
    }
  };

  const deleteBatch = async (id: string) => {
    if (!confirm("Delete this batch? This is a soft delete.")) return;
    setMutating(id);
    try {
      await fetch(`/api/admin/batches/${id}`, { method: "DELETE" });
      setBatches((prev) => prev.filter((b) => b.id !== id));
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
                Batch Manager
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {batches.length} batches total
              </p>
            </div>
          </div>
          <Link href="/admin/batches/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
              <Plus className="w-4 h-4 mr-2" /> Create Batch
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="CEE_PREP">CEE Prep</SelectItem>
              <SelectItem value="BTECH">B.Tech</SelectItem>
              <SelectItem value="COMPETITIVE">Competitive</SelectItem>
              <SelectItem value="FREE">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : batches.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-slate-400">No batches found.</p>
              <Link href="/admin/batches/new">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Create your first batch
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/70 dark:border-slate-700/50">
                  <TableHead className="text-slate-500">Batch</TableHead>
                  <TableHead className="text-slate-500">Type</TableHead>
                  <TableHead className="text-slate-500">Price</TableHead>
                  <TableHead className="text-slate-500">Enrolled</TableHead>
                  <TableHead className="text-slate-500">Content</TableHead>
                  <TableHead className="text-slate-500">Status</TableHead>
                  <TableHead className="text-right text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow
                    key={batch.id}
                    className="border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{batch.name}</p>
                        <p className="text-xs text-slate-500">/{batch.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={TYPE_BADGE[batch.type] ?? "bg-slate-100 text-slate-600"} variant="secondary">
                        {batch.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {batch.isFree ? (
                        <span className="text-emerald-600 font-medium">Free</span>
                      ) : (
                        `₹${(batch.price / 100).toLocaleString("en-IN")}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5" /> {batch._count.enrollments}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {batch._count.tests}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {batch._count.notes}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Badge
                          className={
                            batch.isPublished
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }
                          variant="secondary"
                        >
                          {batch.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={mutating === batch.id}>
                            {mutating === batch.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => togglePublish(batch.id, batch.isPublished)}
                            className="cursor-pointer"
                          >
                            {batch.isPublished ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" /> Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteBatch(batch.id)}
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
