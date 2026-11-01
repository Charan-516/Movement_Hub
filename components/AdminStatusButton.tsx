"use client";

import { useRouter } from "next/navigation";

type Props = {
  adminId: number;
  fullName: string | null;
  isActive: boolean;
};

export function AdminStatusButton({ adminId, fullName, isActive }: Props) {
  const router = useRouter();

  async function handleClick() {
    const action = isActive ? "deactivate" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${fullName ?? "this admin"}?`
    );

    if (!confirmed) return;

    const response = await fetch(`/api/admin/users/${adminId}/role/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: !isActive,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Unable to update admin status.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className={
        isActive
          ? "rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          : "rounded-lg bg-[#EDF7DD] px-3 py-2 text-xs font-semibold text-[#4F7F1F] transition hover:bg-[#DCEFC4]"
      }
    >
      {isActive ? "Deactivate" : "Reactivate"}
    </button>
  );
}