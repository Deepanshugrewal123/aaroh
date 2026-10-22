// In-memory sliding window rate limiter
// Suitable for single-process Node / development runtime.
// Distributed serverless edge environments (e.g. Vercel Edge) require external persistent store (e.g. Upstash Redis).

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const DEFAULT_MAX_REQUESTS_PER_WINDOW = 20;

export function checkRateLimit(
  clientIdentifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS_PER_WINDOW,
  windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIdentifier);

  if (record && record.resetAt > now) {
    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfterSeconds };
    }
    record.count += 1;
    return { allowed: true };
  }

  // Create new window
  rateLimitMap.set(clientIdentifier, { count: 1, resetAt: now + windowMs });
  return { allowed: true };
}

export function resetRateLimitsForTesting(): void {
  rateLimitMap.clear();
}
