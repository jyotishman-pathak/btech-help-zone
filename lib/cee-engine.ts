/**
 * CEE 2026 Prediction Engine
 * --------------------------
 * Primary source: CEE_STATIC_DATA (lib/data.ts)
 *   - Has projection2026 already modelled (linear trend from 2023-2025 rounds)
 *   - Has cutoffMarks for marks→rank estimation
 *   - Covers categories: General, EWS, OBC/MOBC, SC, ST(P), ST(H)
 *
 * Fallback source: predictions.json (public/data/predictions.json)
 *   - Covers extra categories: TGLC, EXTGLC, KOCH, TAI AHOM, CHUTIYA, MORAN, MATAK, etc.
 *   - Simple linear YoY projection for 2026
 */

import { CEE_STATIC_DATA } from "./data"
import rawPredictions from "../public/data/predictions.json"

// ─── Constants ────────────────────────────────────────────────────────────────

export const ALL_BRANCHES = "__ALL__"

/** Branch names from CEE_STATIC_DATA (title-case, canonical) */
export const BRANCHES_LIST: string[] = Array.from(
  new Set(CEE_STATIC_DATA.flatMap((c) => c.branches.map((b) => b.branchName)))
).sort()

/** Branch abbreviations for display */
export const BRANCH_SHORT: Record<string, string> = {
  "Computer Science and Engineering": "CSE",
  "Electronics and Telecommunication Engineering": "ETE",
  "Electrical Engineering": "EE",
  "Civil Engineering": "CE",
  "Mechanical Engineering": "ME",
  "Instrumentation Engineering": "IE",
  "Power Electronics and Instrumentation": "PEI",
  "Chemical Engineering": "CHE",
}

/** Map from predictions.json branch name → data.ts branch name */
const JSON_TO_DTS_BRANCH: Record<string, string> = {
  "COMPUTER SCIENCE & ENGINEERING": "Computer Science and Engineering",
  "ELCTRONICS & TELECOMMUNICATION ENGINEERING": "Electronics and Telecommunication Engineering",
  "ELECTRICAL ENGINEERING": "Electrical Engineering",
  "CIVIL ENGINEERING": "Civil Engineering",
  "MECHANICAL ENGINEERING": "Mechanical Engineering",
  "INSTRUMENTATION ENGINEERING": "Instrumentation Engineering",
  "POWER ELECTRONICS & INSTRUMENTATION ENGINEERING": "Power Electronics and Instrumentation",
  "CHEMICAL ENGINEERING": "Chemical Engineering",
  "INDUSTRIAL & PRODUCTION ENGINEERING": "Mechanical Engineering", // closest match
}

/** Form category values → data.ts category keys */
const CAT_TO_DTS: Record<string, string> = {
  UR: "General",
  EWS: "EWS",
  "OBC/MOBC": "OBC/MOBC",
  SC: "SC",
  STP: "ST(P)",
  STH: "ST(H)",
}

export const CATEGORIES_LIST = [
  "UR",
  "EWS",
  "OBC/MOBC",
  "SC",
  "STP",
  "STH",
  "TGLC",
  "EXTGLC",
  "KOCH",
  "TAI AHOM",
  "CHUTIYA",
  "MORAN",
  "MATAK",
]

