/**
 * Simple in-memory sliding-window rate limiter (per key).
 * Sufficient for a single-instance deployment; swap for a Redis-backed
 * limiter when scaling horizontally.
 */
type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

if (typeof globalThis.setInterval === "function") {
  const iv = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
  }, 60_000);
  iv.unref?.();
}

/** Returns true when the request is allowed, false when rate-limited. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  return "local";
}
