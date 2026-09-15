const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== TEST FULL QUERY WITH MONGODB isSet: false ===");
  const list = await prisma.bundle.findMany({
    where: {
      status: "LOCKED",
      OR: [
        { currentManifestId: null },
        { currentManifestId: { isSet: false } }
      ],
      applications: {
        some: {},
        none: {
          status: { not: "ARCHIVED" }
        }
      }
    },
    select: {
      id: true,
      bundleNumber: true,
      applicationType: true,
      status: true,
      createdAt: true,
      applications: {
        select: {
          targetData: true
        }
      }
    }
  });

  console.log("Final query matched count:", list.length);
  console.log("Matched bundles:", list);
}

main().finally(() => prisma.$disconnect());
