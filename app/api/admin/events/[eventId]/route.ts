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

  if (!adminEmail) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: {
      email: decodeURIComponent(adminEmail).toLowerCase(),
    },
  });
}

async function canManageEvent(request: Request, eventId: number) {
  const adminUser = await getCurrentAdmin(request);

  if (!adminUser) {
    return false;
  }

  if (adminUser.role === "super_admin") {
    return true;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      createdByAdminId: true,
      adminAssignments: {
        where: {
          adminId: adminUser.id,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!event) {
    return false;
  }

  return (
    event.createdByAdminId === adminUser.id ||
    event.adminAssignments.length > 0
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  const id = Number(eventId);

  if (!id) {
    return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      adminAssignments: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const id = Number(eventId);

    if (!id) {
      return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });
    }

    const hasPermission = await canManageEvent(request, id);

if (!hasPermission) {
  return NextResponse.json(
    { error: "You do not have permission to edit this event." },
    { status: 403 }
  );
}

    const body = await request.json();

    const title = String(body.title || "").trim();
    const date = String(body.date || "").trim();
    const startTime = String(body.startTime || "").trim();
    const endTime = String(body.endTime || "").trim();
    const location = String(body.location || "").trim();
    const description = String(body.description || "").trim();
    const volunteerCapacity = Number(body.volunteerCapacity);

    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !location ||
      !description ||
      !volunteerCapacity
    ) {
      return NextResponse.json(
        { error: "Missing required event fields." },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        date: new Date(`${date}T12:00:00`),
        startTime,
        endTime,
        location,
        description,
        volunteerCapacity,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Failed to update event:", error);

    return NextResponse.json(
      { error: "Failed to update event." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    const id = Number(eventId);

    if (!id) {
      return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });
    }

    const hasPermission = await canManageEvent(request, id);

if (!hasPermission) {
  return NextResponse.json(
    { error: "You do not have permission to update this event." },
    { status: 403 }
  );
}

    const body = await request.json();
    const isActive = Boolean(body.isActive);

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        isActive,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Failed to update event status:", error);

    return NextResponse.json(
      { error: "Failed to update event status." },
      { status: 500 }
    );
  }
}