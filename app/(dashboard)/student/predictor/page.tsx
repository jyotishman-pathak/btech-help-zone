"use client"

import { useState } from "react"
import { PredictionForm, InputMode } from "../../../../components/predictor/prediction-form"
import { ResultsPanel } from "../../../../components/predictor/results-panel"
import { CEEResult, predictCEE, estimateRankFromMarks } from "../../../../lib/cee-engine"

type QueryState = {
    rank: number
    category: string
    branch: string
}

export default function PredictPage() {
    const [results, setResults] = useState<CEEResult[] | null>(null)
    const [query, setQuery] = useState<QueryState | null>(null)
    const [loading, setLoading] = useState(false)

    const handlePredict = (value: number, category: string, branch: string, mode: InputMode) => {
        setLoading(true)
        setResults(null)
        setTimeout(() => {
            const rank = mode === "marks" ? estimateRankFromMarks(value) : value
            const predicted = predictCEE(rank, category, branch)
            setResults(predicted)
            setQuery({ rank, category, branch })
            setLoading(false)
        }, 350)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">CEE College Predictor</h1>
                    <p className="text-sm text-gray-500">
                        Enter your rank or marks — see exactly which colleges you qualify for based on historical closing ranks.
                    </p>
                </div>

                <PredictionForm onSubmit={handlePredict} loading={loading} />

                {loading && <ResultsSkeleton />}

                {results && query && !loading && (
                    <ResultsPanel
                        results={results}
                        userRank={query.rank}
                        category={query.category}
                    />
                )}
            </div>
        </div>
    )
}

function ResultsSkeleton() {
    return (
        <div className="space-y-3">
            <div className="h-14 rounded-xl border border-gray-200 bg-white animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl border border-gray-200 bg-white animate-pulse" />
            ))}
        </div>
    )
}