"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchivePastEventsButton() {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  async function handleArchivePastEvents() {
    const confirmed = window.confirm(
      "Archive all active events from previous months? This will hide them from employees but keep them available for admin review."
    );

    if (!confirmed) return;

    setIsArchiving(true);

    const response = await fetch("/api/admin/events/archive-past", {
      method: "POST",
    });

    setIsArchiving(false);

    if (!response.ok) {
      alert("Unable to archive past events.");
      return;
    }

    const data = await response.json();

    alert(`${data.archivedCount} event(s) archived.`);

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleArchivePastEvents}
      disabled={isArchiving}
      className="btn btn-ink"
    >
      {isArchiving ? "Archiving..." : "Archive Past Events"}
    </button>
  );
}