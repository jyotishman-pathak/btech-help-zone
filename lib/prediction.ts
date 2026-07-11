import data from "../public/data/predictions.json"

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

export function predictColleges(
    rank: number,
    category: string,
    branch: string
): CollegeResult[] {
    // Get all historical data for this category + branch
    const relevant = predictions.filter(
        (p) => p.category === category && p.branch === branch && p.seat_type === "EXCLUDING 5%"
    )

    // Group by college, take latest year's rank
    const collegeMap = new Map<string, { latest: Prediction; historical: { year: number; rank: number }[] }>()

    relevant.forEach((p) => {
        if (!collegeMap.has(p.college)) {
            collegeMap.set(p.college, { latest: p, historical: [] })
        }
        const entry = collegeMap.get(p.college)!
        entry.historical.push({ year: p.year, rank: p.closing_rank })
        if (p.year > entry.latest.year || (p.year === entry.latest.year && p.round > entry.latest.round)) {
            entry.latest = p
        }
    })

    const results: CollegeResult[] = []

    collegeMap.forEach(({ latest, historical }) => {
        const closingRank = latest.closing_rank

        // Calculate probability using a smooth sigmoid-like function
        // If rank < closingRank: high probability
        // If rank > closingRank: drops off
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

        // Trend calculation
        const sorted = historical.sort((a, b) => a.year - b.year)
        let trend: "up" | "stable" | "down" = "stable"
        if (sorted.length >= 2) {
            const diff = sorted[sorted.length - 1].rank - sorted[sorted.length - 2].rank
            if (diff > 50) trend = "up"    // cutoff increased = more competitive
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

export function formatRank(rank: number): string {
    if (rank >= 1000) {
        return rank.toLocaleString("en-IN")
    }
    return rank.toString()
}