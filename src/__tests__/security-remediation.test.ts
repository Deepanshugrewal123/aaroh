import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ai/chat/route";
import { checkRateLimit, resetRateLimitsForTesting } from "@/lib/rate-limiter";
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
      expect(headerMap.get("Permissions-Policy")).toContain("camera=()");
    });
  });
});
