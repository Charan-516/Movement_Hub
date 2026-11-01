import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";
import { JoinForm, type JoinEvent } from "@/components/JoinForm";

export const dynamic = "force-dynamic";

// Invite links are private: keep them out of search results.
export const metadata: Metadata = {
  title: "Volunteer sign-up",
  robots: { index: false, follow: false },
};

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const event = /^[A-Za-z0-9_-]{8,64}$/.test(code)
    ? await prisma.event.findUnique({
        where: { inviteCode: code },
        include: {
          // Only the count is used; volunteer names never reach the browser.
          _count: { select: { signups: true } },
          createdByAdmin: { select: { fullName: true, email: true } },
          adminAssignments: {
            include: { admin: { select: { fullName: true, email: true } } },
          },
        },
      })
    : null;

  if (!event || !event.isActive) {
    return (
      <main className="gate">
        <header>
          <Wordmark />
        </header>
        <div className="gate-body" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <h1 className="gate-title">No event here.</h1>
            <p className="gate-lede">
              This link doesn&apos;t match an open event. It may have been closed, or the
              link was cut off when it was copied. Ask the organizer to send it again.
            </p>
            <Link href="/" className="btn mt-6">
              Paste a different link
            </Link>
          </div>
        </div>
        <span />
      </main>
    );
  }

  const contacts = (
    event.adminAssignments.length > 0
      ? event.adminAssignments.map((a) => a.admin)
      : event.createdByAdmin
        ? [event.createdByAdmin]
        : []
  ).map((admin) => ({
    name: admin.fullName || admin.email,
    email: admin.email,
  }));

  const joinEvent: JoinEvent = {
    inviteCode: code,
    title: event.title,
    date: event.date.toISOString().slice(0, 10),
    endDate: event.endDate ? event.endDate.toISOString().slice(0, 10) : null,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    description: event.description,
    capacity: event.volunteerCapacity,
    taken: event._count.signups,
    contacts,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-5 sm:px-6">
      <header className="mb-8">
        <Wordmark />
      </header>
      <JoinForm event={joinEvent} />
    </main>
  );
}
