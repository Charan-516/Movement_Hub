import { getSessionEmailFromToken, SESSION_COOKIE } from "@/lib/session";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminRoleSelector } from "@/components/AdminRoleSelector";
import { AdminStatusButton } from "@/components/AdminStatusButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatRole(role: string) {
  if (role === "super_admin") return "Super Admin";
  return "Event Admin";
}

export default async function AdminUsersPage() {
    const cookieStore = await cookies();
    const adminEmail = await getSessionEmailFromToken(cookieStore.get(SESSION_COOKIE)?.value);

    if (!adminEmail) {
    redirect("/?as=admin");
    }

    const currentAdmin = await prisma.adminUser.findUnique({
    where: {
        email: decodeURIComponent(adminEmail).toLowerCase(),
    },
    });

    if (!currentAdmin || currentAdmin.role !== "super_admin") {
    redirect("/admin");
    }
  const admins = await prisma.adminUser.findMany({
    orderBy: {
      email: "asc",
    },
  });

  return (
    <div className="min-h-[calc(100dvh-4.5rem)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/admin"
                className="btn btn-ghost"
              >
                ← Back to Dashboard
              </Link>

              <h1 className="text-3xl font-bold text-slate-950">
                Admin Users
              </h1>

              <p className="mt-3 text-slate-600">
                Review admin accounts, roles, and password-change status.
              </p>
            </div>

            <div className="flex flex-col gap-3">

                <Link
                    href="/admin/users/new"
                    className="rounded-xl bg-[#8DC63F] px-4 py-2 text-center font-semibold text-white transition hover:bg-[#78A935]"
                >
                    + Create Admin
                </Link>
                </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Password</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-t border-slate-200">
                  <td className="px-4 py-4 font-semibold text-slate-950">
                    {admin.fullName || "—"}
                  </td>

                  <td className="px-4 py-4 text-slate-600">{admin.email}</td>

                  <td className="px-4 py-4">
                    <AdminRoleSelector
                        adminId={admin.id}
                        currentRole={admin.role}
                    />
                    </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        admin.isActive
                          ? "bg-[#EDF7DD] text-[#4F7F1F]"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {admin.mustChangePassword ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Must Change
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#EDF7DD] px-3 py-1 text-xs font-semibold text-[#4F7F1F]">
                        Set
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {admin.role !== "super_admin" && (
                      <AdminStatusButton
                        adminId={admin.id}
                        fullName={admin.fullName}
                        isActive={admin.isActive}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="p-6 text-center text-slate-500">
              No admin users have been created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}