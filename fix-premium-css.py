with open("components/PremiumPlans.tsx", "r") as f:
    content = f.read()

# Fix Section Background and overflow
content = content.replace(
    '<section className="relative py-24 bg-white dark:bg-slate-950 overflow-hidden">',
    '<section className="relative py-32 bg-[#F7F5FF] dark:bg-[#0D0B1A]">'
)

# Fix Card backgrounds
content = content.replace(
    'border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900',
    'border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]'
)

# Fix popular plan highlight (Intensive)
content = content.replace(
    '${plan.popular ? "shadow-xl ring-1 ring-slate-900/10 dark:ring-white/10 md:scale-105 z-10" : "shadow-sm"}',
    '${plan.popular ? "shadow-2xl ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 md:scale-105 z-10 bg-gradient-to-b from-white to-indigo-50/30 dark:from-[#12101F] dark:to-indigo-950/20" : "shadow-sm"}'
)

content = content.replace(
    'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm',
    'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
)

# CTA button
content = content.replace(
    '${plan.popular ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}',
    '${plan.popular ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/25" : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}'
)

# Remove the Crown icon import replacement if not needed, wait Crown is from lucide-react. Let's make sure it has Crown. It does.
# But let's change Crown color.
content = content.replace(
    '<Crown className="w-3 h-3 mr-1" />',
    '<Crown className="w-4 h-4 mr-1 text-amber-400" />'
)


with open("components/PremiumPlans.tsx", "w") as f:
    f.write(content)
