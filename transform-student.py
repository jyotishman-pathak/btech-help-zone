with open("components/dashboard/dashboard-shell.tsx", "r") as f:
    content = f.read()

# Fix background colors for SaaS look
content = content.replace('bg-zinc-50 dark:bg-zinc-950', 'bg-[#F7F5FF] dark:bg-[#0D0B1A]')
content = content.replace('bg-white dark:bg-zinc-900', 'bg-white dark:bg-[#12101F]')
content = content.replace('border-zinc-200 dark:border-zinc-800', 'border-slate-200/70 dark:border-slate-700/50')
content = content.replace('border-zinc-200 dark:border-zinc-700', 'border-slate-200/70 dark:border-slate-700/50')
content = content.replace('border-zinc-300 dark:border-zinc-600', 'border-slate-300 dark:border-slate-600')

# Card Header borders
content = content.replace('border-b border-zinc-200 dark:border-zinc-800', 'border-b border-slate-100 dark:border-slate-800')

# General zinc -> slate
content = content.replace('zinc-', 'slate-')

# Change some specific elements to be more colourful than pure black/white/slate
content = content.replace('bg-slate-900 text-white dark:bg-white dark:text-slate-900', 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md border-none')
content = content.replace('bg-slate-900 hover:bg-slate-800 text-white', 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md border-none')
content = content.replace('bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900', 'bg-gradient-to-br from-indigo-950 to-violet-950 text-white shadow-xl border-none ring-1 ring-indigo-500/20')

with open("components/dashboard/dashboard-shell.tsx", "w") as f:
    f.write(content)
