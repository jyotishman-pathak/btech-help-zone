import re

with open("app/(dashboard)/cee/mock/[id]/page.tsx", "r") as f:
    content = f.read()

# Replace zinc
content = content.replace('zinc-', 'slate-')
content = content.replace('bg-slate-50 dark:bg-slate-950', 'bg-[#F7F5FF] dark:bg-[#0D0B1A]')

with open("app/(dashboard)/cee/mock/[id]/page.tsx", "w") as f:
    f.write(content)
