export type Mode = "marks" | "rank";
export type HistoryPoint = { year: number; value: number };
export type Tier = "Highly Likely" | "Likely" | "Borderline" | "Unlikely";

export type Projection = {
    predictedValue: number;
    volatility: number;
    confidence: "high" | "low";
};

// Projects this cycle's likely cutoff from history for ONE (college, branch, round) group.
// Same regression math works for rank and marks — only classify() below cares about direction.
export function projectCutoff(history: HistoryPoint[]): Projection {
    const sorted = [...history].sort((a, b) => a.year - b.year);
    const values = sorted.map(h => h.value);
    const latest = sorted[sorted.length - 1].value;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const volatility = Math.sqrt(variance);

    // Static mode: just use the latest year's cutoff as the prediction.
    // We enforce a minimum volatility of 5% of the value so the bands aren't too thin.
    return { 
        predictedValue: latest, 
        volatility: Math.max(volatility, latest * 0.05), 
        confidence: sorted.length >= 3 ? "high" : "low" 
    };
}

export function classify(mode: Mode, userValue: number, p: Projection): { tier: Tier; color: string; margin: number } {
    // marks: higher than predicted = good. rank: lower than predicted = good.
    const margin = mode === "marks" ? userValue - p.predictedValue : p.predictedValue - userValue;
    
    let baseBand = p.volatility;
    if (mode === "marks") {
        baseBand = Math.max(baseBand, 10); // At least a 10 mark buffer
    } else {
        baseBand = Math.max(baseBand, 500); // At least a 500 rank buffer
    }

    const band = p.confidence === "high" ? baseBand : baseBand * 1.5;

    if (margin > band) return { tier: "Highly Likely", color: "emerald", margin };
    if (margin > 0) return { tier: "Likely", color: "sky", margin };
    if (margin > -band) return { tier: "Borderline", color: "amber", margin };
    return { tier: "Unlikely", color: "rose", margin };
}

export const TIER_PRIORITY: Record<Tier, number> = {
    "Highly Likely": 0, "Likely": 1, "Borderline": 2, "Unlikely": 3,
};