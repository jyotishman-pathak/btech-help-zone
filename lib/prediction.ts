import data from "../public/data/predictions.json"
import { CEE_STATIC_DATA } from "./data"

export type Prediction = {
    year: number
    round: number
    college: string
    branch: string
    category: string
    closing_rank: number
    seat_type: string
}

export type CollegeResult = {
    college: string
    branch: string
    category: string
    closingRank: number
    probability: number
    zone: "safe" | "moderate" | "risky"
    trend: "up" | "stable" | "down"
    historical: { year: number; rank: number }[]
}

const predictions = data as Prediction[]

export const CATEGORIES = [
    "UR", "EWS", "OBC/MOBC", "SC", "STP", "STH",
    "TGLC", "EXTGLC", "KOCH", "TAI AHOM", "CHUTIYA", "MORAN", "MATAK"
]

export const BRANCHES = Array.from(
    new Set(predictions.map((p) => p.branch))
).sort()

export const ALL_BRANCHES_VALUE = "__ALL__"

export const COLLEGES = Array.from(
    new Set(predictions.map((p) => p.college))
)

// College metadata for premium feel
export const COLLEGE_META: Record<string, { short: string; location: string; tier: 1 | 2 | 3 }> = {
    "ASSAM ENGINEERING COLLEGE": { short: "AEC", location: "Guwahati", tier: 1 },
    "JORHAT ENGINEERING COLLEGE": { short: "JEC", location: "Jorhat", tier: 1 },
    "JORHAT INSTITUTE OF SCIENCE & TECHNOLOGY": { short: "JIST", location: "Jorhat", tier: 2 },
    "BINESWAR BRAHMA ENGINEERING COLLEGE": { short: "BBEC", location: "Kokrajhar", tier: 2 },
    "BARAK VALLEY ENGINEERING COLLEGE": { short: "BVEC", location: "Karimganj", tier: 2 },
    "GOLAGHAT ENGINEERING COLLEGE": { short: "GEC", location: "Golaghat", tier: 2 },
    "DHEMAJI ENGINEERING COLLEGE": { short: "DEC", location: "Dhemaji", tier: 3 },
}

// ---------------------------------------------------------------------------
// Marks → Rank estimation
// Build a lookup table from cutoffMarks → closingRank using CEE_STATIC_DATA.
// We take data points from all colleges/branches/categories, then sort by marks
// descending and use linear interpolation to estimate rank from marks.
// ---------------------------------------------------------------------------

type MarksRankPoint = { marks: number; rank: number }

let _marksRankTable: MarksRankPoint[] | null = null

