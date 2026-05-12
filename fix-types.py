import os
import glob

api_files = glob.glob('app/api/**/*.ts', recursive=True) + glob.glob('app/api/**/*.tsx', recursive=True)

for file in api_files:
    with open(file, 'r') as f:
        content = f.read()
    
    content = content.replace('(session?.user as any)?.role', 'session?.user?.role')
    content = content.replace('(session.user as any).role', 'session?.user?.role')
    content = content.replace('(session.user as any).tier', 'session?.user?.tier')
    content = content.replace('(session.user as any).id', 'session?.user?.id')
    content = content.replace('tier: tier as any', 'tier: tier as any') # skip this one, it's just enum cast
    content = content.replace('answers: answers as any', 'answers: answers as any') # skip this one too, Prisma JSON cast
    
    with open(file, 'w') as f:
        f.write(content)
