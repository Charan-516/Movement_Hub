"use client";

import { useState } from "react";

type ShareEvent = {
  title: string;
  date: string; // formatted, e.g. "Fri, Nov 14"
  startTime: string;
  endTime: string;
  location: string;
  inviteCode: string;
};

export function ShareEventButton({
  event,
  compact = false,
}: {
  event: ShareEvent;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const link = () => `${window.location.origin}/join/${event.inviteCode}`;

  function shareOnWhatsApp() {
    const text = [
      `*${event.title}*`,
      `${event.date}, ${event.startTime} to ${event.endTime}`,
      event.location,
      "",
      "Volunteers needed. Paste this link on the Open Volunteer home page, or just tap it, to sign up:",
      link(),
    ].join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", link());
    }
  }

  const size = compact ? "btn-sm" : "";

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={`btn btn-whatsapp ${size}`} onClick={shareOnWhatsApp}>
        Share on WhatsApp
      </button>
      <button type="button" className={`btn btn-ghost ${size}`} onClick={copyLink} aria-live="polite">
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
