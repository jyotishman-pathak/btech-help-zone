import prisma from "../prisma.client";

async function main() {
  const subjects = [
    { name: "Physics", category: "Science", weightage: 35 },
    { name: "Chemistry", category: "Science", weightage: 35 },
    { name: "Mathematics", category: "Science", weightage: 30 },
    { name: "PYQ", category: "General", weightage: 0 },
  ];

  for (const subject of subjects) {
    const existing = await prisma.subject.findFirst({
      where: { name: subject.name },
    });

    if (!existing) {
      await prisma.subject.create({ data: subject });
      console.log(`✅ Created: ${subject.name}`);
    } else {
      console.log(`⏭️ Already exists: ${subject.name}`);
    }
  }

  console.log("✅ Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());