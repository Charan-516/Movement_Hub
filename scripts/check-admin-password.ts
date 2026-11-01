import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";

async function main() {
  const email = "superadmin@weke.com";
  const passwordToTest = "ChangeMe123!";

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  console.log("Admin found:", !!admin);
  console.log("Email:", admin?.email);
  console.log("Active:", admin?.isActive);
  console.log("Must change password:", admin?.mustChangePassword);

  if (admin) {
    console.log(
      "Password matches:",
      await bcrypt.compare(passwordToTest, admin.passwordHash)
    );
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});