"use client";

import { useState } from "react";

type Props = {
  adminId: number;
  currentRole: string;
};

export function AdminRoleSelector({
  adminId,
  currentRole,
}: Props) {
  const [role, setRole] = useState(currentRole);
  const [isSaving, setIsSaving] = useState(false);

  async function handleRoleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newRole = event.target.value;

    setRole(newRole);
    setIsSaving(true);

    const response = await fetch(
      `/api/admin/users/${adminId}/role`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();

      alert(data.error || "Unable to update role.");

      setRole(currentRole);
    }

    setIsSaving(false);
  }

  return (
    <select
      value={role}
      onChange={handleRoleChange}
      disabled={isSaving}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold"
    >
      <option value="event_admin">
        Event Admin
      </option>

      <option value="super_admin">
        Super Admin
      </option>
    </select>
  );
}