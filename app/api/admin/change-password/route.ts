import { getSessionEmail } from "@/lib/session";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const adminEmail = await getSessionEmail(request);

  if (!adminEmail) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  const passwordIsValid =
    newPassword.length >= 8 &&
    /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];']/g.test(newPassword);

    if (!passwordIsValid) {
    return NextResponse.json(
        {
        error:
            "Password must be at least 8 characters and contain at least one special character.",
        },
        { status: 400 }
    );
    }

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: decodeURIComponent(adminEmail).toLowerCase() },
  });

  if (!adminUser) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const currentPasswordIsValid = await bcrypt.compare(
    currentPassword,
    adminUser.passwordHash
  );

  if (!currentPasswordIsValid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.adminUser.update({
    where: { email: adminUser.email },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ success: true });
}