"use client"

import { CEEResult } from "../../lib/cee-engine"
import { CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"
import { useState } from "react"

type Props = {
    results: CEEResult[]
    userRank: number
    category: string
}

// ─── Single College Card ──────────────────────────────────────────────────────

function CollegeCard({ result, userRank }: { result: CEEResult; userRank: number }) {
    const [open, setOpen] = useState(false)
    // You qualify if your rank number is <= the closing rank number
    // (closing rank = max rank that got in. Lower number = more competitive.)
    const qualifies = userRank <= result.projected2026

    return (
        <div
            className={cn(
                "bg-white rounded-xl border border-l-4 transition-shadow",
                qualifies
                    ? "border-gray-200 border-l-emerald-500 hover:shadow-md"
                    : "border-gray-100 border-l-gray-300 hover:shadow-sm"
            )}
        >
            <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className="mt-0.5 flex-shrink-0">
                        {qualifies
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            : <XCircle className="h-5 w-5 text-gray-300" />
                        }
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            {/* College name + branch */}
                            <div>
                                <p className={cn("font-semibold text-sm leading-tight", qualifies ? "text-gray-900" : "text-gray-500")}>
                                    {result.college}
                                </p>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {result.branch}
                                    <span className="ml-2 text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                                        {result.branchShort}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-400">· {result.city}</span>
                                </p>
                            </div>

                            {/* Projected cutoff rank — the key number */}
                            <div className="text-right flex-shrink-0">
                                <div className={cn(
                                    "text-2xl font-bold font-mono",
                                    qualifies ? "text-gray-900" : "text-gray-400"
                                )}>
                                    #{result.projected2026.toLocaleString("en-IN")}
                                </div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                                    last closing rank
                                </div>
                                {result.projectedMarks2026 && (
                                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                                        ≈ {result.projectedMarks2026} marks
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status pill */}
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                            {qualifies ? (
                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                                    ✓ You qualify — {(result.projected2026 - userRank).toLocaleString("en-IN")} rank buffer
                                </span>
                            ) : (
                                <span className="text-xs font-semibold bg-red-50 text-red-500 px-2.5 py-1 rounded-lg">
                                    ✗ Need rank {(userRank - result.projected2026).toLocaleString("en-IN")} better
                                </span>
                            )}

                            {/* Toggle history */}
                            {result.historical.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setOpen((v) => !v)}
                                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition-colors ml-auto"
                                >
                                    Past data
                                    {open
                                        ? <ChevronUp className="h-3.5 w-3.5" />
                                        : <ChevronDown className="h-3.5 w-3.5" />
                                    }
                                </button>
                            )}
                        </div>

                        {/* Historical ranks (collapsible) */}
                        {open && result.historical.length > 0 && (
                            <div className="mt-2.5 p-3 bg-gray-50 rounded-lg flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1">Closing ranks</span>
                                {result.historical.map((h, i) => (
                                    <span key={h.year} className="flex items-center gap-1">
                                        {i > 0 && <span className="text-gray-300 text-xs">→</span>}
                                        <span className="text-xs text-gray-400">{h.year}</span>
                                        <span className="text-xs font-mono font-semibold text-gray-700">
                                            #{h.rank.toLocaleString("en-IN")}
                                        </span>
                                        {h.marks && (
                                            <span className="text-[10px] text-gray-400">({h.marks}m)</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ResultsPanel({ results, userRank, category }: Props) {
    if (results.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <XCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">No data found</p>
                <p className="text-xs text-gray-400 mt-1">
                    No historical admissions for this category &amp; branch combination. Try &quot;All Branches&quot; or a different category.
                </p>
            </div>
        )
    }

    const qualifying = results.filter((r) => userRank <= r.projected2026)
    const notQualifying = results.filter((r) => userRank > r.projected2026)

    // Qualifying: sorted by cutoff descending (easiest to get into first — shows widest buffer)
    const sortedQ = [...qualifying].sort((a, b) => b.projected2026 - a.projected2026)
    // Not qualifying: sorted by cutoff descending (closest ones first — least over the cutoff)
    const sortedN = [...notQualifying].sort((a, b) => b.projected2026 - a.projected2026)

    // All results for display = qualifying first, then not qualifying
    const allSorted = [...sortedQ, ...sortedN]

    return (
        <div className="space-y-3">
            {/* Summary bar */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3.5 flex-wrap gap-3">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">Your rank</span>
                    <span className="font-bold font-mono text-gray-900 text-lg">
                        #{userRank.toLocaleString("en-IN")}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">{results.length} college–branch options found</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-gray-700 font-semibold">{qualifying.length} you qualify for</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-gray-400">{notQualifying.length} out of reach</span>
                    </span>
                </div>
            </div>

            {/* All results in one list */}
            {allSorted.map((r, i) => (
                <CollegeCard key={i} result={r} userRank={userRank} />
            ))}

            {/* Footer */}
            <div className="flex items-start gap-2 text-xs text-gray-400 pt-1 pb-2">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <p>
                    Closing ranks are from CEE Assam historical data (2023–2025). &quot;Last closing rank&quot; is the highest rank that got a seat in the most recent round available.
                    Actual 2026 cutoffs may vary. Always verify with official DTE Assam notices.
                </p>
            </div>
        </div>
    )
}