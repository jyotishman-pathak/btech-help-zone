import re

with open("app/api/tests/[id]/attempt/route.ts", "r") as f:
    content = f.read()

if "import { z }" not in content:
    content = 'import { attemptSubmissionSchema } from "../../../../../lib/validations";\n' + content

old_parse = """  const { answers } = await req.json();

  if (!answers) {
    return NextResponse.json({ error: "Answers required" }, { status: 400 });
  }"""

new_parse = """  const body = await req.json();
  const parsed = attemptSubmissionSchema.safeParse({ testId: id, answers: body.answers });
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  
  const { answers } = parsed.data;"""

content = content.replace(old_parse, new_parse)

with open("app/api/tests/[id]/attempt/route.ts", "w") as f:
    f.write(content)
