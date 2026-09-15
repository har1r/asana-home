const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  const targetId = "6aa4bc3f44bbd4845915a53f"; // Bundle [4]

  console.log("--- 1. Query by ID with NO applications filter ---");
  const q1 = await prisma.bundle.findMany({
    where: { id: targetId, status: "LOCKED", currentManifestId: null }
  });
  console.log("Q1 result count:", q1.length);

  console.log("--- 2. Query with `applications: { some: {} }` ---");
  const q2 = await prisma.bundle.findMany({
    where: { id: targetId, applications: { some: {} } }
  });
  console.log("Q2 result count:", q2.length);

  console.log("--- 3. Query with `applications: { none: { status: { not: 'ARCHIVED' } } }` ---");
  const q3 = await prisma.bundle.findMany({
    where: { id: targetId, applications: { none: { status: { not: "ARCHIVED" } } } }
  });
  console.log("Q3 result count:", q3.length);

  console.log("--- 4. Query with `applications: { every: { status: 'ARCHIVED' } }` ---");
  const q4 = await prisma.bundle.findMany({
    where: { id: targetId, applications: { every: { status: "ARCHIVED" } } }
  });
  console.log("Q4 result count:", q4.length);
}

main().finally(() => prisma.$disconnect());
