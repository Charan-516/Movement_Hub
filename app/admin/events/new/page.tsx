"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    volunteerCapacity: "",
  });

  const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
});

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Unable to create event. Please check the form and try again.");
      return;
    }

    const created = await response.json();

    router.push(`/admin/events?new=${created.id}`);
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100dvh-4.5rem)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <h1 className="text-3xl font-bold text-slate-950">
            Create New Event
          </h1>

          <p className="mt-3 text-slate-600">
            Add a new event to the events and volunteer calendar.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="grid gap-5">
            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Event title
              </span>
              <input
                value={formData.title}
                onChange={(event) =>
                  setFormData({ ...formData, title: event.target.value })
                }
                className="input"
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </span>
              <input
                type="date"
                value={formData.date}
                onChange={(event) =>
                  setFormData({ ...formData, date: event.target.value })
                }
                className="input"
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                End Date
              </span>

              <input
                type="date"
                value={formData.endDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    endDate: event.target.value,
                  })
                }
                className="input"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label>
  <span className="mb-1 block text-sm font-medium text-slate-700">
    Start time
  </span>

  <select
    value={formData.startTime}
    onChange={(event) =>
      setFormData({ ...formData, startTime: event.target.value })
    }
    className="input"
    required
  >
    <option value="">Select start time</option>

    {timeOptions.map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ))}
  </select>
</label>

              <label>
  <span className="mb-1 block text-sm font-medium text-slate-700">
    End time
  </span>

  <select
    value={formData.endTime}
    onChange={(event) =>
      setFormData({ ...formData, endTime: event.target.value })
    }
    className="input"
    required
  >
    <option value="">Select end time</option>

    {timeOptions.map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ))}
  </select>
</label>
            </div>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Location
              </span>
              <input
                value={formData.location}
                onChange={(event) =>
                  setFormData({ ...formData, location: event.target.value })
                }
                className="input"
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    description: event.target.value,
                  })
                }
                rows={5}
                className="input"
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Volunteer capacity
              </span>
              <input
                type="number"
                min="1"
                value={formData.volunteerCapacity}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    volunteerCapacity: event.target.value,
                  })
                }
                className="input"
                required
              />
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-900 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/events")}
              className="btn btn-ghost"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-ink"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}