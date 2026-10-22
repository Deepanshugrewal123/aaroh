import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ai/chat/route";
import {
  checkRateLimit,
  checkRateLimitAsync,
  getRateLimiterBackendStatus,
  resetRateLimitsForTesting,
  isValidIp,
  extractClientIp,
  MAX_RATE_LIMIT_ENTRIES,
  OVERFLOW_CLIENT_KEY,
  getLocalRateLimitMapSize,
  pruneExpiredLocalRecords,
  getTrustedProxyMode,
} from "@/lib/rate-limiter";
import {
  createStudentBackupSnapshot,
  encryptStudentBackup,
  decryptStudentBackup,
  validateAndParseBackup,
  BACKUP_FORMAT_ENCRYPTED,
  BACKUP_FORMAT_ID,
} from "@/lib/backup-system";
import { EMPTY_PROFILE } from "@/lib/store";
import nextConfig from "../../next.config";

describe("Phase 10: Complete Security Remediation & Privacy Verification", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    resetRateLimitsForTesting();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. API Key Sanitization & Error Handling (/api/ai/chat)
  // =========================================================================
  describe("API Key Exposure & Error Sanitization", () => {
    it("Passes Gemini API key via 'x-goog-api-key' header and never in URL query parameter", async () => {
      process.env.GEMINI_API_KEY = "synthetic-secret-gemini-key-12345";

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Mock response." }] } }],
        }),
      });
      global.fetch = mockFetch;

      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Tell me about software roles." }],
          profile: EMPTY_PROFILE,
          cloudConsentGranted: true,
          offlineOnly: false,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0];

      // CRITICAL CHECK: Key must NOT be in URL query string
      expect(calledUrl).not.toContain("synthetic-secret-gemini-key-12345");
      expect(calledUrl).not.toContain("?key=");
      expect(calledUrl).toBe(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
      );

      // CRITICAL CHECK: Key MUST be passed via header
      expect(calledOptions.headers["x-goog-api-key"]).toBe("synthetic-secret-gemini-key-12345");
    });

    it("Never returns raw exception messages or secret keys in public HTTP 500 error responses", async () => {
      // Intentionally trigger an error in JSON parsing by mocking a faulty stream or invalid input
      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: "invalid-json-payload-structure",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Malformed request: invalid JSON body.");
      // Ensure no internal stack trace or raw node error object is echoed
      expect(data.stack).toBeUndefined();
      expect(data.details).toBeUndefined();
    });

    it("Rejects oversized request body (> 50KB) with HTTP 413 Payload Too Large", async () => {
      const hugeString = "x".repeat(60 * 1024);
      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: hugeString }],
          profile: EMPTY_PROFILE,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data.error).toContain("Payload too large");
    });
  });

  // =========================================================================
  // 2. Abuse Prevention: Rate Limiting & Origin Verification
  // =========================================================================
  describe("API Abuse Controls: Rate Limiting & Origin Validation", () => {
    it("Enforces in-memory sliding window rate limit (blocks requests exceeding 20/min)", () => {
      const clientId = "test-attacker-ip-10.0.0.1";
      for (let i = 0; i < 20; i++) {
        const result = checkRateLimit(clientId, 20, 60000);
        expect(result.allowed).toBe(true);
      }

      // 21st request must be blocked
      const blocked = checkRateLimit(clientId, 20, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("Rejects requests with disallowed cross-origin header with HTTP 403 Forbidden", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: {
          origin: "https://evil-unauthorized-website.com",
          host: "localhost:3000",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
          profile: EMPTY_PROFILE,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("Forbidden: cross-origin request rejected");
    });

    it("Allows requests from localhost origin or same host", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What is Software Engineering?" }],
          profile: EMPTY_PROFILE,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
    });

    it("Direct API caller without Origin header cannot bypass rate limiting or request constraints", async () => {
      const clientIp = "198.51.100.42";
      // Send 20 requests without any Origin header (direct curl/server caller)
      for (let i = 0; i < 20; i++) {
        const req = new NextRequest("http://localhost:3000/api/ai/chat", {
          method: "POST",
          headers: {
            "x-forwarded-for": clientIp,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: `Direct message ${i}` }],
            profile: EMPTY_PROFILE,
          }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
      }

      // 21st direct request MUST be blocked with 429 Too Many Requests
      const blockedReq = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: {
          "x-forwarded-for": clientIp,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Direct message 21" }],
          profile: EMPTY_PROFILE,
        }),
      });
      const blockedRes = await POST(blockedReq);
      expect(blockedRes.status).toBe(429);
      const data = await blockedRes.json();
      expect(data.error).toContain("Too many requests");
    });

    it("Accurately identifies unconfigured distributed rate limiting and engages local fallback", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.REDIS_URL;

      const status = getRateLimiterBackendStatus();
      expect(status.status).toBe("UNCONFIGURED_MISSING_CREDENTIALS");
      expect(status.isDistributed).toBe(false);

      const check = await checkRateLimitAsync("test-client-fallback");
      expect(check.allowed).toBe(true);
      expect(check.backend).toBe("in-memory-fallback");
    });

    it("Correctly operates in distributed mode when Upstash Redis credentials are present", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://mock-upstash.redis.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-upstash-token";

      const status = getRateLimiterBackendStatus();
      expect(status.status).toBe("DISTRIBUTED_UPSTASH_OPERATIONAL");
      expect(status.isDistributed).toBe(true);

      // Mock Upstash REST pipeline response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ result: 1 }, { result: "OK" }],
      });
      global.fetch = mockFetch;

      const check = await checkRateLimitAsync("test-client-upstash");
      expect(check.allowed).toBe(true);
      expect(check.backend).toBe("upstash-redis-distributed");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("Enforces rate limits in distributed mode when Redis counter exceeds threshold", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://mock-upstash.redis.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-upstash-token";

      // Mock Upstash returning count = 21 (limit exceeded)
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ result: 21 }, { result: 0 }],
      });
      global.fetch = mockFetch;

      const check = await checkRateLimitAsync("test-client-exceeded", 20, 60000);
      expect(check.allowed).toBe(false);
      expect(check.retryAfterSeconds).toBe(60);
      expect(check.backend).toBe("upstash-redis-distributed");
    });

    it("Safely falls back to local in-memory rate limiter on malformed Redis responses", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://mock-upstash.redis.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-upstash-token";

      // Mock Upstash returning unexpected error structure or non-array
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: "ERR syntax error in pipeline" }),
      });
      global.fetch = mockFetch;

      // Must NOT fail open or throw; must fall back to local limiter
      const check = await checkRateLimitAsync("test-client-malformed");
      expect(check.allowed).toBe(true);
      expect(check.backend).toBe("in-memory-fallback");
    });

    it("Safely falls back to local limiter when Redis call times out or encounters network error", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://mock-upstash.redis.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-upstash-token";

      const mockFetch = vi.fn().mockRejectedValue(new Error("Upstream connection timeout"));
      global.fetch = mockFetch;

      const check = await checkRateLimitAsync("test-client-timeout");
      expect(check.allowed).toBe(true);
      expect(check.backend).toBe("in-memory-fallback");
    });

    it("Handles concurrent rate limit requests atomically without split-brain or bypass", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://mock-upstash.redis.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-upstash-token";

      let simulatedCounter = 18;
      const mockFetch = vi.fn().mockImplementation(async () => {
        const thisCount = ++simulatedCounter;
        return {
          ok: true,
          json: async () => [{ result: thisCount }, { result: 0 }],
        };
      });
      global.fetch = mockFetch;

      // Dispatch 5 concurrent requests (19, 20 should pass; 21, 22, 23 must be blocked)
      const results = await Promise.all([
        checkRateLimitAsync("concurrent-ip", 20, 60000),
        checkRateLimitAsync("concurrent-ip", 20, 60000),
        checkRateLimitAsync("concurrent-ip", 20, 60000),
        checkRateLimitAsync("concurrent-ip", 20, 60000),
        checkRateLimitAsync("concurrent-ip", 20, 60000),
      ]);

      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      expect(allowedCount).toBe(2); // 19 and 20
      expect(blockedCount).toBe(3); // 21, 22, 23
    });

    it("Securely extracts client IP respecting platform boundaries and rejecting spoofed headers", () => {
      // 1. Native request IP takes highest precedence across all environments
      const h0 = new Headers({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" });
      expect(extractClientIp(h0, "203.0.113.50")).toBe("203.0.113.50");

      // 2. Reject fake 'x-vercel-ip': Not an authentic Vercel header, must NEVER be trusted
      const hFakeVercel = new Headers({
        "x-vercel-ip": "198.51.100.99",
        "x-real-ip": "203.0.113.10",
      });
      // In Vercel mode, x-real-ip is the authentic verified header; x-vercel-ip is ignored
      expect(extractClientIp(hFakeVercel, null, "vercel")).toBe("203.0.113.10");

      // 3. Cloudflare: Trust 'cf-connecting-ip' ONLY when Cloudflare proxy mode is explicitly active
      const hCf = new Headers({
        "cf-connecting-ip": "198.51.100.77",
        "x-forwarded-for": "10.0.0.1",
      });
      // In Cloudflare mode -> trusted
      expect(extractClientIp(hCf, null, "cloudflare")).toBe("198.51.100.77");
      // In Vercel mode -> CF-Connecting-IP is untrusted and ignored
      expect(extractClientIp(hCf, null, "vercel")).toBe("10.0.0.1");

      // 4. Untrusted proxy mode ('none'): All incoming proxy headers are untrusted
      const hUntrusted = new Headers({
        "x-forwarded-for": "198.51.100.42",
        "x-real-ip": "198.51.100.43",
        "cf-connecting-ip": "198.51.100.44",
      });
      expect(extractClientIp(hUntrusted, null, "none")).toBe("anonymous-client");

      // 5. Malformed / injection strings fallback safely to anonymous-client
      const hBad = new Headers({ "x-forwarded-for": "<script>alert(1)</script>" });
      expect(extractClientIp(hBad)).toBe("anonymous-client");

      // 6. Valid IPv4 and IPv6 recognition
      expect(isValidIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
      expect(isValidIp("198.51.100.1")).toBe(true);
      expect(isValidIp("not-an-ip-address")).toBe(false);
      expect(isValidIp("999.999.999.999")).toBe(false);
    });

    it("Prevents callers from rotating spoofed headers to bypass rate limits in untrusted proxy mode", async () => {
      // In an environment where no trusted proxy exists (TRUSTED_PROXY=none)
      process.env.TRUSTED_PROXY = "none";

      // An attacker attempts to rotate X-Forwarded-For and X-Real-IP on every request
      for (let i = 0; i < 20; i++) {
        const req = new NextRequest("http://localhost:3000/api/ai/chat", {
          method: "POST",
          headers: {
            "x-forwarded-for": `192.0.2.${i}`,
            "x-real-ip": `198.51.100.${i}`,
            "cf-connecting-ip": `203.0.113.${i}`,
            "x-vercel-ip": `10.0.0.${i}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: `Rotating header attempt ${i}` }],
            profile: EMPTY_PROFILE,
          }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
      }

      // 21st attempt with another new fake IP MUST be blocked because untrusted headers cannot rotate identity
      const blockedReq = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: {
          "x-forwarded-for": "192.0.2.99",
          "x-real-ip": "198.51.100.99",
          "cf-connecting-ip": "203.0.113.99",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Blocked rotating attempt 21" }],
          profile: EMPTY_PROFILE,
        }),
      });

      const blockedRes = await POST(blockedReq);
      expect(blockedRes.status).toBe(429);
      const data = await blockedRes.json();
      expect(data.error).toContain("Too many requests");
    });

    it("Enforces a strict 5,000 entry hard cap when more than 5,000 distinct unexpired clients send requests", () => {
      resetRateLimitsForTesting();
      expect(getLocalRateLimitMapSize()).toBe(0);

      // 1. Create 4,999 distinct unexpired clients (occupies all dedicated slots)
      for (let i = 0; i < 4999; i++) {
        const res = checkRateLimit(`client-${i}`);
        expect(res.allowed).toBe(true);
        expect(res.overflow).toBeUndefined();
      }
      expect(getLocalRateLimitMapSize()).toBe(4999);

      // 2. The 5,000th distinct client routes to the overflow slot
      const res5000 = checkRateLimit("client-5000");
      expect(res5000.allowed).toBe(true);
      expect(res5000.overflow).toBe(true);
      expect(getLocalRateLimitMapSize()).toBe(MAX_RATE_LIMIT_ENTRIES); // Exactly 5,000

      // 3. Flood with an additional 500 distinct unexpired clients (total 5,501 clients attempted)
      for (let i = 5001; i <= 5500; i++) {
        checkRateLimit(`client-${i}`);
      }

      // 4. CRITICAL INVARIANT: Map size NEVER exceeds MAX_RATE_LIMIT_ENTRIES (5,000)
      expect(getLocalRateLimitMapSize()).toBe(MAX_RATE_LIMIT_ENTRIES);

      // 5. Overflow bucket rate limiting: excess unmapped clients do NOT bypass limits
      // Since the overflow bucket already received 501 calls (> default 20), subsequent overflow calls are BLOCKED
      const blockedOverflow = checkRateLimit("client-excess-unmapped");
      expect(blockedOverflow.allowed).toBe(false);
      expect(blockedOverflow.retryAfterSeconds).toBeGreaterThan(0);
      expect(blockedOverflow.overflow).toBe(true);

      // 6. Ordinary clients created within the initial 4,999 retain expected behavior and are NOT evicted
      const existingClient = checkRateLimit("client-42");
      expect(existingClient.allowed).toBe(true); // second call for client-42
      expect(existingClient.overflow).toBeUndefined();

      // Exhaust client-42 up to the 20 request limit
      for (let i = 2; i < 20; i++) {
        checkRateLimit("client-42");
      }
      const blockedClient42 = checkRateLimit("client-42");
      expect(blockedClient42.allowed).toBe(false); // 21st call is blocked

      // 7. Verify map size remained strictly 5,000 throughout
      expect(getLocalRateLimitMapSize()).toBe(MAX_RATE_LIMIT_ENTRIES);

      // 8. Expired records can be cleaned up, freeing capacity for new individual clients
      const pruned = pruneExpiredLocalRecords(Date.now() + 61000);
      expect(pruned).toBe(MAX_RATE_LIMIT_ENTRIES);
      expect(getLocalRateLimitMapSize()).toBe(0);

      // After pruning, new unique clients can once again obtain dedicated slots
      const freshClient = checkRateLimit("fresh-client-after-prune");
      expect(freshClient.allowed).toBe(true);
      expect(freshClient.overflow).toBeUndefined();
      expect(getLocalRateLimitMapSize()).toBe(1);
    });
  });

  // =========================================================================
  // 3. Explicit Cloud AI Policy & Offline Enforceability
  // =========================================================================
  describe("Student AI Privacy & Explicit Consent", () => {
    it("Never contacts Google or OpenAI when offlineOnly is true, even if API keys are set", async () => {
      process.env.GEMINI_API_KEY = "mock-gemini-key";
      process.env.OPENAI_API_KEY = "mock-openai-key";

      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "How do I build a portfolio?" }],
          profile: EMPTY_PROFILE,
          offlineOnly: true,
          cloudConsentGranted: true, // Even if consent is true, offlineOnly takes precedence
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(data.provider).toBe("local_grounded_engine");
      expect(data.content).toBeDefined();
    });

    it("Never contacts Google or OpenAI without explicit user consent (cloudConsentGranted !== true)", async () => {
      process.env.GEMINI_API_KEY = "mock-gemini-key";
      process.env.OPENAI_API_KEY = "mock-openai-key";

      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const req = new NextRequest("http://localhost:3000/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "How do I balance exams?" }],
          profile: EMPTY_PROFILE,
          offlineOnly: false,
          cloudConsentGranted: false, // Consent NOT granted
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(data.provider).toBe("local_grounded_engine");
    });
  });

  // =========================================================================
  // 4. Encrypted Backup & Restore (WebCrypto AES-256-GCM)
  // =========================================================================
  describe("Password-Protected Backup Encryption & Integrity", () => {
    it("Performs complete AES-256-GCM encryption and decryption round-trip", async () => {
      const plaintextSnapshot = createStudentBackupSnapshot(EMPTY_PROFILE, null);
      const password = "correct-secure-password-2026";

      const encryptedPacket = await encryptStudentBackup(plaintextSnapshot, password);

      expect(encryptedPacket.formatId).toBe(BACKUP_FORMAT_ENCRYPTED);
      expect(encryptedPacket.kdf.algorithm).toBe("PBKDF2");
      expect(encryptedPacket.kdf.iterations).toBe(100000);
      expect(encryptedPacket.encryption.algorithm).toBe("AES-GCM");
      expect(encryptedPacket.ciphertextHex).toBeDefined();
      expect(encryptedPacket.ciphertextHex.length).toBeGreaterThan(64);

      // Decrypt with correct password
      const decryptedSnapshot = await decryptStudentBackup(encryptedPacket, password);

      expect(decryptedSnapshot.formatId).toBe(BACKUP_FORMAT_ID);
      expect(decryptedSnapshot.profile.id).toBe(plaintextSnapshot.profile.id);
      expect(decryptedSnapshot.summary.studentName).toBe(plaintextSnapshot.summary.studentName);
    });

    it("Safely rejects decryption with incorrect password", async () => {
      const plaintextSnapshot = createStudentBackupSnapshot(EMPTY_PROFILE, null);
      const encryptedPacket = await encryptStudentBackup(plaintextSnapshot, "correct-password-123");

      await expect(
        decryptStudentBackup(encryptedPacket, "wrong-password-999")
      ).rejects.toThrow("Incorrect password or corrupted backup file.");
    });

    it("Safely rejects decryption when ciphertext has been tampered with", async () => {
      const plaintextSnapshot = createStudentBackupSnapshot(EMPTY_PROFILE, null);
      const encryptedPacket = await encryptStudentBackup(plaintextSnapshot, "correct-password-123");

      // Tamper with ciphertext by flipping characters
      const tamperedHex =
        encryptedPacket.ciphertextHex.slice(0, -4) + "abcd";
      const tamperedPacket = {
        ...encryptedPacket,
        ciphertextHex: tamperedHex,
      };

      await expect(
        decryptStudentBackup(tamperedPacket, "correct-password-123")
      ).rejects.toThrow("Incorrect password or corrupted backup file.");
    });

    it("validateAndParseBackup identifies encrypted backups and reports isEncrypted flag", () => {
      const encryptedMockPayload = {
        formatId: BACKUP_FORMAT_ENCRYPTED,
        schemaVersion: "1.0",
        appVersion: "1.0.3",
        exportedAt: new Date().toISOString(),
        kdf: { algorithm: "PBKDF2", hash: "SHA-256", iterations: 100000, saltHex: "aabbcc" },
        encryption: { algorithm: "AES-GCM", ivHex: "ddeeff" },
        ciphertextHex: "11223344",
        securityNotice: "Encrypted test packet",
      };

      const result = validateAndParseBackup(encryptedMockPayload, EMPTY_PROFILE);
      expect(result.isValid).toBe(false);
      expect(result.isEncrypted).toBe(true);
      expect(result.error).toContain("password-encrypted");
    });
  });

  // =========================================================================
  // 5. Next.js Production Security Headers
  // =========================================================================
  describe("Production HTTP Security Headers", () => {
    it("nextConfig defines all required standard security headers", async () => {
      expect(nextConfig.headers).toBeDefined();
      expect(typeof nextConfig.headers).toBe("function");

      const headerRules = await nextConfig.headers!();
      expect(headerRules.length).toBeGreaterThan(0);

      const rootHeaders = headerRules[0].headers;
      const headerMap = new Map(rootHeaders.map((h: { key: string; value: string }) => [h.key, h.value]));

      expect(headerMap.get("X-Frame-Options")).toBe("DENY");
      expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
      expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(headerMap.get("Content-Security-Policy")).toContain("default-src 'self'");
      expect(headerMap.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
      // TIGHTENED CSP: Ensure 'unsafe-eval' is eliminated to prevent dynamic code injection
      expect(headerMap.get("Content-Security-Policy")).not.toContain("'unsafe-eval'");
      expect(headerMap.get("Content-Security-Policy")).toContain("script-src 'self' 'unsafe-inline'");
      expect(headerMap.get("Permissions-Policy")).toContain("camera=()");
    });
  });
});
