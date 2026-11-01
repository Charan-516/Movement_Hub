import { generateInviteCode } from "@/lib/invite";
import { getSessionEmail } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = String(body.title || "").trim();
    const date = String(body.date || "").trim();
    const endDate = String(body.endDate || "").trim();
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

const adminEmail = await getSessionEmail(request);

if (!adminEmail) {
  return NextResponse.json(
    { error: "Unauthorized." },
    { status: 401 }
  );
}

const adminUser = await prisma.adminUser.findUnique({
  where: {
    email: decodeURIComponent(adminEmail).toLowerCase(),
  },
});

if (!adminUser) {
  return NextResponse.json(
    { error: "Unauthorized." },
    { status: 401 }
  );
}

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(`${date}T12:00:00`),
        endDate: endDate ? new Date(`${endDate}T12:00:00`) : null,
        startTime,
        endTime,
        location,
        description,
        volunteerCapacity,
        isActive: true,
        createdByAdminId: adminUser.id,
        inviteCode: generateInviteCode(),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);

    return NextResponse.json(
      { error: "Failed to create event." },
      { status: 500 }
    );
  }
}