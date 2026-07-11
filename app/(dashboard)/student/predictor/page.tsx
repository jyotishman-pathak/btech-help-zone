"use client"

import { useState } from "react"
import { PredictionForm } from "../../../../components/predictor/prediction-form"
import { ResultsPanel } from "../../../../components/predictor/results-panel"
import { CollegeResult, predictColleges } from "../../../../lib/prediction"

export default function PredictPage() {
  const [results, setResults] = useState<CollegeResult[] | null>(null)
  const [query, setQuery] = useState<{ rank: number; category: string; branch: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = (rank: number, category: string, branch: string) => {
    setLoading(true)
    setQuery({ rank, category, branch })
    setTimeout(() => {
      const predicted = predictColleges(rank, category, branch)
      setResults(predicted)
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CEE College Predictor</h1>
          <p className="text-sm text-gray-500 mt-1">
            See which colleges admitted students at your rank — based on historical CEE data.
          </p>
        </div>

        <PredictionForm onSubmit={handlePredict} loading={loading} />

        {loading && <ResultsSkeleton />}

        {results && query && !loading && (
          <ResultsPanel results={results} query={query} />
        )}
      </div>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 rounded-xl border border-gray-200 bg-white animate-pulse" />
      ))}
    </div>
  )
}