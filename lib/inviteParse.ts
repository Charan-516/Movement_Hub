// Client-safe: no Node imports.
/**
 * Volunteers paste whatever WhatsApp gave them: a full link, a link with
 * trailing text, or just the code. Pull the code out of any of those.
 */
export function extractInviteCode(input: string) {
  const text = input.trim();
  const fromLink = text.match(/\/join\/([A-Za-z0-9_-]{8,64})/);
  if (fromLink) return fromLink[1];

  const bare = text.match(/^[A-Za-z0-9_-]{8,64}$/);
  return bare ? bare[0] : null;
}
