import Link from "next/link";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="wordmark">
      <span className="tally" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      Open Volunteer
    </Link>
  );
}
