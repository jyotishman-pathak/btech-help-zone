type Props = {
    probability: number
    zone: "safe" | "moderate" | "risky"
}

export function ProbabilityIndicator({ probability, zone }: Props) {
    const colors = {
        safe: {
            text: "text-emerald-400",
            bg: "bg-emerald-500/10",
            ring: "ring-emerald-500/20",
            bar: "bg-emerald-500",
        },
        moderate: {
            text: "text-amber-400",
            bg: "bg-amber-500/10",
            ring: "ring-amber-500/20",
            bar: "bg-amber-500",
        },
        risky: {
            text: "text-rose-400",
            bg: "bg-rose-500/10",
            ring: "ring-rose-500/20",
            bar: "bg-rose-500",
        },
    }

    const c = colors[zone]

    return (
        <div className="flex flex-col items-end gap-1.5">
            <div className={`flex items-baseline gap-0.5 ${c.text}`}>
                <span className="text-2xl font-bold tabular-nums tracking-tight">{probability}</span>
                <span className="text-xs font-medium">%</span>
            </div>

            {/* Progress bar */}
            <div className={`w-20 h-1 rounded-full ${c.bg} overflow-hidden`}>
                <div
                    className={`h-full ${c.bar} transition-all duration-500`}
                    style={{ width: `${probability}%` }}
                />
            </div>

            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                {zone}
            </div>
        </div>
    )
}