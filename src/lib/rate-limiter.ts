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

export type TrustedProxyPlatform = "vercel" | "cloudflare" | "custom" | "none";

/**
 * Determines active trusted proxy configuration based on environment variables.
 *
 * FAIL-CLOSED POLICY FOR UNKNOWN HOSTING ENVIRONMENTS:
 * - If TRUSTED_PROXY is explicitly configured to 'vercel', 'cloudflare', or 'custom', that mode is selected.
 * - If VERCEL=1 is set by the hosting environment, 'vercel' mode is auto-selected.
 * - If CF_PAGES=1 is set by the hosting environment, 'cloudflare' mode is auto-selected.
 * - IN ALL OTHER CASES (unknown host, direct internet exposure, local development with TRUSTED_PROXY unset),
 *   this function FAILS CLOSED to 'none'.
 *
 * In 'none' mode, all client-supplied proxy headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP, etc.)
 * are treated as untrusted. Callers share the "anonymous-client" rate limit bucket, preventing
 * identity-rotation rate limit evasion.
 */
export function getTrustedProxyMode(): TrustedProxyPlatform {
  const envVal = process.env.TRUSTED_PROXY?.toLowerCase().trim();
  if (envVal === "none" || envVal === "false" || envVal === "0") {
    return "none";
  }
  if (envVal === "vercel") {
    return "vercel";
  }
  if (envVal === "cloudflare") {
    return "cloudflare";
  }
  if (envVal === "custom" || envVal === "true" || envVal === "1") {
    return "custom";
  }
  // Host platform signals:
  if (process.env.VERCEL === "1") {
    return "vercel";
  }
  if (process.env.CF_PAGES === "1") {
    return "cloudflare";
  }
  // Safe default: unknown hosting environments fail closed to 'none'
  return "none";
}

/**
 * Extracts client IP respecting reverse proxy trust boundaries.
 *
 * TRUST BOUNDARY & HOSTING ASSUMPTIONS:
 * 1. Runtime Socket IP: If `reqIp` is provided and is a valid IP, it takes precedence. Note that
 *    in standard Next.js 15 App Router standalone Node.js servers, `(req as any).ip` is undefined
 *    because Next.js does not expose raw TCP socket addresses (`net.Socket`) to route handlers.
 * 2. None / Unknown Mode ('none'): When deployed without a verified trusted reverse proxy (the default),
 *    all client-supplied headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP, etc.) are untrusted.
 *    Callers share the "anonymous-client" rate limit bucket, preventing header-rotation attacks.
 *    In local development, the 20 req/min limit on "anonymous-client" ensures normal developer usability.
 * 3. Vercel Mode ('vercel'): Vercel's edge network terminates connections and sets `x-real-ip` to the
 *    verified socket IP. Client-supplied `x-real-ip` is stripped by Vercel edge. NOTE: `x-vercel-ip` is
 *    NOT an authentic Vercel header and is strictly rejected.
 * 4. Cloudflare Mode ('cloudflare'): `cf-connecting-ip` is trusted ONLY when requests are known to route
 *    through Cloudflare (`TRUSTED_PROXY=cloudflare` or `CF_PAGES=1`). Without a verified Cloudflare
 *    ingress, client-supplied `cf-connecting-ip` headers are rejected.
 * 5. Custom Mode ('custom'): Behind an operator-managed reverse proxy (NGINX, AWS ALB, Traefik).
 *    OPERATOR REQUIREMENT: The proxy MUST overwrite `X-Real-IP` (e.g. `proxy_set_header X-Real-IP $remote_addr;`)
 *    or sanitize `X-Forwarded-For`, and direct unproxied network access to the Node application port must be denied.
 */
export function extractClientIp(
  headers: Headers | { get(name: string): string | null },
  reqIp?: string | null,
  overrideProxyMode?: TrustedProxyPlatform
): string {
  const mode = overrideProxyMode ?? getTrustedProxyMode();

  // 1. Authoritative runtime IP (if populated by platform/middleware)
  if (reqIp && isValidIp(reqIp)) {
    return reqIp;
  }

  // 2. Untrusted / unknown proxy mode: strictly reject client-supplied headers to prevent identity rotation
  if (mode === "none") {
    return "anonymous-client";
  }

  // 3. Explicit Cloudflare platform: trust CF-Connecting-IP
  if (mode === "cloudflare") {
    const cfIp = headers.get("cf-connecting-ip")?.trim();
    if (cfIp && isValidIp(cfIp)) {
      return cfIp;
    }
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const clientIp = xff.split(",")[0]?.trim();
      if (isValidIp(clientIp)) {
        return clientIp;
      }
    }
    return "anonymous-client";
  }

  // 4. Explicit Vercel platform: trust Vercel Edge verified headers (x-real-ip)
  // NOTE: x-vercel-ip is NOT an authentic Vercel header and is strictly rejected.
  if (mode === "vercel") {
    const realIp = headers.get("x-real-ip")?.trim();
    if (realIp && isValidIp(realIp)) {
      return realIp;
    }
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const clientIp = xff.split(",")[0]?.trim();
      if (isValidIp(clientIp)) {
        return clientIp;
      }
    }
    return "anonymous-client";
  }

  // 5. Custom proxy mode:
  // Requires operator configuration: reverse proxy must overwrite X-Real-IP or X-Forwarded-For
  if (mode === "custom") {
    const realIp = headers.get("x-real-ip")?.trim();
    if (realIp && isValidIp(realIp)) {
      return realIp;
    }
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const parts = xff.split(",").map((p) => p.trim());
      for (const part of parts) {
        if (isValidIp(part)) {
          return part;
        }
      }
    }
    return "anonymous-client";
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
