import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";

const configuredEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const admins = (configuredEmails.length > 0
  ? configuredEmails
  : ["superadmin@example.com", "admin@example.com"]
).map((email, index) => ({
  email,
  fullName: index === 0 ? "Super Admin" : "Admin",
  temporaryPassword: "ChangeMe123!",
  role: index === 0 ? "super_admin" : "event_admin",
}));

async function main() {
  for (const admin of admins) {
    const email = admin.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(admin.temporaryPassword, 10);

    const adminUser = await prisma.adminUser.upsert({
      where: { email },
      update: {
        fullName: admin.fullName,
        passwordHash,
        mustChangePassword: true,
        role: admin.role,
        isActive: true,
      },
      create: {
        email,
        fullName: admin.fullName,
        passwordHash,
        mustChangePassword: true,
        role: admin.role,
        isActive: true,
      },
    });

    console.log("Admin user saved:", adminUser.email);
    console.log("Temporary password:", admin.temporaryPassword);
  }
}

main()
  .catch((error) => {
    console.error("Script failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });