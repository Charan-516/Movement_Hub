import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

function escapeCsvValue(value: string | null | undefined) {
  const safeValue = value ?? "";
  const spreadsheetSafeValue = /^[=+\-@]/.test(safeValue)
    ? `'${safeValue}`
    : safeValue;
  return `"${spreadsheetSafeValue.replaceAll('"', '""')}"`;
}

export async function GET(request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  const id = Number(eventId);

  if (!id) {
    return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });
  }

  const adminEmail = await getSessionEmail(request);
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: {
      email: decodeURIComponent(adminEmail).toLowerCase(),
    },
  });

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const eventAccess = await prisma.event.findUnique({
    where: { id },
    select: {
      createdByAdminId: true,
      adminAssignments: {
        where: { adminId: adminUser.id },
        select: { id: true },
      },
    },
  });

  if (!eventAccess) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const canManageEvent =
    adminUser.role === "super_admin" ||
    eventAccess.createdByAdminId === adminUser.id ||
    eventAccess.adminAssignments.length > 0;

  if (!canManageEvent) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      signups: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const rows = [
    ["Name", "Phone", "Volunteer Dates", "Status", "Signup Date"],
    ...event.signups.map((signup) => [
      signup.fullName,
      signup.phone,
      signup.selectedDates.join("; "),
      signup.status,
      signup.createdAt.toISOString().slice(0, 10),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");

  const fileName = `${event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-volunteers.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}