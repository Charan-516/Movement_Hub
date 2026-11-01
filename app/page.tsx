import { cookies } from "next/headers";
import { Wordmark } from "@/components/Wordmark";
import { Gateway } from "@/components/Gateway";
import { getSessionEmailFromToken, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const { as } = await searchParams;
  const cookieStore = await cookies();
  const signedInAs = await getSessionEmailFromToken(
    cookieStore.get(SESSION_COOKIE)?.value
  );

  return (
    <main className="gate">
      <header>
        <Wordmark />
      </header>

      <Gateway
        initialRole={as === "admin" ? "admin" : "volunteer"}
        signedInAs={signedInAs ?? null}
      />

      <footer className="gate-foot">
        Events are private. You can only reach one with the link its organizer
        sent you.
      </footer>
    </main>
  );
}
