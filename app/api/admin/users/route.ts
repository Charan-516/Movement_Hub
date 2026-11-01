import { randomInt } from "crypto";
import { getSessionEmail } from "@/lib/session";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

function generateTemporaryPassword() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";

  for (let index = 0; index < 12; index++) {
    password += characters[randomInt(characters.length)];
  }

  return password;
}

async function getCurrentAdmin(request: Request) {
  const adminEmail = await getSessionEmail(request);

  if (!adminEmail) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: {
      email: decodeURIComponent(adminEmail).toLowerCase(),
    },
  });
}

export async function POST(request: Request) {
  const currentAdmin = await getCurrentAdmin(request);

  if (!currentAdmin || currentAdmin.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only super admins can create admin accounts." },
      { status: 403 }
    );
  }
  
  const body = await request.json();

  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const role = String(body.role || "event_admin");

  if (!fullName || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }

  if (role !== "event_admin") {
  return NextResponse.json(
    { error: "Only Event Admin accounts can be created." },
    { status: 400 }
  );
}

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    return NextResponse.json(
      { error: "An admin account already exists for this email." },
      { status: 409 }
    );
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  const adminUser = await prisma.adminUser.create({
    data: {
      fullName,
      email,
      role,
      passwordHash,
      mustChangePassword: true,
      isActive: true,
    },
  });

  return NextResponse.json(
    {
      adminUser: {
        id: adminUser.id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role,
      },
      temporaryPassword,
    },
    { status: 201 }
  );
}

export async function GET(request: Request) {
  const currentAdmin = await getCurrentAdmin(request);

  if (!currentAdmin) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const admins = await prisma.adminUser.findMany({
    where: {
      isActive: true,
      role: "event_admin",
    },
    orderBy: {
      fullName: "asc",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  return NextResponse.json(admins);
}