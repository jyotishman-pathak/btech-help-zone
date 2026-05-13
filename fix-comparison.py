with open("app/(dashboard)/student/pricing/page.tsx", "r") as f:
    content = f.read()

# Fix COMPARISON_FEATURES object keys
content = content.replace('free: "1", premium: "Unlimited", elite: "Unlimited"', 'free: "1", intensive: "5", elite: "5"')
content = content.replace('free: "Limited", premium: "All subjects", elite: "All subjects"', 'free: "1 paper", intensive: "Unlimited", elite: "Unlimited"')
content = content.replace('free: "—", premium: "Charts + trajectory", elite: "AI-powered"', 'free: "—", intensive: "Dashboard performance", elite: "Advanced analytics"')
content = content.replace('free: "—", premium: "✓", elite: "✓"', 'free: "—", intensive: "✓", elite: "✓"')
content = content.replace('free: "—", premium: "—", elite: "✓"', 'free: "—", intensive: "—", elite: "✓"')
content = content.replace('free: "Community", premium: "Email", elite: "WhatsApp Priority"', 'free: "Community", intensive: "Email", elite: "Priority (<6 hrs)"')

# Fix table row destructuring
content = content.replace('row.premium', 'row.intensive')

with open("app/(dashboard)/student/pricing/page.tsx", "w") as f:
    f.write(content)
