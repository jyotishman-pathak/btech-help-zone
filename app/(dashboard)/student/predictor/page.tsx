"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
type HistoricalRound = {
  year: number;
  round: number;
  closingRank: number;
  openingRank: number | null;
  cutoffMarks: number | null;
};
type Projection2026 = {
  projectedClosingRank: number | null;
  projectedCutoffMarks: number | null;
  confidence: "high" | "medium" | "low";
  basisYears: number[];
  trend: "tightening" | "loosening" | "stable";
};
type Tier = "Qualifies" | "Borderline";
type BranchVerdict = {
  branchName: string;
  tier: Tier;
  referenceRound: HistoricalRound;
  history: HistoricalRound[];
  projection2026: Projection2026;
};
type CollegeVerdict = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  bestTier: Tier;
  branches: BranchVerdict[];
};

const CATEGORIES = ["General", "EWS", "OBC/MOBC", "SC", "ST(P)", "ST(H)"];

const TREND_META: Record<
  Projection2026["trend"],
  { icon: typeof TrendingUp; label: string; color: string }
> = {
  loosening: { icon: TrendingUp, label: "Opening up", color: "#10b981" },
  tightening: { icon: TrendingDown, label: "Tightening", color: "#ef4444" },
  stable: { icon: Minus, label: "Stable", color: "#6b7280" },
};

const CONFIDENCE_LABEL: Record<Projection2026["confidence"], string> = {
  high: "High confidence · Based on 3 years of consistent data",
  medium: "Medium confidence · Based on partial or mixed trends",
  low: "Low confidence · Only 1 year of data available",
};

