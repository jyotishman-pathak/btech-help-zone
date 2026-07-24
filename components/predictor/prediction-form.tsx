"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Search, Loader2, Hash, BookOpen } from "lucide-react"
import { Label } from "../ui/label"
import { BRANCHES_LIST, CATEGORIES_LIST, CATEGORY_LABELS, ALL_BRANCHES } from "../../lib/cee-engine"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export type InputMode = "rank" | "marks"

type Props = {
    onSubmit: (value: number, category: string, branch: string, mode: InputMode) => void
    loading: boolean
}

export function PredictionForm({ onSubmit, loading }: Props) {
    const [mode, setMode] = useState<InputMode>("rank")
    const [value, setValue] = useState("")
    const [category, setCategory] = useState("UR")
    const [branch, setBranch] = useState("Computer Science and Engineering")
    const [error, setError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const num = parseInt(value)

        if (mode === "rank") {
            if (!value || isNaN(num) || num < 1 || num > 50000) {
                setError("Enter a valid rank between 1 and 50,000")
                return
            }
        } else {
            if (!value || isNaN(num) || num < 0 || num > 300) {
                setError("Enter valid CEE marks (0 – 300)")
                return
            }
        }

        setError("")
        onSubmit(num, category, branch, mode)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                {/* Mode toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Search by</span>
                    <div className="flex items-center gap-0.5 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => { setMode("rank"); setValue(""); setError("") }}
                            className={cn(
                                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                                mode === "rank"
                                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Hash className="h-3.5 w-3.5" />
                            Rank
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode("marks"); setValue(""); setError("") }}
                            className={cn(
                                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                                mode === "marks"
                                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            Marks
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-4 items-end">
                    {/* Value input */}
                    <div className="md:col-span-3">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {mode === "rank" ? "Your CEE Rank" : "Your CEE Marks"}
                        </Label>
                        <div className="relative mt-1.5">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">
                                {mode === "rank" ? "#" : ""}
                            </span>
                            <Input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={mode === "rank" ? "e.g. 2500" : "e.g. 195"}
                                className={cn("h-11 font-mono text-base", mode === "rank" ? "pl-7" : "pl-3")}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                            {mode === "rank" ? "Overall CEE rank (1 – 50,000)" : "Total marks out of 300"}
                        </p>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-4">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Quota / Category
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="mt-1.5 h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES_LIST.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {CATEGORY_LABELS[cat] ?? cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Branch */}
                    <div className="md:col-span-5">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Branch
                        </Label>
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger className="mt-1.5 h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_BRANCHES}>
                                    <span className="font-semibold text-indigo-600">All Branches</span>
                                </SelectItem>
                                {BRANCHES_LIST.map((b) => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                )}

                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">
                        2026 projections · Based on CEE 2023–2025 official cutoffs
                    </p>
                    <Button type="submit" disabled={loading} className="h-10 px-6 gap-2">
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analysing...</> : <><Search className="h-4 w-4" />Predict 2026</>}
                    </Button>
                </div>
            </div>
        </form>
    )
}