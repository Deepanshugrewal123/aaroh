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
export const MAX_RATE_LIMIT_ENTRIES = 5000;
export const OVERFLOW_CLIENT_KEY = "__rate_limit_overflow__";
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const DEFAULT_MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Validates whether an input string is a valid IPv4 or IPv6 address.
 * Prevents memory key pollution and header injection attacks.
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== "string" || ip.length > 45) {
    return false;
  }
  // IPv4 validation
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    return octets.every((o) => o >= 0 && o <= 255);
  }
  // IPv6 validation: hex groups separated by colons (allowing :: compression)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv6Regex.test(ip);
}

/**
 * Extracts client IP respecting reverse proxy conventions.
 *
 * TRUST BOUNDARY & HOSTING ASSUMPTIONS:
 * 1. On platforms like Vercel or Cloudflare, edge proxies populate `req.ip`, `x-vercel-ip`, or `cf-connecting-ip`.
 * 2. When relying on `x-forwarded-for`, the function inspects the rightmost valid IP, assuming a trusted
 *    reverse proxy appends the connecting client IP.
 * 3. IMPORTANT: In environments without a trusted reverse proxy (e.g. direct internet exposure of the Node process),
 *    clients can forge any HTTP header including X-Forwarded-For. True IP attribution requires network-level
 *    socket inspection (`socket.remoteAddress`) or a configured trusted proxy edge.
 */
export function extractClientIp(
  headers: Headers | { get(name: string): string | null },
  reqIp?: string | null
): string {
  // 1. Next.js runtime IP (populated by Vercel / trusted reverse proxy)
  if (reqIp && isValidIp(reqIp)) {
    return reqIp;
  }

  // 2. Platform-verified headers (cannot be forged by clients if terminated by proxy)
  const vercelIp = headers.get("x-vercel-ip")?.trim();
  if (vercelIp && isValidIp(vercelIp)) {
    return vercelIp;
  }

  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp && isValidIp(cfIp)) {
    return cfIp;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  // 3. X-Forwarded-For: Client can spoof the leftmost IP, but each trusted proxy appends
  // the connecting client IP to the right. Therefore, the rightmost valid entry represents
  // the real IP seen by the closest trusted reverse proxy.
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const parts = xForwardedFor.split(",").map((p) => p.trim());
    for (let i = parts.length - 1; i >= 0; i--) {
      if (isValidIp(parts[i])) {
        return parts[i];
      }
    }
  }

  return "anonymous-client";
}

/**
 * Prunes expired entries from local in-memory map to free capacity.
 * Returns the count of deleted entries.
 */
export function pruneExpiredLocalRecords(now: number = Date.now()): number {
  let prunedCount = 0;
  for (const [key, record] of localRateLimitMap.entries()) {
    if (record.resetAt <= now) {
      localRateLimitMap.delete(key);
      prunedCount++;
    }
  }
  return prunedCount;
}

/**
 * Returns current size of local in-memory rate limit map (for telemetry and testing).
 */
export function getLocalRateLimitMapSize(): number {
  return localRateLimitMap.size;
}

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
 *
 * MEMORY SAFETY & CAPACITY POLICY:
 * - Hard bound of exactly MAX_RATE_LIMIT_ENTRIES (5,000 entries).
 * - Up to 4,999 individual unexpired clients receive dedicated tracking entries.
 * - If 5,000+ distinct unexpired clients arrive, excess clients are routed to a shared
 *   overflow record (OVERFLOW_CLIENT_KEY) rather than evicting existing entries (which would
 *   allow attackers to reset legitimate rate limits) or growing unboundedly (OOM crash).
 * - The overflow bucket enforces `maxRequests` globally across excess callers, preventing fail-open.
 */
export function checkRateLimit(
  clientIdentifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS_PER_WINDOW,
  windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS
): { allowed: boolean; retryAfterSeconds?: number; backend: string; overflow?: boolean } {
  const now = Date.now();

  // 1. Existing client: update in-place without altering map size
  const existingRecord = localRateLimitMap.get(clientIdentifier);
  if (existingRecord) {
    if (existingRecord.resetAt > now) {
      if (existingRecord.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((existingRecord.resetAt - now) / 1000);
        return { allowed: false, retryAfterSeconds, backend: "in-memory-fallback" };
      }
      existingRecord.count += 1;
      return { allowed: true, backend: "in-memory-fallback" };
    }
    // Existing record has expired: reset count in-place
    existingRecord.count = 1;
    existingRecord.resetAt = now + windowMs;
    return { allowed: true, backend: "in-memory-fallback" };
  }

  // 2. New client: if at or approaching capacity, prune expired records first
  if (localRateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES - 1) {
    pruneExpiredLocalRecords(now);
  }

  // 3. If there is space below capacity threshold, register this client
  // (Reserves 1 slot for OVERFLOW_CLIENT_KEY so total map size never exceeds MAX_RATE_LIMIT_ENTRIES)
  if (localRateLimitMap.size < MAX_RATE_LIMIT_ENTRIES - 1) {
    localRateLimitMap.set(clientIdentifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, backend: "in-memory-fallback" };
  }

  // 4. HARD CAPACITY LIMIT ENFORCEMENT:
  // The map has reached 4,999 distinct unexpired clients. To prevent memory exhaustion (DoS)
  // while avoiding destructive LRU/FIFO eviction (which would allow attackers to flush and reset
  // existing rate limits), all new distinct clients are routed to the shared overflow bucket.
  // This guarantees the map NEVER exceeds MAX_RATE_LIMIT_ENTRIES (5,000 total).
  const overflowRecord = localRateLimitMap.get(OVERFLOW_CLIENT_KEY);
  if (overflowRecord) {
    if (overflowRecord.resetAt > now) {
      if (overflowRecord.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((overflowRecord.resetAt - now) / 1000);
        return {
          allowed: false,
          retryAfterSeconds,
          backend: "in-memory-fallback",
          overflow: true,
        };
      }
      overflowRecord.count += 1;
      return {
        allowed: true,
        backend: "in-memory-fallback",
        overflow: true,
      };
    }
    // Overflow bucket expired: reset in place
    overflowRecord.count = 1;
    overflowRecord.resetAt = now + windowMs;
    return {
      allowed: true,
      backend: "in-memory-fallback",
      overflow: true,
    };
  }

  // Initialize the overflow slot (5,000th entry)
  localRateLimitMap.set(OVERFLOW_CLIENT_KEY, { count: 1, resetAt: now + windowMs });
  return {
    allowed: true,
    backend: "in-memory-fallback",
    overflow: true,
  };
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

      // Multi-command atomic pipeline: INCR then EXPIRE NX
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

      if (!pipelineRes.ok) {
        throw new Error(`Upstash HTTP error ${pipelineRes.status}`);
      }

      const results = await pipelineRes.json();

      // Defend against malformed responses or Redis command errors
      if (!Array.isArray(results) || results.length === 0 || results[0]?.error) {
        throw new Error(results?.[0]?.error || "Malformed Redis pipeline response");
      }

      const currentCount = Number(results[0]?.result);
      if (typeof currentCount !== "number" || isNaN(currentCount)) {
        throw new Error("Invalid count returned from Redis pipeline");
      }

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
    } catch (err: unknown) {
      console.warn(
        "Distributed rate limiter unavailable; falling back to local memory limiter:",
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  // Fallback: Local In-Memory Sliding Window
  return checkRateLimit(clientIdentifier, maxRequests, windowMs);
}

export function resetRateLimitsForTesting(): void {
  localRateLimitMap.clear();
}