function getMarksRankTable(): MarksRankPoint[] {
    if (_marksRankTable) return _marksRankTable

    const points: MarksRankPoint[] = []

    CEE_STATIC_DATA.forEach((college) => {
        college.branches.forEach((branch) => {
            Object.values(branch.categories).forEach((catData) => {
                catData.history.forEach((round) => {
                    if (round.cutoffMarks !== null && round.closingRank > 0) {
                        points.push({ marks: round.cutoffMarks, rank: round.closingRank })
                    }
                })
            })
        })
    })

    // Deduplicate and sort by marks descending (higher marks → lower/better rank)
    const seen = new Set<string>()
    const unique = points.filter((p) => {
        const key = `${p.marks}-${p.rank}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })

    // Sort by marks descending
    _marksRankTable = unique.sort((a, b) => b.marks - a.marks)
    return _marksRankTable
}

/**
 * Estimate CEE rank from marks using linear interpolation on historical data.
 * Higher marks → lower (better) rank.
 */
export function estimateRankFromMarks(marks: number): number {
    const table = getMarksRankTable()
    if (table.length === 0) return Math.round(50000 * (1 - marks / 300))

    // marks above maximum → rank 1
    if (marks >= table[0].marks) return 1

    // marks below minimum → very high rank
    if (marks <= table[table.length - 1].marks) {
        return Math.min(50000, table[table.length - 1].rank * 2)
    }

    // Find surrounding points and interpolate
    for (let i = 0; i < table.length - 1; i++) {
        const upper = table[i]   // higher marks, lower rank
        const lower = table[i + 1] // lower marks, higher rank
        if (marks <= upper.marks && marks >= lower.marks) {
            const ratio = (upper.marks - marks) / (upper.marks - lower.marks)
            return Math.round(upper.rank + ratio * (lower.rank - upper.rank))
        }
    }

    return 5000 // fallback
}

// ---------------------------------------------------------------------------
// Core prediction logic (shared)
// ---------------------------------------------------------------------------

function buildResults(
    relevant: Prediction[],
    rank: number,
    groupKey: (p: Prediction) => string
): CollegeResult[] {
    const collegeMap = new Map<string, { latest: Prediction; historical: { year: number; rank: number }[] }>()

    relevant.forEach((p) => {
        const key = groupKey(p)
        if (!collegeMap.has(key)) {
            collegeMap.set(key, { latest: p, historical: [] })
        }
        const entry = collegeMap.get(key)!
        entry.historical.push({ year: p.year, rank: p.closing_rank })
        if (p.year > entry.latest.year || (p.year === entry.latest.year && p.round > entry.latest.round)) {
            entry.latest = p
        }
    })

    const results: CollegeResult[] = []

    collegeMap.forEach(({ latest, historical }) => {
        const closingRank = latest.closing_rank
        const ratio = rank / closingRank
        let probability: number
        let zone: "safe" | "moderate" | "risky"

        if (ratio <= 0.7) {
            probability = 98
            zone = "safe"
        } else if (ratio <= 0.9) {
            probability = Math.round(98 - (ratio - 0.7) * 150)
            zone = "safe"
        } else if (ratio <= 1.0) {
            probability = Math.round(68 - (ratio - 0.9) * 200)
            zone = "moderate"
        } else if (ratio <= 1.15) {
            probability = Math.round(48 - (ratio - 1.0) * 200)
            zone = "risky"
        } else {
            probability = Math.max(5, Math.round(18 - (ratio - 1.15) * 30))
            zone = "risky"
        }

        probability = Math.max(2, Math.min(99, probability))

        const sorted = historical.sort((a, b) => a.year - b.year)
        let trend: "up" | "stable" | "down" = "stable"
        if (sorted.length >= 2) {
            const diff = sorted[sorted.length - 1].rank - sorted[sorted.length - 2].rank
            if (diff > 50) trend = "up"
            else if (diff < -50) trend = "down"
        }

        results.push({
            college: latest.college,
            branch: latest.branch,
            category: latest.category,
            closingRank,
            probability,
            zone,
            trend,
            historical: sorted,
        })
    })

    return results.sort((a, b) => b.probability - a.probability)
}

// ---------------------------------------------------------------------------
// Public predict functions
// ---------------------------------------------------------------------------

/**
 * Predict colleges by rank + category + branch (or all branches).
 * Pass ALL_BRANCHES_VALUE for branch to see all branches.
 */
export function predictColleges(
    rank: number,
    category: string,
    branch: string
): CollegeResult[] {
    const relevant = predictions.filter(
        (p) =>
            p.category === category &&
            (branch === ALL_BRANCHES_VALUE || p.branch === branch) &&
            p.seat_type === "EXCLUDING 5%"
    )

    // When all branches: group by college+branch so each college×branch is its own row
    const groupKey = branch === ALL_BRANCHES_VALUE
        ? (p: Prediction) => `${p.college}||${p.branch}`
        : (p: Prediction) => p.college

    return buildResults(relevant, rank, groupKey)
}

/**
 * Predict colleges by marks (converts marks → estimated rank first).
 * Pass ALL_BRANCHES_VALUE for branch to see all branches.
 */
export function predictCollegesByMarks(
    marks: number,
    category: string,
    branch: string
): { results: CollegeResult[]; estimatedRank: number } {
    const estimatedRank = estimateRankFromMarks(marks)
    const results = predictColleges(estimatedRank, category, branch)
    return { results, estimatedRank }
}

export function formatRank(rank: number): string {
    if (rank >= 1000) {
        return rank.toLocaleString("en-IN")
    }
    return rank.toString()
}