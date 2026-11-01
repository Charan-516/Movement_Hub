"use client";

export function AdminLogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
      Sign out
    </button>
  );
}
