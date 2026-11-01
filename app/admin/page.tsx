import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShareEventButton } from "@/components/ShareEventButton";

export const dynamic = "force-dynamic";

function shortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboard() {
  const [archivedEvents, totalSignups, upcoming] = await Promise.all([
    prisma.event.count({ where: { isActive: false } }),
    prisma.volunteerSignup.count(),
    prisma.event.findMany({
      where: { isActive: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 6,
      include: { _count: { select: { signups: true } } },
    }),
  ]);

  const openSlots = upcoming.reduce(
    (total, event) =>
      total + Math.max(event.volunteerCapacity - event._count.signups, 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1>Next up</h1>
          <p className="mt-3 max-w-[48ch] text-[var(--ink-soft)]">
            {upcoming.length === 0
              ? "Nothing is scheduled. Create an event, then send its link to your group."
              : `${upcoming.length} upcoming ${upcoming.length === 1 ? "event" : "events"}, ${openSlots} open ${openSlots === 1 ? "spot" : "spots"}. ${totalSignups} volunteers signed up so far.`}
          </p>
        </div>

        <Link href="/admin/events/new" className="btn">
          Create event
        </Link>
      </div>

      <ul className="mt-10 grid gap-6">
        {upcoming.map((event) => {
          const taken = event._count.signups;
          const bars = Math.min(event.volunteerCapacity, 36);
          const filled = Math.round(
            (Math.min(taken, event.volunteerCapacity) / event.volunteerCapacity) * bars
          );

          return (
            <li key={event.id} className="ticket">
              <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
                <div className="datebox self-start" aria-hidden="true">
                  <b>{event.date.getDate()}</b>
                  <span>{event.date.toLocaleDateString("en-US", { month: "short" })}</span>
                </div>

                <div>
                  <h2>{event.title}</h2>
                  <p className="mt-2 text-[var(--ink-soft)]">
                    {shortDate(event.date)}, {event.startTime} to {event.endTime}.{" "}
                    {event.location}
                  </p>

                  <div className="mt-4">
                    <div className="pips" role="img" aria-label={`${taken} of ${event.volunteerCapacity} spots taken`}>
                      {Array.from({ length: bars }, (_, i) => (
                        <i key={i} className={i < filled ? "" : "open"} />
                      ))}
                    </div>
                    <p className="mt-2 font-semibold">
                      {taken} of {event.volunteerCapacity} signed up
                    </p>
                  </div>
                </div>
              </div>

              <div className="ticket-cut" aria-hidden="true" />

              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
                <ShareEventButton
                  compact
                  event={{
                    title: event.title,
                    date: shortDate(event.date),
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location,
                    inviteCode: event.inviteCode,
                  }}
                />
                <Link
                  href={`/admin/events/${event.id}/volunteers`}
                  className="font-bold underline underline-offset-4"
                >
                  See who signed up
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-[var(--ink-soft)]">
        <Link href="/admin/events" className="font-bold underline underline-offset-4">
          All events
        </Link>
        {archivedEvents > 0 && (
          <>
            {" "}
            and{" "}
            <Link href="/admin/events/archive" className="font-bold underline underline-offset-4">
              {archivedEvents} archived
            </Link>
          </>
        )}
        .
      </p>
    </div>
  );
}
