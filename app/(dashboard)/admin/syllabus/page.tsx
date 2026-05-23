"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft, Plus, Trash2, Edit2, Check, X,
    Loader2, ChevronDown, ChevronUp, GripVertical,
    BookOpen, Atom, Calculator, Microscope, Save,
} from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";


interface Topic { id: string; name: string; order: number; }
interface Subject { id: string; name: string; code: string; weightage: number; topics: Topic[]; }

const SUBJECT_ICONS: Record<string, React.ElementType> = {
    Physics: Atom, Chemistry: Microscope, Mathematics: Calculator, Math: Calculator,
};

export default function AdminSyllabusPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // New subject form
    const [addingSubject, setAddingSubject] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: "", weightage: "" });
    const [savingSubject, setSavingSubject] = useState(false);

    // Edit subject
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
    const [editSubjectForm, setEditSubjectForm] = useState({ name: "", weightage: "" });

    // New topic state per subject
    const [addingTopicFor, setAddingTopicFor] = useState<string | null>(null);
    const [newTopicName, setNewTopicName] = useState("");
    const [savingTopic, setSavingTopic] = useState(false);

    // Edit topic
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [editTopicName, setEditTopicName] = useState("");

    const [mutating, setMutating] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/subjects")
            .then((r) => r.json())
            .then((data) => {
                setSubjects(Array.isArray(data) ? data : []);
                // Auto-expand all
                setExpandedIds(new Set((Array.isArray(data) ? data : []).map((s: Subject) => s.id)));
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Subject CRUD ──────────────────────────────────────────────────────────

    const createSubject = async () => {
        if (!newSubject.name.trim()) return;
        setSavingSubject(true);
        try {
            const res = await fetch("/api/admin/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSubject.name.trim(), weightage: parseFloat(newSubject.weightage) || 0 }),
            });
            if (res.ok) {
                const created = await res.json();
                setSubjects((prev) => [...prev, created]);
                setExpandedIds((prev) => new Set([...prev, created.id]));
                setNewSubject({ name: "", weightage: "" });
                setAddingSubject(false);
            }
        } finally { setSavingSubject(false); }
    };

    const saveEditSubject = async (id: string) => {
        setMutating(id);
        try {
            const res = await fetch(`/api/admin/subjects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editSubjectForm.name, weightage: parseFloat(editSubjectForm.weightage) || 0 }),
            });
            if (res.ok) {
                const updated = await res.json();
                setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, ...updated } : s));
                setEditingSubjectId(null);
            }
        } finally { setMutating(null); }
    };

    const deleteSubject = async (id: string) => {
        if (!confirm("Delete this subject and ALL its topics? Student progress will also be deleted.")) return;
        setMutating(id);
        try {
            const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
            if (res.ok) setSubjects((prev) => prev.filter((s) => s.id !== id));
        } finally { setMutating(null); }
    };

    // ── Topic CRUD ────────────────────────────────────────────────────────────

    const createTopic = async (subjectId: string) => {
        if (!newTopicName.trim()) return;
        setSavingTopic(true);
        try {
            const res = await fetch(`/api/admin/subjects/${subjectId}/topics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTopicName.trim() }),
            });
            if (res.ok) {
                const topic = await res.json();
                setSubjects((prev) => prev.map((s) =>
                    s.id === subjectId ? { ...s, topics: [...s.topics, topic] } : s
                ));
                setNewTopicName("");
                setAddingTopicFor(null);
            }
        } finally { setSavingTopic(false); }
    };

    const saveEditTopic = async (topicId: string, subjectId: string) => {
        setMutating(topicId);
        try {
            const res = await fetch(`/api/admin/topics/${topicId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editTopicName }),
            });
            if (res.ok) {
                setSubjects((prev) => prev.map((s) =>
                    s.id === subjectId
                        ? { ...s, topics: s.topics.map((t) => t.id === topicId ? { ...t, name: editTopicName } : t) }
                        : s
                ));
                setEditingTopicId(null);
            }
        } finally { setMutating(null); }
    };

    const deleteTopic = async (topicId: string, subjectId: string) => {
        if (!confirm("Delete this topic? Student progress for this topic will be lost.")) return;
        setMutating(topicId);
        try {
            const res = await fetch(`/api/admin/topics/${topicId}`, { method: "DELETE" });
            if (res.ok) {
                setSubjects((prev) => prev.map((s) =>
                    s.id === subjectId ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) } : s
                ));
            }
        } finally { setMutating(null); }
    };

    const totalTopics = subjects.reduce((s, sub) => s + (sub.topics?.length || 0), 0);

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-16 px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Syllabus Manager</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {subjects.length} subject{subjects.length !== 1 ? "s" : ""} · {totalTopics} topics
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => { setAddingSubject(true); setTimeout(() => document.getElementById("new-subject-input")?.focus(), 50); }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Subject
                </Button>
            </div>

            {/* Guide banner when empty */}
            {subjects.length === 0 && (
                <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-zinc-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No subjects yet</h2>
                        <p className="text-zinc-500 text-sm mt-1">
                            Create subjects (Physics, Chemistry, Mathematics), then add topics under each.
                        </p>
                    </div>
                    <Button
                        onClick={() => setAddingSubject(true)}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create First Subject
                    </Button>
                </div>
            )}

            {/* New subject form */}
            {addingSubject && (
                <Card className="border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900">
                    <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">New Subject</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500">Subject Name *</label>
                                <Input
                                    id="new-subject-input"
                                    value={newSubject.name}
                                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    placeholder="e.g. Physics"
                                    onKeyDown={(e) => e.key === "Enter" && createSubject()}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-500">Weightage (%)</label>
                                <Input
                                    type="number"
                                    value={newSubject.weightage}
                                    onChange={(e) => setNewSubject({ ...newSubject, weightage: e.target.value })}
                                    placeholder="e.g. 33"
                                    min="0" max="100"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={createSubject} disabled={savingSubject || !newSubject.name.trim()} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                                {savingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1.5" /> Create</>}
                            </Button>
                            <Button variant="outline" onClick={() => { setAddingSubject(false); setNewSubject({ name: "", weightage: "" }); }} className="border-zinc-200 dark:border-zinc-800">
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Subject cards */}
            <div className="space-y-3">
                {subjects.map((subject) => {
                    const SubIcon = SUBJECT_ICONS[subject.name] ?? BookOpen;
                    const isExpanded = expandedIds.has(subject.id);
                    const isEditingThis = editingSubjectId === subject.id;

                    return (
                        <Card
                            key={subject.id}
                            className={cn(
                                "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden",
                                mutating === subject.id && "opacity-60"
                            )}
                        >
                            {/* Subject header */}
                            <div className="flex items-center gap-3 p-4">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                    <SubIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {isEditingThis ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={editSubjectForm.name}
                                                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                                                className="h-8 text-sm font-bold"
                                                autoFocus
                                            />
                                            <Input
                                                type="number"
                                                value={editSubjectForm.weightage}
                                                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, weightage: e.target.value })}
                                                className="h-8 text-sm w-20"
                                                placeholder="%"
                                            />
                                            <Button size="sm" onClick={() => saveEditSubject(subject.id)} disabled={mutating === subject.id} className="h-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                                <Save className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditingSubjectId(null)} className="h-8 border-zinc-200 dark:border-zinc-800">
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{subject.name}</span>
                                            {subject.weightage > 0 && (
                                                <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs">
                                                    {subject.weightage}%
                                                </Badge>
                                            )}
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                · {subject.topics.length} topic{subject.topics.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {!isEditingThis && (
                                        <>
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
                                                onClick={() => { setEditingSubjectId(subject.id); setEditSubjectForm({ name: subject.name, weightage: String(subject.weightage) }); }}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                                onClick={() => deleteSubject(subject.id)}
                                                disabled={mutating === subject.id}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost" size="icon" className="h-8 w-8 text-zinc-400"
                                        onClick={() => toggleExpand(subject.id)}
                                    >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Topics list */}
                            {isExpanded && (
                                <div className="border-t border-zinc-100 dark:border-zinc-800">
                                    {subject.topics.length === 0 && addingTopicFor !== subject.id && (
                                        <p className="text-sm text-zinc-400 dark:text-zinc-600 italic px-4 py-3 text-center">
                                            No topics yet — add your first topic below.
                                        </p>
                                    )}

                                    {subject.topics.map((topic, idx) => (
                                        <div
                                            key={topic.id}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors",
                                                idx < subject.topics.length - 1 && "border-b border-zinc-50 dark:border-zinc-800/50"
                                            )}
                                        >
                                            <GripVertical className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                                            <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                                                {idx + 1}
                                            </span>

                                            {editingTopicId === topic.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <Input
                                                        value={editTopicName}
                                                        onChange={(e) => setEditTopicName(e.target.value)}
                                                        className="h-8 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === "Enter" && saveEditTopic(topic.id, subject.id)}
                                                    />
                                                    <Button size="sm" onClick={() => saveEditTopic(topic.id, subject.id)} disabled={mutating === topic.id} className="h-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shrink-0">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingTopicId(null)} className="h-8 border-zinc-200 dark:border-zinc-800 shrink-0">
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{topic.name}</span>
                                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
                                                            onClick={() => { setEditingTopicId(topic.id); setEditTopicName(topic.name); }}
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500"
                                                            onClick={() => deleteTopic(topic.id, subject.id)}
                                                            disabled={mutating === topic.id}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add topic row */}
                                    {addingTopicFor === subject.id ? (
                                        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                                            <Input
                                                value={newTopicName}
                                                onChange={(e) => setNewTopicName(e.target.value)}
                                                placeholder="Topic name (e.g. Kinematics)"
                                                className="flex-1 h-8 text-sm"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") createTopic(subject.id);
                                                    if (e.key === "Escape") { setAddingTopicFor(null); setNewTopicName(""); }
                                                }}
                                            />
                                            <Button
                                                size="sm" onClick={() => createTopic(subject.id)}
                                                disabled={savingTopic || !newTopicName.trim()}
                                                className="h-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shrink-0"
                                            >
                                                {savingTopic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => { setAddingTopicFor(null); setNewTopicName(""); }} className="h-8 border-zinc-200 dark:border-zinc-800 shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setAddingTopicFor(subject.id); setNewTopicName(""); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add topic to {subject.name}
                                        </button>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}