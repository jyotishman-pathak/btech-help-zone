"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Timer, Search, Download, Eye, RefreshCw, Loader2, Trophy, Clock, User, CheckCircle, XCircle
} from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { AdminPageWrapper } from "../../../../components/dashboard/AdminPageWrapper";

export default function AdminAttemptsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTest, setSelectedTest] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchAttempts = async (currentPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        testId: selectedTest,
        search: search,
        limit: "20",
      });
      const res = await fetch(`/api/admin/attempts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
        setTests(data.tests || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts(page);
  }, [page, selectedTest]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAttempts(1);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        testId: selectedTest,
        search: search,
        export: "true",
      });
      const res = await fetch(`/api/admin/attempts?${params}`);
      if (res.ok) {
        const data = await res.json();
        const exportAttempts = data.attempts || [];

        const headers = ["Student Name", "Student Email", "Mock Test", "Score", "Max Marks", "Percentage (%)", "Status", "Started At", "Completed At"];
        const rows = exportAttempts.map((a: any) => [
          a.user?.name ?? "Anonymous",
          a.user?.email ?? "",
          a.test?.title ?? "Unknown Test",
          a.score,
          a.test?.totalMarks ?? 0,
          a.percentage.toFixed(2),
          a.status,
          new Date(a.startedAt).toLocaleString("en-IN"),
          a.completedAt ? new Date(a.completedAt).toLocaleString("en-IN") : "N/A"
        ]);

        const csv = [headers, ...rows]
          .map((r: any[]) => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(","))
          .join("\n");

        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `mock-attempts-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error("Failed to export attempts:", error);
    } finally {
      setExporting(false);
    }
  };

  // Compute quick stats
  const completedAttemptsCount = attempts.filter((a) => a.status === "SUBMITTED").length;
  const avgPercentage = attempts.length
    ? attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length
    : 0;

  return (
    <AdminPageWrapper activeTab="attempts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Mock Test Attempts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track student mock test submissions, scores, and completion statuses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchAttempts(page)}
              disabled={loading}
              className="border-slate-200/70 dark:border-slate-700/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={exporting || attempts.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Attempts</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{total.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                <Trophy className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submitted Tests</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  {attempts.filter((a) => a.status === "SUBMITTED").length} <span className="text-sm font-normal text-slate-400">on this page</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Percentage</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  {avgPercentage.toFixed(1)}% <span className="text-sm font-normal text-slate-400">on this page</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-[#12101F] p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200/70 dark:border-slate-700/50 w-full"
            />
          </form>

          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <Select value={selectedTest} onValueChange={(val) => { setSelectedTest(val); setPage(1); }}>
              <SelectTrigger className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-slate-200/70 dark:border-slate-700/50">
                <SelectValue placeholder="All Mock Tests" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50">
                <SelectItem value="all">All Mock Tests</SelectItem>
                {tests.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Attempts Table */}
        <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 dark:text-slate-500 font-medium">No attempts recorded.</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200/70 dark:border-slate-700/50">
                    <TableHead className="text-slate-500">Student</TableHead>
                    <TableHead className="text-slate-500">Mock Test</TableHead>
                    <TableHead className="text-slate-500">Score</TableHead>
                    <TableHead className="text-slate-500">Percentage</TableHead>
                    <TableHead className="text-slate-500">Status</TableHead>
                    <TableHead className="text-slate-500">Started At</TableHead>
                    <TableHead className="text-slate-500">Completed At</TableHead>
                    <TableHead className="text-right text-slate-500">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id} className="border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={attempt.user?.image ?? ""} />
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                              {(attempt.user?.name ?? "??").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{attempt.user?.name ?? "Anonymous"}</p>
                            <p className="text-xs text-slate-500">{attempt.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{attempt.test?.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {attempt.score}
                        </span>
                        <span className="text-xs text-slate-400">/{attempt.test?.totalMarks}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {attempt.percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          attempt.status === "SUBMITTED"
                            ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-none"
                            : "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-none"
                        }>
                          {attempt.status === "SUBMITTED" ? "Submitted" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(attempt.startedAt).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString("en-IN") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {attempt.status === "SUBMITTED" ? (
                          <Link href={`/cee/mock/${attempt.testId}/result/${attempt.id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} attempts
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="border-slate-200/70 dark:border-slate-700/50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-slate-200/70 dark:border-slate-700/50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
}
