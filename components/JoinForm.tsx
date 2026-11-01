"use client";

import { useState } from "react";

export type JoinEvent = {
  inviteCode: string;
  title: string;
  date: string; // yyyy-mm-dd
  endDate: string | null;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  capacity: number;
  taken: number;
  contacts: { name: string; email: string }[];
};

function parseDay(day: string) {
  return new Date(`${day}T12:00:00`);
}

function eventDays(event: JoinEvent) {
  const days: string[] = [];
  const last = event.endDate ?? event.date;
  const cursor = parseDay(event.date);

  while (cursor <= parseDay(last) && days.length < 60) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function dayLabel(day: string) {
  return parseDay(day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function JoinForm({ event }: { event: JoinEvent }) {
  const days = eventDays(event);
  const start = parseDay(event.date);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(
    days.length === 1 ? days : []
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [taken, setTaken] = useState(event.taken);

  const isFull = taken >= event.capacity;
  const left = Math.max(event.capacity - taken, 0);

  // Cap the tally so a 200-person event doesn't draw 200 bars.
  const barCount = Math.min(event.capacity, 36);
  const filledBars = Math.round((Math.min(taken, event.capacity) / event.capacity) * barCount);

  async function handleSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setError("");

    if (selectedDays.length === 0) {
      setError("Pick at least one day you can come.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/volunteer-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: event.inviteCode,
          fullName,
          phone,
          selectedDates: selectedDays,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Couldn't save your sign-up. Try again.");
        return;
      }

      setTaken((n) => n + 1);
      setDone(true);
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="ticket">
      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <div className="datebox" aria-hidden="true">
            <b>{start.getDate()}</b>
            <span>{start.toLocaleDateString("en-US", { month: "short" })}</span>
          </div>

          <div className="min-w-0 flex-1" style={{ flexBasis: "14rem" }}>
            <h1 className="join-title">{event.title}</h1>
          </div>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="font-bold">When</dt>
            <dd>
              {days.length > 1
                ? `${dayLabel(days[0])} to ${dayLabel(days[days.length - 1])}`
                : start.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
              , {event.startTime} to {event.endTime}
            </dd>
          </div>
          <div>
            <dt className="font-bold">Where</dt>
            <dd>{event.location}</dd>
          </div>
        </dl>

        <p className="mt-5 max-w-[62ch] leading-relaxed">{event.description}</p>

        <div className="mt-6">
          <div
            className="pips"
            role="img"
            aria-label={`${taken} of ${event.capacity} volunteer spots taken`}
          >
            {Array.from({ length: barCount }, (_, index) => (
              <i key={index} className={index < filledBars ? "" : "open"} />
            ))}
          </div>
          <p className="mt-2 font-semibold">
            {isFull
              ? "All spots are taken."
              : `${left} of ${event.capacity} spots left`}
          </p>
        </div>
      </div>

      <div className="ticket-cut" aria-hidden="true" />

      <div className="p-5 sm:p-8">
        {done ? (
          <div role="status">
            <span className="stamp stamp-in">You&apos;re in</span>
            <p className="mt-5 text-lg">
              Thanks, {fullName.trim().split(" ")[0]}. Your spot is saved for{" "}
              {selectedDays.length === 1
                ? dayLabel(selectedDays[0])
                : selectedDays.map(dayLabel).join(", ")}
              . Arrive at {event.startTime} at {event.location}.
            </p>
            <ContactLine contacts={event.contacts} />
          </div>
        ) : isFull ? (
          <div>
            <p className="notice">
              Every spot for this event is taken. Ask the organizer if they can add more.
            </p>
            <ContactLine contacts={event.contacts} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <h2>Put your name down</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field">
                <span>Full name</span>
                <input
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="field">
                <span>Phone number</span>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </label>
            </div>

            {days.length > 1 && (
              <fieldset>
                <legend className="mb-2 font-bold">Which days can you come?</legend>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <label key={day} className="chip relative">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={(e) =>
                          setSelectedDays((current) =>
                            e.target.checked
                              ? [...current, day].sort()
                              : current.filter((d) => d !== day)
                          )
                        }
                      />
                      {dayLabel(day)}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {error && (
              <p className="notice" role="alert">
                {error}
              </p>
            )}

            <div>
              <button type="submit" className="btn" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Sign me up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}

function ContactLine({ contacts }: { contacts: JoinEvent["contacts"] }) {
  if (contacts.length === 0) return null;

  return (
    <p className="mt-4 text-[var(--ink-soft)]">
      Questions? Write to{" "}
      {contacts.map((contact, index) => (
        <span key={contact.email}>
          {index > 0 && ", "}
          <a className="underline" href={`mailto:${contact.email}`}>
            {contact.name}
          </a>
        </span>
      ))}
      .
    </p>
  );
}
