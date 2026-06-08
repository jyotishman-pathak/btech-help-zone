import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Upstash (production) ──────────────────────────────────────────────────────
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

function makeRedis() {
  if (!hasUpstash) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const redis = makeRedis();

function upstashLimiter(max: number, window: `${number} ${"s" | "m" | "h" | "d"}`, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `rl:${prefix}`,
    analytics: true,
  });
}

export const limiters = {
  // Login: 5 attempts / minute then 15-minute block
  login: upstashLimiter(5, "60 s", "login"),
  // Register: 30 per hour (relaxed for testing)
  register: upstashLimiter(30, "1 h", "register"),
  // Password reset: 30 per hour (relaxed for testing)
  reset: upstashLimiter(30, "1 h", "reset"),
  // General auth API: 40 per minute
  auth: upstashLimiter(40, "60 s", "auth"),
  // Any API: 120 per minute (catch-all)
  api: upstashLimiter(120, "60 s", "api"),
};

// ── In-memory fallback (dev / no Redis) ──────────────────────────────────────
// NOTE: This works on single-server but NOT on Vercel (each lambda is isolated)
// For production on Vercel, Upstash is required.

interface MemEntry { hits: number[]; blockedUntil?: number; }
const memStore = new Map<string, MemEntry>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memStore.entries()) {
      const expired = !entry.blockedUntil || now > entry.blockedUntil;
      const stale = entry.hits.every((ts) => now - ts > 3_600_000);
      if (expired && stale) memStore.delete(key);
    }
  }, 600_000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

export function memRateLimit(
  key: string,
  max: number,
  windowSec: number,
  blockSec = 0,
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1_000;

  let entry = memStore.get(key);

  // Currently blocked?
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1_000),
    };
  }

  // New or expired window
  if (!entry || entry.hits.every((ts) => now - ts >= windowMs)) {
    memStore.set(key, { hits: [now] });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  // Slide the window
  entry.hits = entry.hits.filter((ts) => now - ts < windowMs);
  entry.hits.push(now);
  entry.blockedUntil = undefined;

  if (entry.hits.length > max) {
    if (blockSec > 0) entry.blockedUntil = now + blockSec * 1_000;
    return {
      allowed: false,
      remaining: 0,
      retryAfter: blockSec || windowSec,
    };
  }

  return { allowed: true, remaining: max - entry.hits.length, retryAfter: 0 };
}

// ── Universal check (tries Upstash, falls back to memory) ────────────────────

export type LimiterKey = keyof typeof limiters;

export async function checkLimit(
  type: LimiterKey,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = limiters[type];

  if (limiter) {
    // Upstash path
    const { success, remaining, reset } = await limiter.limit(identifier);
    return {
      allowed: success,
      remaining: Math.max(0, remaining),
      retryAfter: success ? 0 : Math.ceil((reset - Date.now()) / 1_000),
    };
  }

  // In-memory fallback
  const configs: Record<LimiterKey, [number, number, number]> = {
    login: [5, 60, 900],    // max, windowSec, blockSec
    register: [30, 3600, 3600], // relaxed for testing
    reset: [30, 3600, 3600], // relaxed for testing
    auth: [40, 60, 0],
    api: [120, 60, 0],
  };

  const [max, windowSec, blockSec] = configs[type];
  return memRateLimit(`${type}:${identifier}`, max, windowSec, blockSec);
}


// Track repeated blocks in your DB for visibility in admin panel
export async function logRateLimitBlock(
  ip: string,
  route: string,
  retryAfter: number
): Promise<void> {
  // Fire-and-forget — don't await, don't block the request
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/log-block`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-key": process.env.INTERNAL_API_KEY ?? "" },
    body: JSON.stringify({ ip, route, retryAfter, ts: Date.now() }),
  }).catch(() => { }); // silent fail — logging should never break the app
}