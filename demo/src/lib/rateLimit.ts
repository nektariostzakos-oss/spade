/**
 * Tiny in-memory IP rate limiter (per process).
 * Enough for a single barber-shop server. For multi-instance deploys
 * swap for a Redis-backed limiter.
 */

declare global {
  // eslint-disable-next-line no-var
  var __spadeRateBuckets: Map<string, number[]> | undefined;
  // eslint-disable-next-line no-var
  var __spadeRateLastSweep: number | undefined;
}

const buckets = (global.__spadeRateBuckets ??= new Map<string, number[]>());

// Sweep stale keys periodically so the map doesn't grow unbounded on long-running servers.
const SWEEP_INTERVAL_MS = 5 * 60_000;
const STALE_AFTER_MS = 60 * 60_000;

function maybeSweep(now: number) {
  const last = global.__spadeRateLastSweep ?? 0;
  if (now - last < SWEEP_INTERVAL_MS) return;
  global.__spadeRateLastSweep = now;
  const cutoff = now - STALE_AFTER_MS;
  for (const [k, arr] of buckets) {
    const recent = arr.filter((t) => t > cutoff);
    if (recent.length === 0) buckets.delete(k);
    else if (recent.length !== arr.length) buckets.set(k, recent);
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

/**
 * Allow up to `max` actions per `windowMs`. Returns true if the action is
 * allowed (and recorded), false if rate-limited.
 */
export function allowAction(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  maybeSweep(now);
  const arr = buckets.get(key) ?? [];
  const cutoff = now - windowMs;
  const recent = arr.filter((t) => t > cutoff);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
