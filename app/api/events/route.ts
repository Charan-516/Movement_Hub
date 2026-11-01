import { NextResponse } from "next/server";
import { getEvents } from "@/lib/events";
import { getSessionEmail } from "@/lib/session";

// Events are no longer public. They contain volunteer names and admin emails,
// so this is admin-only. Volunteers reach one event through its invite link.
export async function GET(request: Request) {
  if (!(await getSessionEmail(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getEvents());
  } catch (error) {
    console.error("Failed to fetch events:", error);

    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
