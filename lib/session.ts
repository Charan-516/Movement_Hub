// Signed admin session cookie.
//
// The old cookie held the admin's bare email, so anyone who knew an admin
// address could type it into devtools and become that admin. The cookie now
// carries { email, expiry } plus an HMAC-SHA256 signature made with
// SESSION_SECRET, which only the server knows. Web Crypto is used so the same
// code runs in proxy.ts and in route handlers.

export const SESSION_COOKIE = "ovp_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // one working day

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters."
    );
  }

  return secret;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(email: string) {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        email: email.toLowerCase(),
        exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
      })
    )
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    encoder.encode(payload)
  );

  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the admin email if the token is genuine and unexpired, else null. */
export async function verifySessionToken(token?: string | null) {
  if (!token) return null;

  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  try {
    // crypto.subtle.verify compares in constant time.
    const isValid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(payload)
    );

    if (!isValid) return null;

    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));

    if (typeof data.email !== "string" || typeof data.exp !== "number") {
      return null;
    }

    if (data.exp < Math.floor(Date.now() / 1000)) return null;

    return data.email as string;
  } catch {
    return null;
  }
}

function readCookie(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

/** For route handlers: verified admin email from the request, or undefined. */
export async function getSessionEmail(request: Request) {
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  return (await verifySessionToken(token)) ?? undefined;
}

/** For server components: verified admin email from a cookie value. */
export async function getSessionEmailFromToken(token?: string) {
  return (await verifySessionToken(token)) ?? undefined;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
