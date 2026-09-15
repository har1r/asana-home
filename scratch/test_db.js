const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const bundles = await prisma.bundle.findMany({
    include: { applications: true }
  });
  console.log("=== ALL BUNDLES IN DATABASE ===");
  bundles.forEach((b, i) => {
    console.log(`[${i+1}] ID: ${b.id}`);
    console.log(`    Number: ${b.bundleNumber}`);
    console.log(`    Status: ${b.status}`);
    console.log(`    currentManifestId: ${b.currentManifestId}`);
    console.log(`    Apps count: ${b.applications.length}`);
    b.applications.forEach(a => {
      console.log(`      -> App ID: ${a.id}, status: ${a.status}`);
    });
  });
}

main().finally(() => prisma.$disconnect());
