import Link from "next/link";
import { prisma } from "@/lib/db";
import { EventArchiveButton } from "@/components/EventArchiveButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArchivedEventsPage() {
  const events = await prisma.event.findMany({
    where: {
      isActive: false,
    },
    orderBy: {
      date: "desc",
    },
    include: {
      signups: true,
    },
  });

  return (
    <div className="min-h-[calc(100dvh-4.5rem)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/admin/events"
                className="btn btn-ghost"
              >
                ← Back to Manage Events
              </Link>

              <h1 className="text-3xl font-bold text-slate-950">
                Archived Events
              </h1>

              <p className="mt-3 text-slate-600">
                Review past events, volunteer signups, and historical event records.
              </p>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Volunteers</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => {
                const signupCount = event.signups.length;

                return (
                  <tr key={event.id} className="border-t border-slate-200">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {event.startTime} - {event.endTime}
                      </p>
                    </td>

                    <td className="px-4 py-4">{formatDate(event.date)}</td>

                    <td className="px-4 py-4">{event.location}</td>

                    <td className="px-4 py-4">
                      {signupCount}/{event.volunteerCapacity}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/events/${event.id}/volunteers`}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[var(--ovp-blue)] hover:bg-[var(--ovp-blue-100)]"
                        >
                          View Signups
                        </Link>

                        <a
                          href={`/api/admin/events/${event.id}/volunteers/export`}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          Export CSV
                        </a>

                        <EventArchiveButton
                          eventId={event.id}
                          isActive={event.isActive}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {events.length === 0 && (
            <div className="p-6 text-center text-slate-500">
              No archived events yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}