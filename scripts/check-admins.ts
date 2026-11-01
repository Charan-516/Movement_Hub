import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
  const admins = await prisma.adminUser.findMany();

  console.log("Admin users found:");
  console.log(admins);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });