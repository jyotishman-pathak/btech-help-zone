"use client";

import { useState } from "react";
import { Search, Map, Building2, Target, ChevronRight, Lock, Trophy, School } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Badge } from "../../../../components/ui/badge";

export default function StudentPredictorPage() {
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank || parseInt(rank) <= 0) {
      setError("Please enter a valid rank.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/student/predictor?rank=${rank}&category=${category}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.results);
      } else {
        setError(data.error || "Failed to get predictions.");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">College Predictor</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Check your probability of getting into top colleges based on past cutoffs.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Your Rank</label>
                <Input
                  type="number"
                  placeholder="e.g. 1500"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#12101F] border-slate-200/70 dark:border-slate-700/50">
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="EWS">EWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl font-bold"
            >
              {loading ? (
                "Analyzing Data..."
              ) : (
                "Predict My Chances"
              )}
            </Button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">Results</h2>
              <span className="text-sm font-medium text-slate-500">{results.length} colleges found</span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20 rounded-3xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50">
                <Target className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-semibold">No matches found</p>
                <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">Your rank might be higher than historical cutoffs for this category.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result: any, idx: number) => {
                  let badgeColors = "";
                  if (result.color === "green") {
                    badgeColors = "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
                  } else if (result.color === "yellow") {
                    badgeColors = "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
                  } else {
                    badgeColors = "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
                  }

                  return (
                    <div
                      key={idx}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#12101F] border border-slate-200/70 dark:border-slate-700/50 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {result.collegeName} {result.collegeShortName && `(${result.collegeShortName})`}
                          </p>
                          <Badge className={`border-none ${badgeColors} shrink-0`}>
                            {result.probability}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {result.branchName}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Closing Rank: <span className="font-bold text-slate-700 dark:text-slate-300">{result.closingRank}</span>
                          </span>
                          {result.openingRank && (
                            <>
                              <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Opening: <span className="font-bold text-slate-700 dark:text-slate-300">{result.openingRank}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
