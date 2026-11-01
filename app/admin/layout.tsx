import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { getSessionEmailFromToken, SESSION_COOKIE } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const email = await getSessionEmailFromToken(
    cookieStore.get(SESSION_COOKIE)?.value
  );

  const admin = email
    ? await prisma.adminUser.findUnique({
        where: { email },
        select: { fullName: true, role: true },
      })
    : null;

  return (
    <>
      <nav
        aria-label="Admin"
        className="border-b-2 border-[var(--ink)] bg-[var(--sheet)]"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          <Wordmark href="/admin" />

          <div className="flex flex-1 flex-wrap items-center gap-1 font-semibold">
            <Link href="/admin" className="rounded px-3 py-2 hover:bg-[var(--paper)]">
              Dashboard
            </Link>
            <Link href="/admin/events" className="rounded px-3 py-2 hover:bg-[var(--paper)]">
              Events
            </Link>
            {admin?.role === "super_admin" && (
              <Link href="/admin/users" className="rounded px-3 py-2 hover:bg-[var(--paper)]">
                Admins
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {admin && (
              <span className="hidden text-sm text-[var(--ink-soft)] sm:inline">
                {admin.fullName || email}
              </span>
            )}
            <AdminLogoutButton />
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
