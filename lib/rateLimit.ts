// Small in-memory limiter. It slows down password guessing on a single server
// instance; put a shared store (Redis, Upstash) behind it if you scale out.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
