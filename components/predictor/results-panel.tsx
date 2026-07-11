"use client"

import { AlertCircle, MapPin } from "lucide-react"
import { CollegeResult, COLLEGE_META, formatRank } from "../../lib/prediction"

type Props = {
    results: CollegeResult[]
    query: { rank: number; category: string; branch: string }
}

export function ResultsPanel({ results, query }: Props) {
    if (results.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">No colleges found</p>
                <p className="text-xs text-gray-400 mt-1">
                    No historical admissions found for rank {query.rank.toLocaleString("en-IN")} in {query.category} category.
                    Try adjusting your rank or category.
                </p>
            </div>
        )
    }

    // Sort by closing rank ascending (lower rank = more selective = show first)
    const sorted = [...results].sort((a, b) => a.closingRank - b.closingRank)

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-400">
                {sorted.length} college{sorted.length !== 1 ? "s" : ""} found · sorted by closing rank
            </p>

            {sorted.map((result, i) => (
                <CollegeRow key={i} result={result} userRank={query.rank} />
            ))}

            <div className="pt-4 text-xs text-gray-400 flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <p>
                    Based on CEE Assam historical data (2023–2024). Actual cutoffs may vary each year.
                    Always refer to official DTE Assam allotment notices.
                </p>
            </div>
        </div>
    )
}

function CollegeRow({ result, userRank }: { result: CollegeResult; userRank: number }) {
    const meta = COLLEGE_META[result.college]
    const abbr = meta?.short ?? result.college.split(" ").filter(w => w.length > 2).map(w => w[0]).slice(0, 3).join("")
    const qualifies = userRank <= result.closingRank

    return (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
            {/* Abbreviation badge */}
            <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                {abbr}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{result.college}</span>
                    {meta?.location && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {meta.location}
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{result.branch}</p>

                {/* Historical ranks per year */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {result.historical
                        .slice()
                        .sort((a, b) => a.year - b.year)
                        .map((h) => (
                            <div key={h.year} className="flex items-center gap-1 text-xs">
                                <span className="text-gray-400">{h.year}</span>
                                <span className="font-mono font-semibold text-gray-700">#{formatRank(h.rank)}</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Right side: closing rank + status */}
            <div className="flex-shrink-0 text-right">
                <div className="text-lg font-bold text-gray-900 font-mono">
                    #{formatRank(result.closingRank)}
                </div>
                <div className="text-[10px] text-gray-400 mb-1">last closing rank</div>
                <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        qualifies
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                    }`}
                >
                    {qualifies ? "Within cutoff" : "Above cutoff"}
                </span>
            </div>
        </div>
    )
}