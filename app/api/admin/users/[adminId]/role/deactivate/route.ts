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

  if (!adminEmail) return null;

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
      { error: "Only super admins can remove admin users." },
      { status: 403 }
    );
  }

  const { adminId } = await context.params;
  const id = Number(adminId);

  if (!id) {
    return NextResponse.json({ error: "Invalid admin ID." }, { status: 400 });
  }

  if (currentAdmin.id === id) {
    return NextResponse.json(
      { error: "You cannot deactivate your own admin account." },
      { status: 400 }
    );
  }

  const updatedAdmin = await prisma.adminUser.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return NextResponse.json({ success: true, admin: updatedAdmin });
}