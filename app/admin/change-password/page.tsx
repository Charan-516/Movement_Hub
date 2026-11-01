"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const passwordIsValid =
        newPassword.length >= 8 &&
        /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];']/g.test(newPassword);

        if (!passwordIsValid) {
        setError(
            "Password must be at least 8 characters and contain at least one special character."
        );
        return;
        }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Unable to update password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ovp-blue)]">
          Admin
        </p>

        <h1 className="text-3xl font-bold text-slate-950">
          Change Password
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
            Please create a unique admin password. Passwords must be at least 8
            characters long and include at least one special character.
            </p>

        <label className="mt-6 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Current password
          </span>

          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="input"
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            New password
          </span>

          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="input"
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Confirm new password
          </span>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="input"
            required
          />
        </label>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-900 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-ink"
        >
          {isSubmitting ? "Saving..." : "Save Password"}
        </button>
      </form>
    </div>
  );
}