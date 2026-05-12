with open("components/dashboard/dashboard-shell.tsx", "r") as f:
    content = f.read()

# Make cards have rounded-2xl to give them a premium shape
content = content.replace('<Card className="', '<Card className="rounded-2xl ')

with open("components/dashboard/dashboard-shell.tsx", "w") as f:
    f.write(content)
