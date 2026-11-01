import { getSessionEmail } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    adminId: string;
  }>;
};

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

export async function PATCH(request: Request, context: RouteContext) {
  const currentAdmin = await getCurrentAdmin(request);

  if (!currentAdmin || currentAdmin.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only super admins can update admin roles." },
      { status: 403 }
    );
  }

  const { adminId } = await context.params;
  const id = Number(adminId);

  if (!id) {
    return NextResponse.json(
      { error: "Invalid admin ID." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const role = String(body.role || "");

  if (!["event_admin", "super_admin"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role." },
      { status: 400 }
    );
  }

  const targetAdmin = await prisma.adminUser.findUnique({
    where: { id },
  });

  if (!targetAdmin) {
    return NextResponse.json(
      { error: "Admin user not found." },
      { status: 404 }
    );
  }

  if (
    targetAdmin.id === currentAdmin.id &&
    targetAdmin.role === "super_admin" &&
    role !== "super_admin"
  ) {
    const superAdminCount = await prisma.adminUser.count({
      where: {
        role: "super_admin",
        isActive: true,
      },
    });

    if (superAdminCount <= 1) {
      return NextResponse.json(
        {
          error:
            "You cannot remove your own Super Admin role while you are the only active Super Admin.",
        },
        { status: 400 }
      );
    }
  }

  const updatedAdmin = await prisma.adminUser.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
    },
  });

  return NextResponse.json(updatedAdmin);
}