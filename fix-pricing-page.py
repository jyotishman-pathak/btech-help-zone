with open("app/(dashboard)/student/pricing/page.tsx", "r") as f:
    content = f.read()

# Update names and prices
content = content.replace('name: "Premium",\n    price: 499,', 'name: "Intensive",\n    price: 399,')
content = content.replace('name: "Elite",\n    price: 999,', 'name: "Elite",\n    price: 899,')

# Update comparison table names
content = content.replace('premium: "Unlimited"', 'intensive: "Unlimited"')
content = content.replace('premium: "All subjects"', 'intensive: "All subjects"')
content = content.replace('premium: "Charts + trajectory"', 'intensive: "Dashboard performance"')
content = content.replace('premium: "✓"', 'intensive: "✓"')
content = content.replace('premium: "—"', 'intensive: "—"')
content = content.replace('premium: "Email"', 'intensive: "Email"')

# Update Table Headers
content = content.replace('label: "Premium"', 'label: "Intensive"')

# Update the features list for Free
free_features_old = """      { text: "1 full mock test", included: true },
      { text: "Basic PYQs (Physics only)", included: true },
      { text: "CEE countdown timer", included: true },
      { text: "Subject progress tracker", included: true },
      { text: "All mock tests", included: false },
      { text: "All PYQs — all subjects", included: false },
      { text: "Score analytics & charts", included: false },
      { text: "Leaderboard access", included: false },
      { text: "College predictor", included: false },
      { text: "AI topic radar", included: false },
      { text: "1v1 Battle Arena", included: false },"""

free_features_new = """      { text: "1 CEE PYQ paper", included: true },
      { text: "No notes provided", included: true },
      { text: "1 Full Mock Test", included: true },
      { text: "Community doubt board", included: true },
      { text: "Syllabus section", included: true },
      { text: "Unlimited PYQs", included: false },
      { text: "Dashboard performance", included: false },
      { text: "Email support", included: false },
      { text: "Live weekend doubt sessions", included: false },"""

content = content.replace(free_features_old, free_features_new)

# Update features for Intensive
premium_features_old = """      { text: "Unlimited mock tests", included: true },
      { text: "All PYQs — all subjects & years", included: true },
      { text: "CEE countdown timer", included: true },
      { text: "Subject progress tracker", included: true },
      { text: "Score trajectory charts", included: true },
      { text: "Leaderboard access", included: true },
      { text: "College predictor (AEC, JEC, BBEC)", included: true },
      { text: "Bilingual (English + Assamese)", included: true },
      { text: "AI topic radar", included: false },
      { text: "1v1 Battle Arena", included: false },
      { text: "Priority support", included: false },"""

premium_features_new = """      { text: "Unlimited CEE PYQs & solutions", included: true },
      { text: "No formula sheets", included: true },
      { text: "5 Mock Tests / month", included: true },
      { text: "Dashboard performance", included: true },
      { text: "Email support", included: true },
      { text: "Live weekend doubt sessions", included: false },
      { text: "Personalized weekly study planner", included: false },
      { text: "1:1 strategy call with toppers", included: false },"""

content = content.replace(premium_features_old, premium_features_new)

# Update features for Elite
elite_features_old = """      { text: "Everything in Premium", included: true },
      { text: "AI-powered topic strength radar", included: true },
      { text: "Weakness prediction engine", included: true },
      { text: "1v1 live Battle Arena", included: true },
      { text: "Personalised study plan", included: true },
      { text: "Priority WhatsApp support", included: true },
      { text: "Early access to new content", included: true },
      { text: "Doubt solving sessions (2/month)", included: true },
      { text: "All future features free", included: true },
      { text: "Performance report PDF", included: true },
      { text: "Parent dashboard access", included: true },"""

elite_features_new = """      { text: "Everything in Intensive", included: true },
      { text: "Live weekend doubt sessions", included: true },
      { text: "Personalized weekly study planner", included: true },
      { text: "1:1 strategy call with toppers", included: true },
      { text: "Priority doubt resolution (<6 hrs)", included: true },
      { text: "College counseling guide", included: true },"""

content = content.replace(elite_features_old, elite_features_new)

content = content.replace('Upgrade to Premium — ₹499/mo', 'Upgrade to Intensive — ₹399/semester')
content = content.replace('/month', '/semester')

with open("app/(dashboard)/student/pricing/page.tsx", "w") as f:
    f.write(content)
