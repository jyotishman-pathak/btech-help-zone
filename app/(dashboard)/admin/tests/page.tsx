"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus, Edit, Trash2, MoreHorizontal, Loader2,
    Eye, Copy, Check, ToggleLeft, ToggleRight, Search,
} from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { AdminPageWrapper } from "../../../../components/dashboard/AdminPageWrapper";

export default function AdminTestsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [mutating, setMutating] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/tests")
            .then((r) => r.json())
            .then((data) => setTests(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        setMutating(id);
        await fetch(`/api/admin/tests/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !isActive }),
        });
        setTests((prev) => prev.map((t) => t.id === id ? { ...t, isActive: !isActive } : t));
        setMutating(null);
    };

    const deleteTest = async (id: string) => {
        if (!confirm("Archive this test? Students who attempted it keep their results.")) return;
        setMutating(id);
        await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
        setTests((prev) => prev.filter((t) => t.id !== id));
        setMutating(null);
    };

    const filtered = tests.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminPageWrapper activeTab="tests">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Mock Tests</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {tests.length} test{tests.length !== 1 ? "s" : ""} · {tests.filter((t) => t.isActive).length} active
                        </p>
                    </div>
                    <Link href="/admin/tests/new">
                        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
                            <Plus className="w-4 h-4 mr-2" /> New Test
                        </Button>
                    </Link>
                </div>

                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="Search tests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-zinc-400">No tests yet.</p>
                            <Link href="/admin/tests/new">
                                <Button variant="outline" className="mt-4 border-zinc-200 dark:border-zinc-800">
                                    <Plus className="w-4 h-4 mr-2" /> Create your first test
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-200 dark:border-zinc-800">
                                    <TableHead className="text-zinc-500">Title</TableHead>
                                    <TableHead className="text-zinc-500">Access Code</TableHead>
                                    <TableHead className="text-zinc-500">Questions</TableHead>
                                    <TableHead className="text-zinc-500">Marks</TableHead>
                                    <TableHead className="text-zinc-500">Duration</TableHead>
                                    <TableHead className="text-zinc-500">Attempts</TableHead>
                                    <TableHead className="text-zinc-500">Status</TableHead>
                                    <TableHead className="text-right text-zinc-500">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((test) => (
                                    <TableRow key={test.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
                                                    {test.title}
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-0.5">{test.examType?.replace("_", " ")}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                                                {test.accessCode}
                                                <button
                                                    onClick={() => copyCode(test.accessCode, test.id)}
                                                    className="text-zinc-400 hover:text-zinc-600 transition"
                                                >
                                                    {copiedId === test.id
                                                        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                        : <Copy className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-700 dark:text-zinc-300">
                                            {test._count?.questions ?? 0}
                                        </TableCell>
                                        <TableCell className="text-zinc-700 dark:text-zinc-300">
                                            {test.totalMarks}
                                        </TableCell>
                                        <TableCell className="text-zinc-700 dark:text-zinc-300">
                                            {test.duration}m
                                        </TableCell>
                                        <TableCell className="text-zinc-700 dark:text-zinc-300">
                                            {test._count?.attempts ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={test.isActive
                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                            }>
                                                {test.isActive ? "Live" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={mutating === test.id}>
                                                        {mutating === test.id
                                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                                            : <MoreHorizontal className="w-4 h-4" />
                                                        }
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Link href={`/admin/tests/${test.id}/edit`}>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit Test
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Link href={`/cee/mock/${test.id}`} target="_blank">
                                                            <Eye className="w-4 h-4 mr-2" /> Preview
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toggleActive(test.id, test.isActive)}
                                                        className={`cursor-pointer ${test.isActive ? "text-amber-600" : "text-emerald-600"}`}
                                                    >
                                                        {test.isActive
                                                            ? <><ToggleLeft className="w-4 h-4 mr-2" /> Set Draft</>
                                                            : <><ToggleRight className="w-4 h-4 mr-2" /> Go Live</>
                                                        }
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => deleteTest(test.id)}
                                                        className="cursor-pointer text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Archive
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
        </AdminPageWrapper>
    );
}