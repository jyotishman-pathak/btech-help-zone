with open("components/dashboard/student-dash/dashboard-sidebar.tsx", "r") as f:
    content = f.read()

# Update theme
content = content.replace('bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800', 'bg-[#F7F5FF] dark:bg-[#0D0B1A] border-r border-slate-200/70 dark:border-slate-700/50')
content = content.replace('bg-zinc-900 text-white dark:bg-white dark:text-zinc-900', 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20')
content = content.replace('text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900', 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-[#12101F]/60')
content = content.replace('zinc-', 'slate-')

with open("components/dashboard/student-dash/dashboard-sidebar.tsx", "w") as f:
    f.write(content)
