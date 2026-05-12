import re

with open("app/api/admin/tests/route.ts", "r") as f:
    content = f.read()

# Add Zod import
if "import { z }" not in content:
    content = 'import { testCreationSchema } from "../../../../lib/validations";\n' + content

# Replace the manual JSON parsing with Zod parsing
old_parse = """  const { title, duration, requiredTier, examType, questions } = await req.json();

  if (!title || !questions || !questions.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }"""

new_parse = """  const body = await req.json();
  const parsed = testCreationSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  
  const { title, duration, requiredTier, examType, questions } = parsed.data;"""

content = content.replace(old_parse, new_parse)

with open("app/api/admin/tests/route.ts", "w") as f:
    f.write(content)
