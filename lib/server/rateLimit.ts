type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  success: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const globalStore = globalThis as typeof globalThis & {
  __rateLimitBuckets?: Map<string, Bucket>;
};

const buckets = globalStore.__rateLimitBuckets ?? new Map<string, Bucket>();
globalStore.__rateLimitBuckets = buckets;

const canUseUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

const callUpstash = async (command: string[]): Promise<number | null> => {
  if (!canUseUpstash || !UPSTASH_URL || !UPSTASH_TOKEN) return null;

  const encodedCommand = command.map((part) => encodeURIComponent(part)).join("/");
  const response = await fetch(`${UPSTASH_URL}/${encodedCommand}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { result?: unknown };
  if (typeof payload.result === "number") return payload.result;
  if (typeof payload.result === "string") {
    const parsed = Number(payload.result);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const applyInMemoryRateLimit = (
  bucketKey: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult => {
  const now = Date.now();
  const existing = buckets.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      remaining: maxRequests - 1,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  existing.count += 1;
  buckets.set(bucketKey, existing);

  return {
    success: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    remaining: Math.max(0, maxRequests - existing.count),
  };
};

export async function applyRateLimit(
  bucketKey: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<RateLimitResult> {
  if (!canUseUpstash) {
    return applyInMemoryRateLimit(bucketKey, maxRequests, windowMs);
  }

  try {
    const safeKey = `ratelimit:${bucketKey}`;
    const count = await callUpstash(["INCR", safeKey]);

    if (!count) {
      return applyInMemoryRateLimit(bucketKey, maxRequests, windowMs);
    }

    if (count === 1) {
      await callUpstash(["EXPIRE", safeKey, String(Math.ceil(windowMs / 1000))]);
    }

    const ttlSeconds = (await callUpstash(["TTL", safeKey])) ?? Math.ceil(windowMs / 1000);
    const retryAfterSeconds = Math.max(1, ttlSeconds);

    if (count > maxRequests) {
      return {
        success: false,
        retryAfterSeconds,
        remaining: 0,
      };
    }

    return {
      success: true,
      retryAfterSeconds,
      remaining: Math.max(0, maxRequests - count),
    };
  } catch {
    return applyInMemoryRateLimit(bucketKey, maxRequests, windowMs);
  }
}

export function getRequestIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return headers.get("x-real-ip") || "unknown";
}
