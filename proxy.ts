import { NextRequest, NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/adminAuth";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginApi = pathname === "/api/admin/login";
  const isLogoutApi = pathname === "/api/admin/logout";

  if (isLoginApi || isLogoutApi) {
    return NextResponse.next();
  }

  const email = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  const isAuthorized = email ? isAllowedAdminEmail(email) : false;

  if (isAuthorized) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The old /admin/login page is gone; the gateway at "/" handles sign-in.
  return NextResponse.redirect(new URL("/?as=admin", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
