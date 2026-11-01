import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShareEventButton } from "@/components/ShareEventButton";
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

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newId } = await searchParams;
  const today = new Date();

const startOfCurrentMonth = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

await prisma.event.updateMany({
  where: {
    isActive: true,
    OR: [
      {
        endDate: {
          lt: startOfCurrentMonth,
        },
      },
      {
        endDate: null,
        date: {
          lt: startOfCurrentMonth,
        },
      },
    ],
  },
  data: {
    isActive: false,
  },
});

const archivedEventCount = await prisma.event.count({
  where: {
    isActive: false,
  },
});

const archivedEventDisplay =
  archivedEventCount > 30
    ? "30+"
    : archivedEventCount.toString();

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      date: "asc",
    },
    include: {
      signups: true,
      createdByAdmin: true,
      adminAssignments: {
        include: {
          admin: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const justCreated = newId
    ? events.find((event) => event.id === Number(newId))
    : undefined;

  const toShare = (event: (typeof events)[number]) => ({
    title: event.title,
    date: formatDate(event.date),
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    inviteCode: event.inviteCode,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1>Events</h1>
          <p className="mt-3 max-w-[48ch] text-[var(--ink-soft)]">
            Each event has its own private link. Send it to your WhatsApp group
            and volunteers sign up from there.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/events/archive" className="btn btn-ghost">
            Archived ({archivedEventDisplay})
          </Link>
          <Link href="/admin/events/new" className="btn">
            Create event
          </Link>
        </div>
      </div>

      {justCreated && (
        <section className="ticket mt-8 p-5 sm:p-6" aria-live="polite">
          <h2>{justCreated.title} is live</h2>
          <p className="mb-4 mt-2 max-w-[56ch]">
            Nobody can find it yet. Send the link to your group so people can
            sign up.
          </p>
          <ShareEventButton event={toShare(justCreated)} />
        </section>
      )}

      <div className="mt-8 overflow-x-auto rounded-lg border-2 border-[var(--ink)] bg-[var(--sheet)]">
        <table className="w-full min-w-[56rem] border-collapse text-left">
          <thead className="bg-[var(--ink)] text-[var(--sheet)]">
            <tr>
              <th className="px-4 py-3 font-bold">Event</th>
              <th className="px-4 py-3 font-bold">Contact</th>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Signed up</th>
              <th className="px-4 py-3 font-bold">Send to group</th>
              <th className="px-4 py-3 font-bold">Manage</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t-2 border-[var(--paper-deep)] align-top">
                <td className="px-4 py-4">
                  <p className="font-bold">{event.title}</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {event.startTime} to {event.endTime}, {event.location}
                  </p>
                </td>

                <td className="px-4 py-4 text-sm">
                  {event.adminAssignments[0]?.admin.fullName ||
                    event.adminAssignments[0]?.admin.email ||
                    event.createdByAdmin?.fullName ||
                    event.createdByAdmin?.email ||
                    "Unassigned"}
                </td>

                <td className="px-4 py-4">{formatDate(event.date)}</td>

                <td className="px-4 py-4 font-semibold">
                  {event.signups.length} of {event.volunteerCapacity}
                </td>

                <td className="px-4 py-4">
                  <ShareEventButton compact event={toShare(event)} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/events/${event.id}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <Link href={`/admin/events/${event.id}/volunteers`} className="btn btn-ghost btn-sm">
                      Signups
                    </Link>
                    <EventArchiveButton eventId={event.id} isActive={event.isActive} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <p className="p-8 text-center">
            No events yet.{" "}
            <Link href="/admin/events/new" className="font-bold underline">
              Create the first one
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