export const CATEGORY_LABELS: Record<string, string> = {
  UR: "Unreserved (UR)",
  EWS: "EWS",
  "OBC/MOBC": "OBC / MOBC",
  SC: "Scheduled Caste (SC)",
  STP: "Scheduled Tribe Plains (STP)",
  STH: "Scheduled Tribe Hills (STH)",
  TGLC: "Tea Garden Labour (TGLC)",
  EXTGLC: "Ex-Tea Garden (EXTGLC)",
  KOCH: "Koch Rajbongshi (KOCH)",
  "TAI AHOM": "Tai Ahom",
  CHUTIYA: "Chutiya",
  MORAN: "Moran",
  MATAK: "Matak",
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type CEEResult = {
  college: string
  shortName: string
  city: string
  branch: string
  branchShort: string
  category: string
  /** The 2026 projected closing rank (the single authoritative number) */
  projected2026: number
  /** 2026 projected cutoff marks (if available from data.ts) */
  projectedMarks2026: number | null
  trend: "tightening" | "loosening" | "stable"
  confidence: "high" | "medium" | "low"
  /** Latest round per year, sorted ascending */
  historical: Array<{ year: number; rank: number; marks: number | null }>
  /** Standard deviation of closing ranks across years */
  variance: number
  /** projected2026 - userRank. Positive = user is inside cutoff. Negative = user exceeded cutoff. */
  gap: number
  dataSource: "primary" | "fallback"
}

// ─── Marks → Rank table ───────────────────────────────────────────────────────

type MarksPoint = { marks: number; rank: number }
let _marksTable: MarksPoint[] | null = null

function getMarksTable(): MarksPoint[] {
  if (_marksTable) return _marksTable

  const points: MarksPoint[] = []
  CEE_STATIC_DATA.forEach((college) => {
    college.branches.forEach((branch) => {
      // Use General and EWS categories as reference for overall marks→rank curve
      const cats = ["General", "EWS"]
      cats.forEach((catKey) => {
        const catData = branch.categories[catKey]
        if (!catData) return
        catData.history.forEach((round) => {
          if (round.cutoffMarks !== null && round.closingRank > 0) {
            points.push({ marks: round.cutoffMarks, rank: round.closingRank })
          }
        })
      })
    })
  })

  const seen = new Set<string>()
  _marksTable = points
    .filter((p) => {
      const key = `${p.marks}-${p.rank}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.marks - a.marks) // descending marks → ascending rank
  return _marksTable
}

/** Estimate CEE overall rank from marks via linear interpolation on historical cutoff data */
export function estimateRankFromMarks(marks: number): number {
  const table = getMarksTable()
  if (table.length === 0) return Math.round(50000 * Math.max(0, (300 - marks) / 180))
  if (marks >= table[0].marks) return 1
  const last = table[table.length - 1]
  if (marks <= last.marks) return Math.min(50000, last.rank + Math.round((last.marks - marks) * 80))

  for (let i = 0; i < table.length - 1; i++) {
    const hi = table[i]
    const lo = table[i + 1]
    if (marks <= hi.marks && marks >= lo.marks) {
      const t = (hi.marks - marks) / (hi.marks - lo.marks)
      return Math.round(hi.rank + t * (lo.rank - hi.rank))
    }
  }
  return 5000
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  return Math.round(Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length))
}

/** Get latest round per year from history, sorted by year */
function latestPerYear(
  history: Array<{ year: number; round: number; closingRank: number; cutoffMarks: number | null }>
): Array<{ year: number; rank: number; marks: number | null }> {
  const map = new Map<number, { rank: number; marks: number | null; round: number }>()
  history.forEach((h) => {
    const ex = map.get(h.year)
    if (!ex || h.round > ex.round) map.set(h.year, { rank: h.closingRank, marks: h.cutoffMarks, round: h.round })
  })
  return Array.from(map.entries())
    .map(([year, v]) => ({ year, rank: v.rank, marks: v.marks }))
    .sort((a, b) => a.year - b.year)
}

// ─── Main prediction function ─────────────────────────────────────────────────

export function predictCEE(rank: number, categoryForm: string, branchFilter: string): CEEResult[] {
  const results: CEEResult[] = []
  const dtsCat = CAT_TO_DTS[categoryForm]

  if (dtsCat) {
    // ── Primary: CEE_STATIC_DATA ──
    CEE_STATIC_DATA.forEach((college) => {
      college.branches.forEach((branch) => {
        if (branchFilter !== ALL_BRANCHES && branch.branchName !== branchFilter) return
        const catData = branch.categories[dtsCat]
        if (!catData?.projection2026?.projectedClosingRank) return

        const proj = catData.projection2026
        const historical = latestPerYear(catData.history)
        const variance = stdDev(historical.map((h) => h.rank))

        const p2026 = proj.projectedClosingRank!
        results.push({
          college: college.name,
          shortName: college.shortName,
          city: college.city,
          branch: branch.branchName,
          branchShort: BRANCH_SHORT[branch.branchName] ?? branch.branchName.slice(0, 3),
          category: categoryForm,
          projected2026: p2026,
          projectedMarks2026: proj.projectedCutoffMarks,
          trend: proj.trend,
          confidence: proj.confidence,
          historical,
          variance,
          gap: p2026 - rank,
          dataSource: "primary",
        })
      })
    })
  } else {
    // ── Fallback: predictions.json for extra categories ──
    const preds = rawPredictions as Array<{
      year: number; round: number; college: string; branch: string
      category: string; closing_rank: number; seat_type: string
    }>

    const relevant = preds.filter(
      (p) =>
        p.category === categoryForm &&
        p.seat_type === "EXCLUDING 5%" &&
        (branchFilter === ALL_BRANCHES ||
          JSON_TO_DTS_BRANCH[p.branch] === branchFilter ||
          p.branch === branchFilter)
    )

    const grouped = new Map<string, typeof relevant>()
    relevant.forEach((p) => {
      const key = `${p.college}||${p.branch}`
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(p)
    })

    grouped.forEach((rows, key) => {
      const [collegeName, jsonBranch] = key.split("||")
      const branchDisplay = JSON_TO_DTS_BRANCH[jsonBranch] ?? jsonBranch

      const yearMap = new Map<number, { rank: number; round: number }>()
      rows.forEach((r) => {
        const ex = yearMap.get(r.year)
        if (!ex || r.round > ex.round) yearMap.set(r.year, { rank: r.closing_rank, round: r.round })
      })
      const historical = Array.from(yearMap.entries())
        .map(([year, v]) => ({ year, rank: v.rank, marks: null }))
        .sort((a, b) => a.year - b.year)
      if (!historical.length) return

      // Linear projection to 2026
      let projected2026 = historical[historical.length - 1].rank
      if (historical.length >= 2) {
        const n = historical.length
        const last = historical[n - 1].rank
        const prev = historical[n - 2].rank
        const yearsAhead = 2026 - historical[n - 1].year
        projected2026 = Math.max(1, Math.min(50000, Math.round(last + (last - prev) * yearsAhead)))
      }

      const meta = CEE_STATIC_DATA.find(
        (c) => c.name.toUpperCase() === collegeName.toUpperCase()
      )
      const variance = stdDev(historical.map((h) => h.rank))

      results.push({
        college: meta?.name ?? collegeName,
        shortName: meta?.shortName ?? collegeName.split(" ").filter((w) => w.length > 2).map((w) => w[0]).slice(0, 4).join(""),
        city: meta?.city ?? "Assam",
        branch: branchDisplay,
        branchShort: BRANCH_SHORT[branchDisplay] ?? branchDisplay.slice(0, 3),
        category: categoryForm,
        projected2026,
        projectedMarks2026: null,
        trend: "stable",
        confidence: historical.length >= 3 ? "medium" : "low",
        historical,
        variance,
        gap: projected2026 - rank,
        dataSource: "fallback",
      })
    })
  }

  // Sort: largest buffer → smallest, then least negative → most negative
  return results.sort((a, b) => b.gap - a.gap)
}
