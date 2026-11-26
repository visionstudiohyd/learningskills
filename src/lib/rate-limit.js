/**
 * In-memory sliding-window rate limiter.
 *
 * Deliberately dependency-free: the public forms need protection from someone
 * hammering them, and an in-process counter gives that without adding Redis to
 * the deployment. The trade-off is honest — on Vercel each lambda instance keeps
 * its own window, so the effective limit is per-instance rather than global.
 * That is ample for enquiry-form abuse; it is not a defence against a
 * distributed attack, which belongs at the CDN/WAF layer.
 */

const WINDOW_MS = 60_000;
const store = globalThis.__cepRateLimitStore || new Map();
globalThis.__cepRateLimitStore = store;

let lastSweep = Date.now();

function sweep(now) {
  // Amortised cleanup so the map cannot grow without bound.
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, hits] of store) {
    const fresh = hits.filter((t) => now - t < WINDOW_MS);
    if (fresh.length) store.set(key, fresh);
    else store.delete(key);
  }
}

/**
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */
export function rateLimit(key, limit = 8, windowMs = WINDOW_MS) {
  const now = Date.now();
  sweep(now);

  const hits = (store.get(key) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const oldest = hits[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(Math.ceil((windowMs - (now - oldest)) / 1000), 1),
    };
  }

  hits.push(now);
  store.set(key, hits);
  return { allowed: true, remaining: limit - hits.length, retryAfter: 0 };
}
