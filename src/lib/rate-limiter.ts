// Distributed & In-Memory Rate Limiter Architecture
// Supports dual-mode operation:
// 1. Distributed Mode (Production): Backed by Upstash Redis REST API when UPSTASH_REDIS_REST_URL
//    and UPSTASH_REDIS_REST_TOKEN are configured in the deployment environment.
// 2. Local Fallback Mode: Sliding window in-memory limiter for single-process Node / development.
//
// NOTE: If Redis credentials are not configured, distributed edge synchronization across multiple
// serverless instances cannot be guaranteed. In that state, the rate limiter falls back to local memory.

export type RateLimiterBackendStatus =
  | "DISTRIBUTED_UPSTASH_OPERATIONAL"
  | "DISTRIBUTED_REDIS_OPERATIONAL"
  | "UNCONFIGURED_MISSING_CREDENTIALS"
  | "LOCAL_FALLBACK_ACTIVE";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const localRateLimitMap = new Map<string, RateLimitRecord>();
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const DEFAULT_MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Inspects environment variables to determine the rate limiter backend capability.
 */
export function getRateLimiterBackendStatus(): {
  status: RateLimiterBackendStatus;
  isDistributed: boolean;
  provider?: string;
} {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const redisUrl = process.env.REDIS_URL;

  if (upstashUrl && upstashToken) {
    return {
      status: "DISTRIBUTED_UPSTASH_OPERATIONAL",
      isDistributed: true,
      provider: "Upstash Redis REST API",
    };
  }

  if (redisUrl) {
    return {
      status: "DISTRIBUTED_REDIS_OPERATIONAL",
      isDistributed: true,
      provider: "Direct Redis Connection",
    };
  }

  return {
    status: "UNCONFIGURED_MISSING_CREDENTIALS",
    isDistributed: false,
    provider: "In-Memory Sliding Window (Fallback)",
  };
}

/**
 * Synchronous local in-memory sliding window rate limiter.
 * Protects against rapid repeated calls within a single process.
 */
export function checkRateLimit(
  clientIdentifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS_PER_WINDOW,
  windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS
): { allowed: boolean; retryAfterSeconds?: number; backend: string } {
  const now = Date.now();
  const record = localRateLimitMap.get(clientIdentifier);

  if (record && record.resetAt > now) {
    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfterSeconds, backend: "in-memory-fallback" };
    }
    record.count += 1;
    return { allowed: true, backend: "in-memory-fallback" };
  }

  localRateLimitMap.set(clientIdentifier, { count: 1, resetAt: now + windowMs });
  return { allowed: true, backend: "in-memory-fallback" };
}

/**
 * Asynchronous rate limit check supporting distributed backing services.
 * Seamlessly falls back to local memory if credentials or network are unavailable.
 */
export async function checkRateLimitAsync(
  clientIdentifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS_PER_WINDOW,
  windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS
): Promise<{ allowed: boolean; retryAfterSeconds?: number; backend: string }> {
  const backendInfo = getRateLimiterBackendStatus();

  // If Upstash Redis credentials exist, call Upstash REST API
  if (backendInfo.status === "DISTRIBUTED_UPSTASH_OPERATIONAL") {
    try {
      const upstashUrl = process.env.UPSTASH_REDIS_REST_URL!;
      const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN!;
      const key = `aaroh:ratelimit:${clientIdentifier}`;
      const windowSeconds = Math.ceil(windowMs / 1000);

      // Multi-command pipeline: INCR then EXPIRE (if new key)
      const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSeconds, "NX"],
        ]),
        signal: AbortSignal.timeout(2000), // 2s fail-safe timeout
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const currentCount = Number(results?.[0]?.result || 1);

        if (currentCount > maxRequests) {
          return {
            allowed: false,
            retryAfterSeconds: windowSeconds,
            backend: "upstash-redis-distributed",
          };
        }

        return {
          allowed: true,
          backend: "upstash-redis-distributed",
        };
      }
    } catch (err: unknown) {
      console.warn("Distributed rate limiter unavailable; falling back to local memory limiter:", err instanceof Error ? err.message : String(err));
    }
  }

  // Fallback: Local In-Memory Sliding Window
  return checkRateLimit(clientIdentifier, maxRequests, windowMs);
}

export function resetRateLimitsForTesting(): void {
  localRateLimitMap.clear();
}
