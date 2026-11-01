import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isAllowedAdminEmail } from "@/lib/adminAuth";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";
import { clearRateLimit, isRateLimited } from "@/lib/rateLimit";

// Compared against when the email is unknown, so response time does not
// reveal which admin emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limiterKey = `${ip}:${email}`;

  if (isRateLimited(limiterKey)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait 15 minutes and try again." },
      { status: 429 }
    );
  }

  const adminUser = isAllowedAdminEmail(email)
    ? await prisma.adminUser.findUnique({ where: { email } })
    : null;

  const passwordIsValid = await bcrypt.compare(
    password,
    adminUser?.passwordHash ?? DUMMY_HASH
  );

  if (!adminUser || !passwordIsValid) {
    return NextResponse.json(
      { error: "Invalid admin email or password." },
      { status: 401 }
    );
  }

  if (!adminUser.isActive) {
    return NextResponse.json(
      { error: "This admin account has been deactivated." },
      { status: 403 }
    );
  }

  clearRateLimit(limiterKey);

  const response = NextResponse.json({
    success: true,
    mustChangePassword: adminUser.mustChangePassword,
  });

  response.cookies.set(SESSION_COOKIE, await createSessionToken(email), {
    ...sessionCookieOptions,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
