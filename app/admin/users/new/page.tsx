"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAdminUserPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setTemporaryPassword("");
    setCreatedEmail("");
    setIsSubmitting(true);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        role: "event_admin",
      }),
    });

    setIsSubmitting(false);

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to create admin account.");
      return;
    }

    setTemporaryPassword(data.temporaryPassword);
    setCreatedEmail(data.adminUser.email);

    setFormData({
      fullName: "",
      email: "",
    });
  }

  if (temporaryPassword) {
    return (
      <div className="min-h-[calc(100dvh-4.5rem)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ovp-blue)]">
              Admin Created
            </p>

            <h1 className="text-3xl font-bold text-slate-950">
              Temporary Password
            </h1>

            <p className="mt-3 text-slate-600">
              Share this temporary password with the new admin. They will be
              required to change it after their first login.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-500">Email</p>
              <p className="mt-1 font-semibold text-slate-950">
                {createdEmail}
              </p>

              <p className="mt-4 text-sm font-semibold text-slate-500">
                Temporary Password
              </p>
              <p className="mt-1 break-all rounded-xl bg-white p-3 font-mono text-lg font-bold text-slate-950 ring-1 ring-slate-200">
                {temporaryPassword}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTemporaryPassword("");
                  setCreatedEmail("");
                }}
                className="rounded-xl bg-[#8DC63F] px-4 py-3 font-semibold text-white transition hover:bg-[#78A935]"
              >
                Create Another Admin
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/users")}
                className="btn btn-ghost"
              >
                Back to Admin Users
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4.5rem)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin/users"
          className="btn btn-ghost"
        >
          ← Back to Admin Users
        </Link>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ovp-blue)]">
            Super Admin
          </p>

          <h1 className="text-3xl font-bold text-slate-950">
            Create Event Admin
          </h1>

          <p className="mt-3 text-slate-600">
            Add a new Event Admin. The system will generate a temporary
            password automatically.
          </p>

          <label className="mt-6 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </span>

            <input
              value={formData.fullName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  fullName: event.target.value,
                })
              }
              className="input"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Email address
            </span>

            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  email: event.target.value,
                })
              }
              className="input"
              placeholder="name@example.com"
              required
            />
          </label>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
            New accounts are created as <strong>Event Admins</strong>. Event
            Admins can view all event details, but can only edit events they
            created or were assigned to.
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-900 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-[#8DC63F] px-4 py-3 font-semibold text-white transition hover:bg-[#78A935] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}