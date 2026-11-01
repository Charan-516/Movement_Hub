"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { extractInviteCode } from "@/lib/inviteParse";

type Role = "volunteer" | "admin";

export function Gateway({
  initialRole,
  signedInAs,
}: {
  initialRole: Role;
  signedInAs: string | null;
}) {
  const [role, setRole] = useState<Role>(initialRole);

  return (
    <div className="gate-body">
      <div>
        <h1 className="gate-title">
          {role === "volunteer" ? "Got the link?" : "Run the roster."}
        </h1>
        <p className="gate-lede">
          {role === "volunteer"
            ? "Paste the event link from your WhatsApp group to see the details and sign up."
            : "Sign in to create events and send each one to your group on WhatsApp."}
        </p>
      </div>

      <div className="grid gap-5">
        <div className="roles" role="tablist" aria-label="Who are you?">
          <button
            type="button"
            role="tab"
            id="tab-volunteer"
            aria-selected={role === "volunteer"}
            aria-controls="panel"
            onClick={() => setRole("volunteer")}
          >
            <strong>Volunteer</strong>
            <span>I have a link</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-admin"
            aria-selected={role === "admin"}
            aria-controls="panel"
            onClick={() => setRole("admin")}
          >
            <strong>Admin</strong>
            <span>I organize events</span>
          </button>
        </div>

        <div
          id="panel"
          role="tabpanel"
          aria-labelledby={`tab-${role}`}
          className="ticket p-5 sm:p-6"
        >
          {role === "volunteer" ? (
            <VolunteerPanel />
          ) : (
            <AdminPanel signedInAs={signedInAs} />
          )}
        </div>
      </div>
    </div>
  );
}

function VolunteerPanel() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function open(text: string) {
    const code = extractInviteCode(text);

    if (!code) {
      setError(
        "That doesn't look like an event link. Copy the whole link from the WhatsApp message and paste it here."
      );
      return false;
    }

    setError("");
    router.push(`/join/${code}`);
    return true;
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
      open(text);
    } catch {
      setError("Your browser blocked clipboard access. Paste the link into the box instead.");
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        open(value);
      }}
      className="grid gap-4"
    >
      <label className="field">
        <span>Event link</span>
        <textarea
          className="input"
          rows={3}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          placeholder="Paste it here. It looks like https://…/join/AbC123…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </label>

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn" disabled={!value.trim()}>
          Open event
        </button>
        <button type="button" className="btn btn-ghost" onClick={pasteFromClipboard}>
          Paste and open
        </button>
      </div>
    </form>
  );
}

function AdminPanel({ signedInAs }: { signedInAs: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Invalid admin email or password.");
        return;
      }

      router.push(data.mustChangePassword ? "/admin/change-password" : "/admin");
      router.refresh();
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {signedInAs && (
        <p className="notice notice-ok">
          You&apos;re signed in as {signedInAs}.{" "}
          <Link href="/admin" className="underline">
            Go to the dashboard
          </Link>
        </p>
      )}

      <label className="field">
        <span>Work email</span>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
        />
      </label>

      <label className="field">
        <span>Password</span>
        <div className="flex gap-2">
          <input
            type={showPassword ? "text" : "password"}
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ minHeight: "3rem" }}
            onClick={() => setShowPassword((current) => !current)}
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-ink" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
