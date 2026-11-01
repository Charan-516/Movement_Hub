import { getSessionEmail } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    eventId: string;
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

export async function PUT(request: Request, context: RouteContext) {
  const currentAdmin = await getCurrentAdmin(request);

  if (!currentAdmin || currentAdmin.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only super admins can assign admins to events." },
      { status: 403 }
    );
  }

  const { eventId } = await context.params;
  const id = Number(eventId);

  if (!id) {
    return NextResponse.json(
      { error: "Invalid event ID." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const adminIds: number[] = Array.isArray(body.adminIds)
    ? body.adminIds.map(Number).filter(Boolean)
    : [];

  await prisma.eventAdminAssignment.deleteMany({
    where: {
      eventId: id,
    },
  });

  if (adminIds.length > 0) {
    await prisma.eventAdminAssignment.createMany({
      data: adminIds.map((adminId: number) => ({
        eventId: id,
        adminId,
        })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ success: true });
}