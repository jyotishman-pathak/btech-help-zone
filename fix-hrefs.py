with open("components/PremiumPlans.tsx", "r") as f:
    content = f.read()

content = content.replace('href: "/checkout/intensive"', 'href: "/student/pricing"')
content = content.replace('href: "/checkout/elite"', 'href: "/student/pricing"')
content = content.replace('href: "/auth/signup"', 'href: "/register"')

with open("components/PremiumPlans.tsx", "w") as f:
    f.write(content)
