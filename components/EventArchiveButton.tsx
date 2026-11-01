"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EventArchiveButtonProps = {
  eventId: number;
  isActive: boolean;
};

export function EventArchiveButton({
  eventId,
  isActive,
}: EventArchiveButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleClick() {
    setIsUpdating(true);

    await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: !isActive,
      }),
    });

    setIsUpdating(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isUpdating}
      className="btn btn-ghost btn-sm"
    >
      {isUpdating ? "Updating..." : isActive ? "Archive" : "Restore"}
    </button>
  );
}