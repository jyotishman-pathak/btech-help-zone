"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Search, Loader2 } from "lucide-react"
import { Label } from "../ui/label"
import { BRANCHES, CATEGORIES } from "../../lib/prediction"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

type Props = {
    onSubmit: (rank: number, category: string, branch: string) => void
    loading: boolean
}

export function PredictionForm({ onSubmit, loading }: Props) {
    const [rank, setRank] = useState("")
    const [category, setCategory] = useState("UR")
    const [branch, setBranch] = useState("COMPUTER SCIENCE & ENGINEERING")
    const [error, setError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const rankNum = parseInt(rank)

        if (!rank || isNaN(rankNum) || rankNum < 1 || rankNum > 50000) {
            setError("Enter a valid rank between 1 and 50,000")
            return
        }

        setError("")
        onSubmit(rankNum, category, branch)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="grid md:grid-cols-12 gap-4">
                    {/* Rank */}
                    <div className="md:col-span-3">
                        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Your Rank
                        </Label>
                        <Input
                            type="number"
                            value={rank}
                            onChange={(e) => setRank(e.target.value)}
                            placeholder="e.g. 2500"
                            className="mt-1.5 h-10"
                        />
                    </div>

                    {/* Category */}
                    <div className="md:col-span-4">
                        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Category
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="mt-1.5 h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Branch */}
                    <div className="md:col-span-5">
                        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Branch
                        </Label>
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger className="mt-1.5 h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BRANCHES.map((b) => (
                                    <SelectItem key={b} value={b}>
                                        {b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-500">{error}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        Data: CEE 2023 &amp; 2024 · Round 1 cutoffs
                    </p>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-10 px-5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Predict
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}