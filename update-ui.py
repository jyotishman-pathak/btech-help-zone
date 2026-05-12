import os
import glob

files = [
    "components/dashboard/AdminTestCreator.tsx",
    "components/dashboard/MocksShell.tsx",
    "components/Hero.tsx",
    "components/FeaturedSubjects.tsx",
    "components/PremiumBenefits.tsx",
    "components/CEECTA.tsx",
    "components/PremiumPlans.tsx",
    "components/Navbar.tsx",
    "components/Footer.tsx"
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        content = f.read()
    
    # Generic zinc to slate
    content = content.replace('zinc-', 'slate-')
    
    # Specific AI theme replacements
    content = content.replace('bg-zinc-50 dark:bg-zinc-950', 'bg-[#F7F5FF] dark:bg-[#0D0B1A]')
    content = content.replace('bg-white dark:bg-zinc-900', 'bg-white dark:bg-[#12101F]')
    
    # Premium borders
    content = content.replace('border-slate-200 dark:border-slate-800', 'border-slate-200/70 dark:border-slate-700/50')
    content = content.replace('border-slate-200 dark:border-slate-700', 'border-slate-200/70 dark:border-slate-700/50')
    
    with open(file, 'w') as f:
        f.write(content)

