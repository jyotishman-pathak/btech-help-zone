with open("components/PremiumPlans.tsx", "r") as f:
    content = f.read()

# Add overflow-visible and flex flex-col to card
content = content.replace(
    '<Card className={`relative h-full border-slate-200/70',
    '<Card className={`relative h-full flex flex-col overflow-visible border-slate-200/70'
)

# Add flex-1 to CardContent
content = content.replace(
    '<CardContent>',
    '<CardContent className="flex-1">'
)

# Move the top margin of the badge slightly down or fix it so it looks better, but overflow-visible should fix the clipping.
content = content.replace(
    '-top-3',
    '-top-4'
)

with open("components/PremiumPlans.tsx", "w") as f:
    f.write(content)
