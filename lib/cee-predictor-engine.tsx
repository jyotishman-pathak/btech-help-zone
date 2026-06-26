


import {
    CEE_STATIC_DATA,
    type CollegeData,
    type BranchData,
    type HistoricalRound,
    type Projection2026,
} from "./data";

export type Mode = "rank" | "marks";

export type Tier = "Qualifies" | "Borderline";

export interface BranchVerdict {
    branchName: string;
    tier: Tier;
    referenceRound: HistoricalRound; // the round the verdict was judged against
    history: HistoricalRound[]; // full history for this branch+category, oldest first
    projection2026: Projection2026;
}

export interface CollegeVerdict {
    id: string;
    name: string;
    shortName: string;
    city: string;
    bestTier: Tier; // best tier among its branches, for sorting/badging
    branches: BranchVerdict[];
}

const BORDERLINE_CUSHION = 0.12; // 12%

function pickReferenceRound(history: HistoricalRound[]): HistoricalRound {
    // prefer 2025, then highest round number that year; otherwise latest year/round available
    const sorted = [...history].sort((a, b) =>
        a.year !== b.year ? b.year - a.year : b.round - a.round
    );
    return sorted[0];
}

function classify(
    mode: Mode,
    value: number,
    reference: HistoricalRound
): Tier | null {
    if (mode === "rank") {
        const cutoff = reference.closingRank;
        if (value <= cutoff) return "Qualifies";
        if (value <= cutoff * (1 + BORDERLINE_CUSHION)) return "Borderline";
        return null;
    } else {
        const cutoff = reference.cutoffMarks;
        if (cutoff == null) return null;
        if (value >= cutoff) return "Qualifies";
        if (value >= cutoff * (1 - BORDERLINE_CUSHION)) return "Borderline";
        return null;
    }
}

const TIER_RANK: Record<Tier, number> = { Qualifies: 0, Borderline: 1 };

export function predict(
    mode: Mode,
    value: number,
    category: string
): CollegeVerdict[] {
    const out: CollegeVerdict[] = [];

    for (const college of CEE_STATIC_DATA as readonly CollegeData[]) {
        const branchVerdicts: BranchVerdict[] = [];

        for (const branch of college.branches as readonly BranchData[]) {
            const catData = branch.categories[category];
            if (!catData || catData.history.length === 0) continue;

            const reference = pickReferenceRound(catData.history);
            const tier = classify(mode, value, reference);
            if (!tier) continue;

            branchVerdicts.push({
                branchName: branch.branchName,
                tier,
                referenceRound: reference,
                history: [...catData.history].sort((a, b) =>
                    a.year !== b.year ? a.year - b.year : a.round - b.round
                ),
                projection2026: catData.projection2026,
            });
        }

        if (branchVerdicts.length === 0) continue;

        branchVerdicts.sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);
        const bestTier = branchVerdicts[0].tier;

        out.push({
            id: college.id,
            name: college.name,
            shortName: college.shortName,
            city: college.city,
            bestTier,
            branches: branchVerdicts,
        });
    }

    out.sort((a, b) => TIER_RANK[a.bestTier] - TIER_RANK[b.bestTier]);
    return out;
}

/** All category keys that actually exist in the dataset, for building a <select>. */
export function listCategories(): string[] {
    const set = new Set<string>();
    for (const college of CEE_STATIC_DATA as readonly CollegeData[]) {
        for (const branch of college.branches as readonly BranchData[]) {
            Object.keys(branch.categories).forEach((c) => set.add(c));
        }
    }
    return Array.from(set);
}