export default function StudentPredictorPage() {
  const [mode, setMode] = useState<"marks" | "rank">("rank");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CollegeVerdict[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openCollege, setOpenCollege] = useState<string | null>(null);
  const [openBranch, setOpenBranch] = useState<string | null>(null);

  const tally = useMemo(() => {
    if (!results) return null;
    let qualifies = 0;
    let borderline = 0;
    for (const c of results) {
      if (c.bestTier === "Qualifies") qualifies++;
      else borderline++;
    }
    return { qualifies, borderline };
  }, [results]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || parseInt(value) <= 0) {
      setError(`Enter a valid ${mode}.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/student/predictor?mode=${mode}&value=${value}&category=${encodeURIComponent(
          category
        )}`
      );
      const data = await res.json();
      if (res.ok) {
        setResults(data.results);
        setOpenCollege(data.results[0]?.id ?? null);
        setOpenBranch(null);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Couldn't connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            CEE College Predictor
          </h1>
          <p className="text-sm text-gray-600">
            Predict your chances at Assam CEE colleges based on historical data
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handlePredict} className="space-y-5">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "marks" | "rank")}
            >
              <TabsList className="grid grid-cols-2 w-full max-w-xs">
                <TabsTrigger value="rank">By Rank</TabsTrigger>
                <TabsTrigger value="marks">By Marks</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  CEE {mode === "marks" ? "Marks (out of 480)" : "Rank"}
                </label>
                <Input
                  type="number"
                  placeholder={mode === "marks" ? "e.g. 243" : "e.g. 1500"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-medium"
            >
              {loading ? "Checking..." : "Check My Chances"}
            </Button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Results</h2>
              {tally && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">
                      {tally.qualifies} Qualifies
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-gray-600">
                      {tally.borderline} Borderline
                    </span>
                  </span>
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-900 font-medium mb-2">
                  No colleges found
                </p>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Your {mode} falls outside the recorded cutoff range for{" "}
                  {category}. Try the other mode or check your category.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((college) => {
                  const isOpen = openCollege === college.id;
                  const isQualifies = college.bestTier === "Qualifies";

                  return (
                    <div
                      key={college.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCollege(isOpen ? null : college.id)
                        }
                        className="w-full p-4 md:p-5 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {college.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {college.shortName} · {college.city} ·{" "}
                            {college.branches.length} branch
                            {college.branches.length > 1 ? "es" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${isQualifies
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                              }`}
                          >
                            {college.bestTier}
                          </span>
                          {isOpen ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-200 p-4 md:p-5 space-y-4 bg-gray-50/50">
                          {college.branches.map((branch) => {
                            const branchKey = `${college.id}__${branch.branchName}`;
                            const branchOpen = openBranch === branchKey;
                            const isBranchQualifies =
                              branch.tier === "Qualifies";
                            const trendMeta =
                              TREND_META[branch.projection2026.trend];
                            const TrendIcon = trendMeta.icon;

                            return (
                              <div
                                key={branchKey}
                                className="bg-white rounded-md border border-gray-200 overflow-hidden"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenBranch(
                                      branchOpen ? null : branchKey
                                    )
                                  }
                                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBranchQualifies
                                        ? "bg-emerald-50"
                                        : "bg-amber-50"
                                      }`}
                                  >
                                    {isBranchQualifies ? (
                                      <span className="text-emerald-600 text-xs font-semibold">
                                        ✓
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 text-xs font-semibold">
                                        ~
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">
                                      {branch.branchName}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      Last closing: Rank{" "}
                                      {branch.referenceRound.closingRank} (
                                      {branch.referenceRound.year}, Round{" "}
                                      {branch.referenceRound.round})
                                    </p>
                                  </div>
                                  {branchOpen ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>

                                {branchOpen && (
                                  <div className="border-t border-gray-200 p-4 space-y-4">
                                    {/* History Table */}
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                                        Historical Data
                                      </h4>
                                      <div className="overflow-x-auto rounded border border-gray-200">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="text-left px-3 py-2 font-medium text-gray-700">
                                                Year
                                              </th>
                                              <th className="text-left px-3 py-2 font-medium text-gray-700">
                                                Round
                                              </th>
                                              <th className="text-left px-3 py-2 font-medium text-gray-700">
                                                Opening
                                              </th>
                                              <th className="text-left px-3 py-2 font-medium text-gray-700">
                                                Closing
                                              </th>
                                              <th className="text-left px-3 py-2 font-medium text-gray-700">
                                                Marks
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200">
                                            {branch.history.map((h) => (
                                              <tr
                                                key={`${h.year}-${h.round}`}
                                                className="hover:bg-gray-50"
                                              >
                                                <td className="px-3 py-2 text-gray-900">
                                                  {h.year}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">
                                                  R{h.round}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">
                                                  {h.openingRank ?? "—"}
                                                </td>
                                                <td className="px-3 py-2 font-medium text-gray-900">
                                                  {h.closingRank}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">
                                                  {h.cutoffMarks ?? "—"}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>

                                    {/* 2026 Projection */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-900">
                                          2026 Projection
                                        </h4>
                                        <span
                                          className="flex items-center gap-1 text-xs font-medium"
                                          style={{ color: trendMeta.color }}
                                        >
                                          <TrendIcon className="w-3.5 h-3.5" />
                                          {trendMeta.label}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-2xl font-semibold text-gray-900">
                                            {branch.projection2026
                                              .projectedClosingRank ?? "—"}
                                          </p>
                                          <p className="text-xs text-gray-600 mt-0.5">
                                            Est. closing rank
                                          </p>
                                        </div>
                                        {branch.projection2026
                                          .projectedCutoffMarks != null && (
                                            <div>
                                              <p className="text-2xl font-semibold text-gray-900">
                                                {
                                                  branch.projection2026
                                                    .projectedCutoffMarks
                                                }
                                              </p>
                                              <p className="text-xs text-gray-600 mt-0.5">
                                                Est. marks
                                              </p>
                                            </div>
                                          )}
                                      </div>
                                      <div className="mt-3 pt-3 border-t border-blue-200">
                                        <p className="text-xs text-gray-600 flex items-start gap-1.5">
                                          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                          {
                                            CONFIDENCE_LABEL[
                                            branch.projection2026.confidence
                                            ]
                                          }{" "}
                                          ({branch.projection2026.basisYears.join(
                                            ", "
                                          )}
                                          )
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col items-center gap-1 pt-2">
              <p className="text-xs text-center text-gray-500">
                Based on Assam CEE data from 2023–2025 · 7 government colleges
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}