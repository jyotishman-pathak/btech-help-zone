import re

files = ["app/(main)/error.tsx", "app/(main)/not-found.tsx"]

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # Replace zinc
    content = content.replace('zinc-', 'slate-')
    content = content.replace('bg-slate-50 dark:bg-slate-950', 'bg-[#F7F5FF] dark:bg-[#0D0B1A]')

    with open(file, "w") as f:
        f.write(content)
