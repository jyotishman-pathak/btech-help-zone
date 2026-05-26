"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import Link from "next/link";
import {
    ChevronLeft, TrendingUp, CheckCircle2, XCircle, Clock,
    Copy, Check, Loader2, RefreshCw, Download, ExternalLink,
    Search, ChevronLeft as Prev, ChevronRight as Next,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";

import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";
import { Input } from "../../../../components/ui/input";

type Filter = "all" | "CAPTURED" | "FAILED" | "PENDING";

interface Payment {
    id: string;
    amount: number;
    discountAmount: number | null;
    status: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    createdAt: string;
    metadata: any;
    user: { id: string; name: string | null; email: string; image: string | null };
    batch: { id: string; name: string; slug: string } | null;
    coupon: { code: string; discount: number } | null;
}

interface Stats {
    totalRevenue: number;
    revenueThisMonth: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 transition">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; badge: string }> = {
    CAPTURED: { label: "Success", icon: CheckCircle2, badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
    FAILED: { label: "Failed", icon: XCircle, badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
    PENDING: { label: "Pending", icon: Clock, badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
};

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: filter, page: String(page) });
            const res = await fetch(`/api/admin/payments?${params}`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data.payments);
                setTotal(data.total);
                setStats(data.stats);
            }
        } finally { setLoading(false); }
    }, [filter, page]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);
    useEffect(() => { setPage(1); }, [filter]);

    const exportCSV = () => {
        const rows = [
            ["Date", "User Name", "User Email", "Product", "Gross ₹", "Discount ₹", "Paid ₹", "Coupon", "Status", "Payment ID"],
            ...payments.map((p) => [
                new Date(p.createdAt).toLocaleDateString("en-IN"),
                p.user.name ?? "",
                p.user.email,
                p.batch?.name ?? (p.metadata?.tier ? `Platform ${p.metadata.tier}` : "—"),
                String((p.amount + (p.discountAmount ?? 0)) / 100),
                String((p.discountAmount ?? 0) / 100),
                String(p.amount / 100),
                p.coupon?.code ?? "",
                p.status,
                p.razorpayPaymentId ?? "",
            ]),
        ];
        const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    const searched = search
        ? payments.filter((p) =>
            p.user.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.user.email.toLowerCase().includes(search.toLowerCase()) ||
            p.batch?.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.razorpayPaymentId?.includes(search)
        )
        : payments;

    const limit = 30;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Payments</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} total transactions</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportCSV} disabled={!payments.length} className="border-zinc-200 dark:border-zinc-800">
                            <Download className="w-4 h-4 mr-2" /> CSV
                        </Button>
                        <Button onClick={fetchPayments} disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" /> Refresh</>}
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Revenue", value: `₹${(stats.totalRevenue / 100).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                            { label: "This Month", value: `₹${(stats.revenueThisMonth / 100).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
                            { label: "Successful", value: stats.successCount, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                            { label: "Failed / Pending", value: `${stats.failedCount} / ${stats.pendingCount}`, icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <Card key={label} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                                        <Icon className={cn("w-5 h-5", color)} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Filter + search */}
                <div className="flex flex-wrap items-center gap-3">
                    {(["all", "CAPTURED", "FAILED", "PENDING"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                                filter === f
                                    ? f === "CAPTURED" ? "bg-emerald-600 text-white border-emerald-600"
                                        : f === "FAILED" ? "bg-red-600 text-white border-red-600"
                                            : f === "PENDING" ? "bg-amber-500 text-white border-amber-500"
                                                : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                            )}>
                            {f === "all" ? "All" : f === "CAPTURED" ? "Successful" : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}

                    <div className="relative ml-auto max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input placeholder="Search by name, email, ID..." value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-9" />
                    </div>
                </div>

                {/* Table */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
                    ) : searched.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-zinc-400 dark:text-zinc-600">No payments {filter !== "all" ? `with status "${filter}"` : ""}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                                        {["Date", "Customer", "Product", "Amount", "Coupon", "Status", "Payment ID"].map((h) => (
                                            <TableHead key={h} className="text-xs font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searched.map((payment) => {
                                        const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.PENDING;
                                        const Icon = cfg.icon;
                                        const gross = (payment.amount + (payment.discountAmount ?? 0)) / 100;
                                        const paid = payment.amount / 100;
                                        const productName = payment.batch?.name
                                            ?? (payment.metadata?.tier === "PREMIUM" ? "Platform Premium" : payment.metadata?.tier === "SUPER_PREMIUM" ? "Platform Elite" : "—");

                                        return (
                                            <TableRow key={payment.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">

                                                {/* Date */}
                                                <TableCell className="whitespace-nowrap">
                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                                        {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">
                                                        {new Date(payment.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </TableCell>

                                                {/* Customer */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarImage src={payment.user.image ?? ""} />
                                                            <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-xs font-bold">
                                                                {(payment.user.name ?? "?").slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[130px]">
                                                                {payment.user.name ?? "Unknown"}
                                                            </p>
                                                            <p className="text-xs text-zinc-500 truncate max-w-[130px]">{payment.user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Product */}
                                                <TableCell>
                                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{productName}</p>
                                                    {payment.batch && (
                                                        <Link href={`/batches/${payment.batch.slug}`} target="_blank" className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-0.5">
                                                            View batch <ExternalLink className="w-2.5 h-2.5" />
                                                        </Link>
                                                    )}
                                                </TableCell>

                                                {/* Amount */}
                                                <TableCell className="whitespace-nowrap">
                                                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                                        ₹{paid.toLocaleString("en-IN")}
                                                    </p>
                                                    {payment.discountAmount && payment.discountAmount > 0 && (
                                                        <p className="text-xs text-zinc-400 line-through">
                                                            ₹{gross.toLocaleString("en-IN")}
                                                        </p>
                                                    )}
                                                </TableCell>

                                                {/* Coupon */}
                                                <TableCell>
                                                    {payment.coupon ? (
                                                        <div>
                                                            <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-mono text-xs">
                                                                {payment.coupon.code}
                                                            </Badge>
                                                            <p className="text-xs text-zinc-500 mt-0.5">-{payment.coupon.discount}%</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-400 text-sm">—</span>
                                                    )}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold", cfg.badge)}>
                                                        <Icon className="w-3 h-3" />
                                                        {cfg.label}
                                                    </div>
                                                    {payment.status === "FAILED" && (payment.metadata as any)?.failureReason && (
                                                        <p className="text-[10px] text-red-500 mt-0.5 max-w-[120px] truncate" title={(payment.metadata as any).failureReason}>
                                                            {(payment.metadata as any).failureReason}
                                                        </p>
                                                    )}
                                                </TableCell>

                                                {/* Payment ID */}
                                                <TableCell>
                                                    {payment.razorpayPaymentId ? (
                                                        <div className="flex items-center gap-1">
                                                            <code className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                                                                {payment.razorpayPaymentId.slice(0, 14)}...
                                                            </code>
                                                            <CopyBtn text={payment.razorpayPaymentId} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <code className="text-xs text-zinc-400 font-mono">{payment.razorpayOrderId.slice(0, 14)}...</code>
                                                            <CopyBtn text={payment.razorpayOrderId} />
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {total > limit && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <p className="text-xs text-zinc-500">
                                        {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="border-zinc-200 dark:border-zinc-800">
                                            <Prev className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)} className="border-zinc-200 dark:border-zinc-800">
                                            <Next className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}