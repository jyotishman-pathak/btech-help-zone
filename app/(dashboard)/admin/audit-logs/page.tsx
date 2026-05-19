"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Shield, ChevronLeft, ChevronRight,
  Clock, User, Activity,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "../../../../components/ui/card";

import { Badge } from "../../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { AdminPageWrapper } from "../../../../components/dashboard/AdminPageWrapper";

interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
  actor: { name: string | null; email: string };
}

const ACTION_COLOR: Record<string, string> = {
  CREATED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  UPDATED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  DELETED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  ROLE_CHANGED: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  SUSPENDED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("ALL");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (entityFilter !== "ALL") params.set("entity", entityFilter);
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setPages(data.pages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const relDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString();
  };

    return (
        <AdminPageWrapper activeTab="audit-logs">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                                Audit Logs
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {total.toLocaleString()} events tracked
                            </p>
                        </div>
                    </div>

                    <Select
                        value={entityFilter}
                        onValueChange={(v) => {
                            setEntityFilter(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-40 bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50">
                            <SelectValue placeholder="Filter entity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Entities</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="Batch">Batch</SelectItem>
                            <SelectItem value="Payment">Payment</SelectItem>
                            <SelectItem value="Coupon">Coupon</SelectItem>
                            <SelectItem value="MockTest">Mock Test</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Logs */}
                <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p>No audit logs yet.</p>
                            <p className="text-sm mt-1">Actions will appear here as admins make changes.</p>
                        </div>
                    ) : (
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logs.map((log, i) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition"
                                    >
                                        <div className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                                            <Activity className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    className={
                                                        ACTION_COLOR[log.action] ??
                                                        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                    }
                                                    variant="secondary"
                                                >
                                                    {log.action}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.entity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                                                <span className="font-medium">{log.actor?.name ?? log.actor?.email}</span>{" "}
                                                performed <span className="font-mono text-xs">{log.action}</span> on{" "}
                                                <span className="font-mono text-xs">{log.entity}#{log.entityId.slice(0, 8)}</span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {relDate(log.createdAt)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {log.actor?.email}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Page {page} of {pages} · {total} total events
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="border-slate-200/70 dark:border-slate-700/50"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= pages}
                                onClick={() => setPage((p) => p + 1)}
                                className="border-slate-200/70 dark:border-slate-700/50"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminPageWrapper>
    );
}
