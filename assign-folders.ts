import prisma from "./lib/prisma.client";

async function main() {
  console.log("Creating default folders...");

  const folderNames = [
    { name: "Physics", order: 1 },
    { name: "Chemistry", order: 2 },
    { name: "Maths", order: 3 },
    { name: "Full Length", order: 4 },
  ];

  const folderMap: Record<string, string> = {};

  for (const f of folderNames) {
    let folder = await prisma.mockTestFolder.findFirst({ where: { name: f.name } });
    if (!folder) {
      folder = await prisma.mockTestFolder.create({ data: { name: f.name, order: f.order } });
    }
    folderMap[f.name.toLowerCase()] = folder.id;
  }

  console.log("Fetching tests...");
  const tests = await prisma.mockTest.findMany({ where: { deletedAt: null } });

  let updatedCount = 0;

  for (const test of tests) {
    const title = test.title.toLowerCase();
    let targetFolderId = null;

    if (title.includes("physics") || title.includes("phy")) {
      targetFolderId = folderMap["physics"];
    } else if (title.includes("chemistry") || title.includes("chem")) {
      targetFolderId = folderMap["chemistry"];
    } else if (title.includes("maths") || title.includes("mathematics") || title.includes("math")) {
      targetFolderId = folderMap["maths"];
    } else if (title.includes("full") || title.includes("complete")) {
      targetFolderId = folderMap["full length"];
    }

    if (targetFolderId && test.folderId !== targetFolderId) {
      await prisma.mockTest.update({
        where: { id: test.id },
        data: { folderId: targetFolderId },
      });
      updatedCount++;
      console.log(`Assigned "${test.title}" -> ${Object.keys(folderMap).find(k => folderMap[k] === targetFolderId)}`);
    }
  }

  console.log(`Successfully mapped ${updatedCount} tests!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
