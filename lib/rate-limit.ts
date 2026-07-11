/**
 * Best-effort fixed-window rate limiter (in-memory).
 *
 * NOTE: on serverless this is per-instance, so it's a speed bump, not a hard
 * guarantee — it blunts rapid abuse from a single warm instance. A durable
 * limiter (Upstash/Vercel KV) is the Phase 2 upgrade before serious traffic.
 */
type Window = { count: number; reset: number };
const windows = new Map<string, Window>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const w = windows.get(key);
  if (!w || now > w.reset) {
    windows.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (w.count >= limit) return false;
  w.count++;
  return true;
}

/** Derive a client key from the request (best-effort IP + scope). */
export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}
