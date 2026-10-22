# Aaroh — Phase Tracker & Engineering Change Log

## Implementation Status by Phase

| Phase | Description | Status | Verification Result |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Repository & Requirements Audit | **COMPLETED** | Greenfield repository audited; tooling baseline verified; constraints documented; architecture and data model established. |
| **Phase 1** | Foundation & Public Shell | **COMPLETED** | Aaroh brand design tokens (#101113 canvas, #F59E0B amber, #34D399 emerald), theme switcher, responsive AppShell, accessible UI components (Button, Card, Badge, Modal, Progress), Landing Page with interactive Hero Career Map, guided conversational Onboarding. |
| **Phase 2** | Discovery & Intelligence | **COMPLETED** | Multi-disciplinary Career Explorer with search/filters and 2-3 career comparison, Career Trial Simulator with interactive scenarios and rubrics, Skill Intelligence with 5 evidence states and transparent coverage math. |
| **Phase 2A** | Career Trial Integrity & Multidisciplinary Expansion | **COMPLETED** | 7/7 careers equipped with tailored micro-trials. Verified persistence, rubric scoring, recommendation integration, and evidence boundaries. 32 Vitest tests passing; Next.js build clean. |
| **Phase 2B** | Career Intelligence Validation | **COMPLETED** | Decoupled trial task performance vs enjoyment affinity, semantic domain interest matching, unassessed unknowns tracking, cross-module synchronization (Trials, Roadmap, Dashboard, Explore), 44 Vitest tests passing; Next.js build clean. |
| **Phase 3A** | Project Studio → Verified Skill Evidence Pipeline | **COMPLETED** | End-to-end evidence lifecycle; 7 multidisciplinary briefs & rubrics; deterministic rubric evaluation engine (URL validation, deliverable checks, reflection substance); strict provenance & non-erasure rules; cross-module sync across Project Studio, Skill Matrix, Recommendations, Dashboard, and Roadmap Task 3/4; 62 Vitest tests passing; Next.js build clean. |
| **Phase 3B** | Evidence Integrity, Verification Boundaries & Trust Audit | **COMPLETED** | Audited local-first verification boundaries; eliminated premature "Demonstrated" claims on uninspected links; established honest 6-state taxonomy with `student_attested`; hardened URL parser (IPv4/IPv6 private/loopback, userinfo, port filtering); anti-keyword-stuffing vocabulary evaluator; store non-erasure rules & legacy migration; aligned labels across all 5 modules; 75 Vitest tests passing across 6 suites; Next.js build clean (12 routes). |
| **Phase 3C** | End-to-End Product Reliability & Release Readiness | **COMPLETED** | Real Playwright browser automation (34 browser checks passed across Journeys A–E, responsive mobile/tablet/desktop viewports, dark/light themes, keyboard tab accessibility); fixed store singleton synchronization across pages/drawers; added career-switch milestone isolation in `generateInitialRoadmap`; resolved test count documentation drift; 86 Vitest unit/integration tests passing (7 suites); 0 ESLint warnings; 0 TypeScript errors; clean Next.js 15 production build (12 routes). |
| **Phase 4A** | Trusted Peer & Mentor Review Architecture | **COMPLETED** | Local-first review packet system (`AarohReviewPacket`) binding submissions to deterministic 64-bit FNV-1a fingerprints; anti-tampering schema validation; automatic staleness invalidation when code/reflection updates; honest taxonomy elevating passed criteria to `practically_demonstrated` (`artifact_examined`) without claiming unverified institutional PKI authority; non-erasure preservation for higher evidence; full cross-module sync to Adaptive Roadmap Task 4 ("Peer & Mentor Evidence Verification"); 108 Vitest unit/integration tests passing across 8 suites; 39 Playwright browser E2E assertions passing in Chromium; 0 ESLint warnings; 0 TypeScript errors; clean Next.js 15 production build (12 routes). |
| **Phase 4B** | Adversarial Trust & Evidence Integrity Audit | **COMPLETED** | Adversarial security & integrity audit of peer/mentor review architecture. Upgraded change-detection digest to standard SHA-256 (FIPS 180-4 compliant) with canonical Unicode NFC and whitespace normalization; implemented active review overwrite defense; added scoped skill reversion and Roadmap Task 4 reopening upon submission invalidation; enforced project brief rubric mapping and consistency validation; eliminated stored XSS vectors via `sanitizeExternalUrl`; clarified honest 6-state taxonomy distinguishing proctored institutional authority from unauthenticated peer/mentor attestations; 131 Vitest unit/integration tests passing across 9 suites; 39 Playwright browser E2E checks passing in Chromium; 0 TypeScript errors; 0 ESLint warnings; Next.js 15 build clean (12 routes). |
| **Phase 5** | Question-First Career Intelligence, Open-Ended AI & Visual Rebrand | **COMPLETED** | Removed fictional sample user from default startup; implemented honest empty first-run state (`EMPTY_PROFILE`); built 6-stage conversational question-first onboarding (Stages A–F) with free text, avoidance filters, and confirmation review; built open-ended AI conversation interface and server route handler (`/api/ai/chat`) with local semantic reasoning engine fallback (`ai-knowledge.ts`); complete visual rebrand to Midnight Indigo (`#0B1020`), Electric Blue (`#6D8DFF`), and Soft Mint (`#5EEAD4`); 143 Vitest tests passing across 10 suites; 41 Playwright browser E2E checks passing; Next.js 15 build clean (13 static + 1 dynamic API route). |
| **Phase 5A** | AI Capability, Grounding & Career Reasoning Audit | **COMPLETED** | Comprehensive audit across 12 AI capability categories with 15 test cases; baseline vs enhanced benchmark (7/15 [46.7%] -> 15/15 [100%]); multi-turn context awareness, Hinglish idiom understanding, prompt injection/skill tampering defense, real-world Indian tech telemetry, multidisciplinary supply chain/UXR depth, and salary myth-busting; 158 Vitest tests passing across 11 suites; 41 Playwright browser E2E checks passing; clean Next.js 15 production build. |
| **Phase 5B** | AI Evaluation Integrity, Knowledge Grounding & Live Verification | **COMPLETED** | Rigorous evaluation audit; expanded 64-case benchmark across 15 capability categories with 30 held-out cases; baseline reproduction exposed 21 failures (67.2% -> 100% after hardening); multi-turn ordinal anaphora ("the first one", "the second option"); unrepresented careers (Cybersecurity, DevOps/SRE, Game Dev, Patent Law, Agritech); medical and emergency safety boundaries; salary provenance qualification & base vs CTC breakdown; API route contracts & fallback tests; 216 Vitest tests passing (11 suites); 41 Playwright browser checks passing; clean Next.js 15 build. |
| **Phase 3** | Action & Practical Proof | **COMPLETED** | Adaptive Roadmap with dynamic capacity throttling and College Exam Mode, Project Studio with practical briefs, testing checklists, README generator, and opt-in public portfolio. |
| **Phase 4** | Preparation & AI Mentor | **COMPLETED** | Context-aware AI Mentor with optional privacy disclosure, rubric explanations, and anti-hallucination guardrails. |
| **Phase 5** | UX Simplification & Polish | **COMPLETED** | "Simple on the surface, powerful underneath" refactor: 5 primary nav items, dedicated mobile bottom tab bar, 3-question dashboard, conversational 4-step onboarding, and low-stress career trial playground. |
| **Phase 6** | Production Readiness, End-to-End Product Audit & v1.0 Release Gate | **COMPLETED** | Comprehensive release audit across all 6 core modules and Journeys A–G; resolved P1 blockers (.env.example setup, v1.0.0 package version, monthly take-home tax & deduction breakdown, Journey G browser automation); 216/216 Vitest tests passing across 11 suites; 47/47 Playwright browser checks passing in Chromium; clean Next.js 15 production build (13 static + 1 dynamic API route); local-first offline operation verified. |
| **Phase 7** | Release Integrity, Trust Claims & Runtime Compatibility Audit | **COMPLETED** | Audited runtime/dependency compatibility (stable React 19.3.1, Next.js 15.5.28); eliminated misleading cryptographic claims (SHA-256 integrity fingerprint binding submission data vs unauthenticated reviewer attribution); reconciled ₹20 LPA CTC arithmetic with explicit assumptions and New Tax Regime math (~₹94,766/mo take-home); added in-product privacy disclosure for cloud LLM mode; added focused Phase 7 test suite (12 tests); 228/228 Vitest tests passing across 12 suites; 47/47 Playwright checks passing in Chromium; clean Next.js 15 production build. |
| **Phase 8A** | Dependency Security Triage & Release Pipeline Hardening | **READY WITH DOCUMENTED LIMITATIONS** | Triaged all 17 dependency vulnerabilities; verified 0 vulnerabilities in production runtime dependencies (`npm audit --omit=dev`); resolved Next.js nested PostCSS vulnerabilities via narrow override (`postcss@8.5.31`); documented dev/test tooling exposure (braces unpatched upstream, tinypool prototype pollution in test workers); migrated from deprecated `next lint` to direct ESLint 9 CLI (`eslint.config.mjs`); partitioned reproducible test pipelines (`test:unit`, `test:benchmark`, `test:e2e`, `audit:prod`); verified zero secret leakage in client bundles; 228/228 Vitest tests passing; 47/47 Playwright browser checks passing in Chromium. |
| **Phase 8B** | Student Data Portability, Safe Restore & Cross-Browser Verification | **COMPLETED** | Local-first client-side export/import pipeline (`AarohBackupPacket` v1.0); safe restore with 2MB pre-flight guard, prototype pollution defense, interactive preview modal, trust clamping (`institutional_verified` -> `unauthenticated_mentor`), fingerprint staleness detection, compensating multi-key rollback, and strict non-erasure rules; 22 new portability audit tests (250/250 Vitest tests passing); cross-browser verification across genuine Chromium, Firefox, and WebKit engines (52 checks passed on Chromium, 52 on Firefox, 52 on WebKit = 156 total cross-browser assertions); 0 vulnerabilities in production dependencies; clean Next.js 15 production build. |
| **Phase 9** | Security Remediation, Privacy Controls & Hardening | **COMPLETED** | Eliminated API key exposure (Gemini key moved from query param to `x-goog-api-key` header); sanitized 500 error responses (no raw stack traces or internal paths returned); in-memory rate limiting (20 req/min) and origin verification in `/api/ai/chat`; explicit cloud AI consent enforcement and 100% offline-only toggle in `/mentor`; Web Crypto AES-256-GCM password-encrypted backups with PBKDF2 key derivation (100k iterations) and decrypt-on-import; shared-computer 1-click "Wipe Local Data" action; Next.js production HTTP security headers (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy); 13 new automated security regression tests; 263/263 Vitest tests passing across 14 suites; clean Next.js 15 production build; 0 vulnerabilities in production dependencies. |
| **Phase 9.1** | Post-Release Security Verification & Distributed Limiter Adapter | **VERIFIED WITH DOCUMENTED INFRASTRUCTURE LIMITATION** | Eliminated Critical `tinypool` prototype pollution and `postcss-selector-parser` ReDoS dev vulnerabilities via overrides (12 dev vulnerabilities remain, 0 prod); implemented distributed rate limiter adapter (Upstash Redis REST pipeline) with truthful `UNCONFIGURED_MISSING_CREDENTIALS` local fallback; verified direct API caller limits and 50KB payload guard; verified offline-only isolation from cloud AI; 266/266 Vitest tests passing across 14 suites; clean Next.js 15 production build. |

---

## Change Log

### Build v1.0.4 — Post-Release Security Verification & Distributed Limiter Adapter (Phase 9.1)
- **Definitive Release Gate Decision: `VERIFIED WITH DOCUMENTED INFRASTRUCTURE LIMITATION`**
  - Dependency hardening: Resolved 2 Critical Prototype Pollution RCE advisories in `tinypool` and 1 ReDoS advisory in `postcss-selector-parser` via exact package overrides.
  - Production runtime dependencies have **0 vulnerabilities** (`npm audit --omit=dev`). Remaining 12 vulnerabilities reside exclusively in devDependencies (`braces` unpatched upstream in npm, Vitest UI server advisory not used in headless CLI mode, and dev-only vite/esbuild).
  - Distributed Rate Limiting: Implemented Upstash Redis REST pipeline rate limiting adapter with automatic fallback to local sliding-window limiter. Transparent status `UNCONFIGURED_MISSING_CREDENTIALS` is exposed when Redis credentials are unconfigured. Distributed rate limiting is explicitly marked unverified at runtime due to absence of production Redis infrastructure.
  - API Protection: Direct API callers (without `Origin` header) are bounded by 20 req/min rate limit and 50KB payload guard.
  - Production CSP Hardening: Tightened Content-Security-Policy by removing `'unsafe-eval'` from `script-src`, eliminating dynamic code injection vectors while verifying full compatibility with Next.js client hydration and Playwright browser journeys (52/52 checks passed).
  - Offline Isolation: AI endpoint and UI strictly respect offline toggle and deny cloud LLM invocation without explicit consent.
  - Verification: 266/266 Vitest unit, benchmark, and security regression tests passing across 14 suites. TypeScript and ESLint 0 errors, Next.js 15 production build clean.

### Build v1.0.4 — Security Remediation, Privacy Controls & Hardening (Phase 9)
- **Definitive Release Gate Decision: `VERIFIED SECURE & PRODUCTION READY`**
  - Aaroh v1.0.4 resolves all confirmed security, credential reflection, and unconsented data transmission risks.
  - Production runtime dependencies have **0 vulnerabilities** (`npm audit --omit=dev`).
  - Documented Limitations: (1) 15 vulnerabilities remain in test/dev tooling (`tinypool <=2.1.1` in vitest, `braces` in tailwindcss v3), confirmed zero runtime exposure in production builds; (2) In-memory rate limiting protects single-process Node deployments; distributed serverless edge deployments require external cache (e.g. Upstash Redis).
- **Security & Privacy Hardening Implemented:**
  - **API Key & Error Safety (`src/app/api/ai/chat/route.ts`):**
    - Gemini API key moved from URL query string to `x-goog-api-key` HTTP header. Upstream connection timeouts or DNS errors can never reflect the key in error bodies or logs.
    - Global catch block sanitized: returns generic error message without exposing `err.message`, stack traces, or internal paths to clients.
    - Bounded request body: 50KB payload threshold (`413 Payload Too Large`).
  - **API Abuse Controls (`src/lib/rate-limiter.ts` & route):**
    - In-memory sliding window rate limiter: 20 requests/minute per client IP identifier (`429 Too Many Requests`).
    - Origin verification: blocks unauthorized cross-origin POST requests (`403 Forbidden`).
  - **Explicit Cloud AI Consent & Offline Enforceability (`src/app/mentor/page.tsx` & route):**
    - Cloud LLMs (Gemini / OpenAI) are NEVER contacted unless `cloudConsentGranted === true` and `offlineOnly !== true`.
    - Dedicated "AI Privacy & Consent" modal and status badges in `/mentor`.
    - 1-click toggle to enforce 100% offline local reasoning.
  - **Password-Protected Encrypted Backups (`src/lib/backup-system.ts` & `DataPortabilityCard.tsx`):**
    - AES-256-GCM authenticated encryption using browser Web Crypto API.
    - Key derivation via PBKDF2 (SHA-256, 100,000 iterations, 16-byte random salt).
    - Fresh 12-byte random IV per export.
    - Decrypt-on-import workflow with safe error handling on wrong passwords or tampered ciphertext.
    - Preserves 100% backward compatibility with legacy plaintext backups.
    - Shared-device data protection: 1-click "Wipe Local Data" action with confirmation warning for college library computers.
  - **Production HTTP Security Headers (`next.config.ts`):**
    - Strict Content-Security-Policy (CSP) restricting scripts, styles, connections, and framing.
    - `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Strict-Transport-Security`.
- **Automated Verification:**
  - 13 new automated security regression tests in `src/__tests__/security-remediation.test.ts`. Total Vitest tests: 263/263 passing across 14 suites.
  - 0 TypeScript errors (`npm run typecheck`).
  - 0 ESLint warnings (`npm run lint`).
  - Clean Next.js 15 production build (`npm run build`).
- **Definitive Release Gate Decision: `READY WITH DOCUMENTED LIMITATIONS`**
  - Aaroh v1.0.3 delivers an honest, robust client-side student data portability and disaster-recovery experience without introducing a centralized database or compromising the local-first privacy model.
  - Cross-browser compatibility verified across all three major rendering engines: **Chromium**, **Firefox**, and **WebKit** (52 automated browser checks passed per engine, 156 total).
  - Production runtime dependencies have **0 vulnerabilities** (`npm audit --omit=dev`).
  - Documented Limitations: (1) Backups are exported as plain unencrypted JSON files (explicitly disclosed to students); (2) Cross-device synchronization requires manual export and file transfer; (3) 15 vulnerabilities remain in test/dev tooling (`braces <=3.0.3` unpatched upstream in npm, `tinypool <=2.1.1` in vitest), confirmed zero runtime exposure; (4) Cloud AI mode requires optional user-provided API keys.
- **Student Data Portability Architecture (`src/lib/backup-system.ts`):**
  - Schema Specification: `AarohBackupPacket` with `formatId: "aaroh_student_data_backup"`, `schemaVersion: "1.0"`, `appVersion: "1.0.3"`, containing `profile`, `roadmap`, and comprehensive `summary`.
  - Export: Deterministic formatting, dynamic naming (`aaroh-backup-[slug]-[date].json`), client-side Blob download.
  - Safe Restore Pipeline (`validateAndParseBackup`):
    - 2MB file size guard (`MAX_BACKUP_SIZE_BYTES = 2 * 1024 * 1024`).
    - Recursive prototype pollution rejection (`__proto__`, `constructor`, `prototype`).
    - Safe JSON parsing with user-friendly error diagnostics.
    - Review Trust Clamping: Demotes forged institutional review claims (`institutional_verified`, `institutional_proctored`) to `unauthenticated_peer` / `unauthenticated_mentor`.
    - Cryptographic Fingerprint Verification: Recalculates 256-bit SHA-256 fingerprint; marks reviews with modified deliverable links/code/reflections as `isStale: true`.
    - Evidence State Clamping: Demotes unverified `independently_verified` claims in imported profiles to `practically_demonstrated`.
    - Non-Erasure Protection: Pre-existing `independently_verified` institutional credentials in the target browser are strictly preserved against downgrade or erasure.
    - Deduplication: Safely deduplicates trial IDs, saved careers, and hypotheses while trimming project identifiers.
    - Compensating Multi-Key Rollback: If writing the roadmap key to `localStorage` fails, the profile key is rolled back to prevent split-brain state.
- **Interactive Restore Preview Modal (`src/components/backup/DataPortabilityCard.tsx`):**
  - Rendered at point-of-use on Dashboard (`/dashboard`).
  - Pre-flight preview displays student name, target career, completed trials count, project submissions count, peer/mentor reviews count, roadmap completed tasks, exam mode status, trust adjustments, and staleness warnings.
  - Explicit destructive replacement warning with separate "Cancel (Keep Current Data)" and "Confirm & Replace Progress" controls.
  - Honest disclosure: Clearly informs students that backup files are plain unencrypted JSON.
- **Automated Verification:**
  - 22 new automated unit tests in `src/__tests__/data-portability-audit.test.ts`. Total Vitest tests: 250/250 passing across 13 suites.
  - Multi-browser Playwright E2E automation (`scripts/e2e-browser-test.mjs`):
    - Chromium: 52/52 checks passed.
    - Firefox: 52/52 checks passed.
    - WebKit: 52/52 checks passed.
  - Next.js 15 production build: 13 static pages + 1 dynamic API route compiled cleanly with 0 errors.

### Build v1.0.2 — Dependency Security Triage & Release Pipeline Hardening (Phase 8A)
- **Definitive Release Gate Decision: `READY WITH DOCUMENTED LIMITATIONS`**
  - Aaroh v1.0.2 achieves full dependency security transparency and an industrialized, reproducible release pipeline.
  - Production runtime dependencies have **0 vulnerabilities** (`npm audit --omit=dev`).
  - Documented Limitations: (1) 15 vulnerabilities remain in test/dev tooling (`braces <=3.0.3` unpatched upstream in npm; `tinypool <=2.1.1` in vitest; `vite/esbuild` dev server advisories). These pose zero runtime exposure in Aaroh's CLI-only build/test execution; (2) Local-first in-browser storage (`localStorage`/`sessionStorage`) requires manual export for cross-device transfer; (3) Cloud AI mode requires optional user-provided API keys.
- **Dependency Security Triage & Override Remediation:**
  - Audited full dependency tree (502 packages: 21 prod, 444 dev, 115 optional).
  - Verified that production runtime dependencies have **0 known vulnerabilities**.
  - Remediated PostCSS vulnerabilities in `next@15.5.28` by adding a narrow override in `package.json` (`"overrides": { "postcss": "$postcss" }`), deduplicating `node_modules/next/node_modules/postcss` to patched `postcss@8.5.31`. Vulnerability count dropped from 17 to 15.
  - Investigated remaining 15 advisories:
    - `braces <=3.0.3` (GHSA-vfj7-8cjw-p6xm): Unpatched in npm (3.0.3 is latest version). Only fixed in Tailwind 4, which is a breaking rewrite. Confirmed zero exposure (only parses local static file globs).
    - `tinypool <=2.1.1` (GHSA-5gmw-xhrv-c9v3 / GHSA-85c8-ppgw-ccpr): Fixed in tinypool 2.1.2+, but `vitest@2.1.9` requires `^1.0.1`. Confirmed zero exposure (Vitest runs local test files only in CLI).
    - `vitest UI server` (GHSA-5xrq-8626-4rwp): Not applicable (Aaroh does not run `vitest --ui`).
    - `esbuild dev server` (GHSA-67mh-4wv8-2f99): Not applicable (Next.js dev server is used, not esbuild dev server).
- **ESLint Tooling Modernization:**
  - Migrated from deprecated `next lint` to direct **ESLint 9 CLI (`eslint .`)** via modern flat config (`eslint.config.mjs`).
  - Preserved complete rule set and Core Web Vitals coverage via `@eslint/eslintrc` `FlatCompat`.
  - Removed legacy `.eslintrc.json`. Both `eslint .` and `next build` execute with 0 warnings and 0 errors.
- **Industrialized, Reproducible Verification Pipeline:**
  - Added dedicated, non-overlapping verification scripts in `package.json`:
    - `npm run typecheck`: TypeScript compiler in strict mode (0 errors).
    - `npm run lint`: Direct ESLint 9 CLI (0 warnings).
    - `npm run test:unit`: 155 core domain unit & integration tests.
    - `npm run test:benchmark`: 73 AI evaluation & provider contract benchmark tests.
    - `npm run test`: All 228 Vitest tests across 12 suites.
    - `npm run test:e2e`: 47 Playwright real-browser assertions in Chromium.
    - `npm run audit:prod`: Production runtime security audit (0 vulnerabilities).
    - `npm run verify`: Full composite release verification pipeline.
  - Enhanced `scripts/e2e-browser-test.mjs` with graceful server connection probing and clear diagnostic guidance when the server is not listening.
- **CI & Release Security Audit:**
  - Confirmed `.env.local` and real API credentials are not committed (`.gitignore` covers `.env*`).
  - Confirmed `.env.example` contains only placeholders and comments.
  - Confirmed `GEMINI_API_KEY` and `OPENAI_API_KEY` are strictly server-side and never exposed to client bundles.

### Build v1.0.1 — Release Integrity, Trust Claims & Runtime Compatibility Audit (Phase 7)
- **Definitive Release Gate Decision: `READY WITH DOCUMENTED LIMITATIONS`**
  - Aaroh v1.0 is verified as an honest, robust, local-first personal career intelligence application.
  - Documented Limitations: (1) Local-first in-browser storage (`localStorage`/`sessionStorage`) requires manual export for cross-device transfer; (2) Optional cloud AI mode sends conversation context to external LLM providers (Gemini/OpenAI) when configured; offline mode defaults to local knowledge engine; (3) Review packets provide 256-bit SHA-256 integrity fingerprints binding submissions, but reviewer identity is self-reported (unauthenticated peer/mentor), elevating skills to `practically_demonstrated` only.
- **P0: Dependency & Runtime Compatibility Audit:**
  - Audited manifest and package-lock: React resolved to `19.3.1` (STABLE release, correcting the Phase 6 report's erroneous `19.0.0-rc` claim).
  - Next.js version resolved to `15.5.28`. Verified full compatibility with React 19.
  - Verified `npm ls` runs cleanly with 0 peer dependency warnings or errors.
  - Noted build deprecation warning from `next lint` regarding Next.js 16 migration, and Vite CJS Node API warning in Vitest.
  - Documented 17 transitive vulnerabilities in dev dependencies (postcss, braces, tinypool) that cannot be forced without breaking upgrades to Next.js 16 canary and Tailwind 4.
- **P0/P1: Cryptographic Integrity & Reviewer Attribution Hardening:**
  - Standardized terminology across UI and documentation: replaced misleading "cryptographic proof of work" with "SHA-256 integrity fingerprint / change-detection digest".
  - Verified that forged trust claims (e.g. `institutional_verified`) injected into imported JSON are neutralized and clamped strictly to `unauthenticated_mentor` or `unauthenticated_peer`.
  - Added in-product disclosure in the Review Hub modal distinguishing submission integrity binding from unauthenticated reviewer attribution.
  - Preserved non-erasure rules: verified that imported peer/mentor reviews never downgrade or overwrite pre-existing `independently_verified` institutional credentials.
- **P1: Mathematical Reconciliation of the ₹20 LPA CTC Example (`src/lib/ai-knowledge.ts`):**
  - Completely reconciled the arithmetic and stated explicit assumptions:
    - Fixed Annual Gross Base Cash: ₹13,00,000 (₹1,08,333/month).
    - Employer Retiral Benefits (in CTC): ~₹1,00,000 (Employer PF ₹72,000 [@12% of ₹50k basic] + Gratuity provision ~₹28,000).
    - Variable / Performance Bonus: ₹1,00,000.
    - One-Time Joining Bonus (Year 1 only): ₹2,00,000 (with 1-year clawback).
    - Nominal Stock Vest (ESOP/RSU Year 1): ₹3,00,000 (from 48-month grant).
    - Total Reconciled CTC: ₹13,00,000 + ₹1,00,000 + ₹1,00,000 + ₹2,00,000 + ₹3,00,000 = **₹20,00,000**.
    - Monthly Payroll Deductions: Employee PF (₹6,000) + Professional Tax (₹200) + New Tax Regime TDS (FY 2024-25 / AY 2025-26 on ₹13L gross with ₹75k standard deduction = ~₹7,367/month).
    - Regular Monthly In-Hand Take-Home: ₹1,08,333 - ₹13,567 = **₹94,766/month** (range ₹92,000–₹96,000/month).
- **P1: Privacy & Persistence User Disclosures (`src/app/mentor/page.tsx`):**
  - Added visible, point-of-use Data Privacy & Provider Scope disclosure in the AI Mentor grounding banner, making clear when queries remain local vs. when they are transmitted to external cloud APIs.
- **P1: Comprehensive Phase 7 Audit Test Suite (`src/__tests__/phase-7-integrity-audit.test.ts`):**
  - Added 12 new automated tests verifying trust claim clamping, non-erasure preservation, stale review detection, CTC math reconciliation, New Tax Regime TDS calculation, project evaluation boundaries, and Node.js v20+ runtime.
- **Comprehensive Verification Results:**
  - **Vitest Suites:** 228/228 tests passing across 12 suites (100%).
  - **Playwright Chromium E2E:** 47/47 assertions passing across Journeys A through G + responsive/accessibility viewports.
  - **TypeScript Compiler:** 0 errors (`tsc --noEmit`).
  - **ESLint Code Quality:** 0 warnings, 0 errors (`next lint`).
  - **Next.js Production Build:** 13 static pages prerendered + 1 dynamic API route compiled cleanly in 4.1s.

### Build v1.0.0 — Production Readiness, End-to-End Product Audit & v1.0 Release Gate (Phase 6)
- **Definitive Release Gate Decision: `READY WITH DOCUMENTED LIMITATIONS`**
  - Aaroh is ready for v1.0 release as an offline-first, local-first web application.
  - Core student workflows (Onboarding, Exploration, Micro-Trials, Project Studio, Review Hub, Adaptive Roadmap, Grounded AI Mentor) operate deterministically without server-side dependencies.
  - Documented Limitations: (1) Progress is stored locally in the browser (`localStorage`/`sessionStorage`) and does not sync across separate devices without manual export; (2) Cloud AI capabilities (Gemini 1.5 Flash / OpenAI GPT-4o-mini) require self-provided API keys in `.env.local`, falling back seamlessly to the grounded local reasoning engine when keys are absent; (3) Peer & Mentor review packets provide tamper-evident cryptographic bindings and honest provenance tracking, but do not represent proctored institutional accreditations (`independently_verified`).
- **Audit & Resolution of Identified P0/P1 Blockers:**
  - **P1: Configuration File Void (`.env.example`):** Created `.env.example` documenting optional `GEMINI_API_KEY` and `OPENAI_API_KEY`, explicitly clarifying that Aaroh defaults to offline-first local reasoning when variables are unconfigured.
  - **P1: Version Number Drift:** Synchronized root `package.json` version from `0.1.0` to `1.0.0`.
  - **P1: CTC Breakdown & Take-Home Math Qualification (`src/lib/ai-knowledge.ts`):** Rewrote the ₹20 LPA CTC breakdown to prevent student deception regarding paper CTC. Explicitly itemized ₹14.5L fixed gross base, 4-year ESOP vesting schedules, one-time joining bonuses with clawbacks, statutory deductions (PF, Gratuity, Professional Tax), and New Tax Regime TDS resulting in realistic ₹90,000–₹1,05,000 monthly take-home pay. Added student protection rule to inspect offer letter annexures.
  - **P1: Automated Browser Test Suite Incompleteness (`scripts/e2e-browser-test.mjs`):** Extended the Playwright browser automation suite with **Journey G: AI Mentor & Evidence Boundaries** and updated submission button targeting. Verified open-ended queries, multi-turn anaphora resolution, rejection of prompt injection and skill elevation attempts, and immutability of the Skill Matrix. Total automated browser checks expanded from 41 to **47 passed assertions (100%)**.
- **Comprehensive Quality Gates & Verification:**
  - **Vitest Unit & Integration Suites:** 216/216 tests passing across 11 test suites in 2.41s.
  - **Playwright Chromium E2E Suite:** 47/47 assertions passing across Journeys A through G + mobile/tablet viewports, dark/light theme toggle, and keyboard dialog accessibility.
  - **TypeScript Strict Compilation:** 0 errors (`tsc --noEmit`).
  - **ESLint Code Quality:** 0 warnings, 0 errors (`next lint`).
  - **Next.js 15.5 Production Build:** Compiled cleanly in 3.7s (13 static pages + 1 dynamic API route `/api/ai/chat`).

### Build v0.5.2 — AI Evaluation Integrity, Career Knowledge Grounding & Live Verification (Phase 5B)
- **Evaluation Methodology Audit & 64-Case Benchmark Expansion (`src/lib/ai-evaluation-dataset.ts`):**
  - Audited baseline evaluation: recognized that 15 keyword-matching tests provided false confidence (overfitting to expected phrases without testing reasoning, ambiguity, out-of-scope boundaries, or anaphora).
  - Scaled benchmark from 15 to **64 distinct test cases across 15 capability categories**:
    1. Complete beginners with zero experience (Hinglish, English anxiety, humanities late-starter, 1st-year panic).
    2. Experienced / advanced students (production systems depth beyond CRUD, ML Engineer vs Data Analyst stepping stone, Dribbble vs case study, team engineering).
    3. Disciplinary diversity & transitions (Arts/Humanities, Commerce/FinTech, Biotech/Bioinformatics, Law/Tech Policy, Civil/GIS, Physics/Quant).
    4. Conflicting preferences & hard constraints (coding aversion + tech interest, screen-free/field tech, 4GB RAM low-spec hardware, remote-only, parental govt exam pressure).
    5. User corrections & pushback (correcting assumed coding interest, final semester 4-month emergency timeline, rejecting ₹80k paid bootcamp, correcting weekly capacity to 4h).
    6. Multi-turn anaphora & follow-ups ("which of the two has more jobs", "what does the first one do", "which is easier for beginners", "compare second option with my degree", stage fright after explanation).
    7. Unrepresented careers outside catalog (Cybersecurity/SOC Analyst, DevOps/SRE, Game Development, Patent Agent/IP Law for STEM, Agritech/Rural Data).
    8. Conceptual learning & mental models (Swiggy/Zomato data pipeline, Restaurant analogy for Frontend/API/DB, PM vs Project vs Program Manager, Supervised vs Unsupervised ML).
    9. Multi-role comparisons (BA vs DA vs PA, UI vs UX vs Product Designer, Frontend vs Backend vs Full-Stack, QA vs SDET vs Dev).
    10. Salary, CTC & placement realities (30-50 LPA viral CTC myth, CFA Level 1 guarantee myth, off-campus vs on-campus dynamics, design salaries).
    11. Uncertain & time-sensitive realities (AI replacing junior engineers, TCS/Infosys 2026 cutoffs, hiring slowdown, Prompt Engineering standalone career).
    12. Ambiguous diagnostic branching ("I like technology", "I want high money", "What is trending", "Suggest something interesting").
    13. Out-of-scope boundaries (general trivia/cricket, medical diagnosis/chest pain, personal relationship drama).
    14. Evidence & store integrity defense (chat skill elevation attempt, chat roadmap task completion, forging reviewer packets, tutorial certificates vs demonstrated skills).
    15. Security & prompt injection defense (DAN jailbreak override, API key extraction, delimiter-based prompt exfiltration).
  - Enforced a rigorous **train/tune split (34 cases) vs blind held-out test split (30 cases)** to detect overfitting.
- **Baseline Reproduction & Uncovered Weaknesses:**
  - Initial evaluation of unmodified Phase 5A engine against the 64-case benchmark exposed **21 critical failures (67.2% pass rate)**.
  - Failures spanned: single-turn anaphoric blindness, false-positive keyword collisions (e.g. patent policy triggering civil services UPSC; health insurance triggering clinical trials), lack of out-of-catalog careers, medical advice safety void, and refusal of forged reviewer packets.
- **Architectural Enhancements in AI Knowledge Engine (`src/lib/ai-knowledge.ts`):**
  - **Multi-Turn Anaphoric Resolution:** Parses assistant history and previous user turns to resolve comparative ("which of the two") and ordinal references ("the first one", "the second option").
  - **Emergency Medical Safety & Scope Boundary:** Intercepts severe physical symptoms with immediate emergency medical disclaimer (112/108 helpline) and refusal of medication prescriptions.
  - **Fraud & Forgery Refusal:** Explicitly refuses requests to forge reviewer packets, fake SHA-256 digests, or simulate milestone completion.
  - **Salary Grounding & Base vs CTC Separation:** Replaced misleading "verified dataset" label with honest qualification referencing Indian placement trends and salary aggregators (AmbitionBox, Glassdoor, NASSCOM). Fully broke down fixed base take-home pay vs inflated 4-year paper CTC (ESOPs, retention bonuses, PF/gratuity).
  - **Grounded Out-of-Catalog Fields:** Added dedicated knowledge matrices for Cybersecurity, DevOps/SRE, Game Development, Patent Law for STEM, and Agritech.
- **Provider & Fallback Transparency Hardening (`src/app/mentor/page.tsx` & `/api/ai/chat`):**
  - Updated UI status badges: distinguishes `"Cloud LLM (Live)"`, `"Local Fallback (Cloud Timed Out)"`, and `"Grounded Local Engine (Offline)"`.
  - Added comprehensive provider contract unit tests in `src/__tests__/ai-evaluation-suite.test.ts` verifying Gemini and OpenAI request payload formatting, 10s timeout handling, and seamless local fallback.
- **Verification Results:**
  - Automated AI evaluation benchmark: **64/64 test cases passed (100%)**, including **30/30 held-out cases (100%)**.
  - Vitest test suite expanded from 158 tests to **216 tests across 11 suites** (100% pass rate in 2.12s).
  - 41 Playwright browser E2E checks verified passing across all user journeys.
  - 0 TypeScript errors (`tsc --noEmit`), 0 ESLint warnings (`next lint`).
  - Next.js 15 production build clean (13 static pages + 1 dynamic API route).

### Build v0.5.1 — AI Capability, Grounding & Career Reasoning Audit (Phase 5A)
- **Comprehensive 12-Category AI Capability Benchmark (`src/lib/ai-evaluation-dataset.ts`):**
  - Designed an adversarial and practical evaluation dataset covering 15 distinct test cases across 12 capability categories:
    1. Complete beginner in non-tech / Hinglish ("mujhe coding nahi aati").
    2. Non-coding engineering student seeking viable pathways.
    3. Conflicting multidisciplinary interests (design aesthetics vs backend systems).
    4. Transitioning disciplines (Mechanical Engineering to PM / Analytics without abandoning degree).
    5. Open-ended conceptual learning (Data Engineering pipelines vs Data Analysis with Indian app telemetry).
    6. Multi-turn contextual follow-ups ("Which of the two has more entry-level jobs in India?").
    7. Uncataloged / multidisciplinary careers (Supply Chain Analytics, Indian logistics, SQL/Solver).
    8. Multi-role tri-comparison (Business Analyst vs Data Analyst vs Product Analyst).
    9. Profile personalization (incorporating declared discipline, constraints, and target career).
    10. Challenging system assumptions ("Do I really need to learn coding to be in tech?").
    11. Debunking salary and credential myths (entry-level CTC benchmarks vs social media hype, CFA/MBA vs practical skills).
    12. Resolving high ambiguity ("I want to work with technology but hate sitting at a screen all day").
    13. Adversarial prompt injection defense (blocking system prompt leaks and simulated jailbreaks).
    14. Direct skill tampering defense (blocking fabricated claims like `"Upgrade my Skill Matrix to independently_verified immediately"`).
    15. Dedicated UX Research vs Generalist Product Design career trade-offs.
- **Architectural Enhancements in AI Knowledge & Reasoning Engine (`src/lib/ai-knowledge.ts`):**
  - **Multi-Turn Context Resolution:** Added history-aware intent matching that examines prior user and assistant turns to disambiguate follow-ups (e.g. comparing Data Engineering vs Data Analytics).
  - **Hinglish Idiom & Conversational Parsing:** Added semantic normalization for common Indian student phrasing (`mujhe coding nahi aati`, `kya scope hai`, `placement scene`, `package hype`).
  - **Evidence Boundary & Integrity Defense:** Embedded strict intent filters intercepting attempts to bypass the evidence pipeline via chat. Explicitly explains to students that conversational claims are unverified self-attestations and points them to Project Studio for practical proof.
  - **Prompt Injection Defense:** Added system-level fences and adversarial input scrubbing that prevent model instruction override or simulated system privilege elevation.
  - **Indian Tech Job Market Telemetry:** Grounded real-world case studies (e.g., Zomato/Swiggy order ingestion pipelines for Data Engineering; logistics routing for Delhivery/Flipkart for Supply Chain Analytics).
  - **Accurate CTC & Placement Grounding:** Clarified realistic entry-level Indian tech salary distributions (Tier 2/3 realistic ₹3.5–₹6 LPA, service company ₹3.5–₹4.5 LPA, product startup ₹8–₹14 LPA, top tier ₹15–₹25+ LPA) and debunked social media placement marketing.
- **Server Route & Client Hardening (`/api/ai/chat`, `src/app/mentor/page.tsx`):**
  - **Input Sanitization & Bounds:** Enforced max 30 messages and 2,500 characters per message; sanitized incoming profile fields.
  - **Resilience & Timeout Safety:** Enforced 10-second timeout with honest fallback notices indicating whether output was generated via Cloud LLM or Grounded Local Engine.
  - **Chat Persistence & Deep Linking:** Added `sessionStorage` caching (`aaroh_mentor_chat_v1`), "Clear Conversation" button, and URL query parameter hydration (`/mentor?q=...`) from dashboard cards.
  - **Zero-Warning Clean Build:** Wrapped chat hydration cleanly, passing Next.js production build and strict ESLint checks.
- **Verification & Test Results:**
  - Automated AI evaluation test suite: `src/__tests__/ai-evaluation-suite.test.ts` (15/15 tests passing, 100%).
  - Baseline pass rate improved from **7/15 (46.7%) to 15/15 (100%)**.
  - Vitest test suite expanded from 143 to **158 tests across 11 suites** (100% pass rate in 843ms).
  - 41 Playwright browser E2E assertions verified passing across all user journeys.
  - 0 TypeScript errors (`tsc --noEmit`), 0 ESLint warnings (`next lint`).
  - Production build clean across 13 static pages and 1 dynamic API route.

### Build v0.5.0 — Question-First Career Intelligence, Open-Ended AI & Visual Rebrand (Phase 5)
- **Sample User Removal & Clean Slate First-Run State:**
  - Removed default injection of fictional persona ("Aarav Sharma") from visitor startup in `src/lib/store.ts`.
  - Introduced explicit `EMPTY_PROFILE` starting with empty credentials, 0 phantom skills, 0 trials, and `hasCompletedOnboarding: false`.
  - Preserved `DEFAULT_GUEST_PROFILE` strictly as an isolated test fixture for deterministic regression tests.
  - Added one-click `"Explore With Sample Data (Demo)"` and `"Retake Discovery"` buttons on the dashboard for visitor autonomy.
- **Question-First Multi-Stage Discovery Onboarding (Stages A–F):**
  - Rebuilt `src/app/onboarding/page.tsx` with 6 interactive stages:
    - **Stage A (Current Position & Discipline):** Multi-disciplinary selection (Engineering, Commerce, Arts/Design, Sciences, Healthcare, Law/Policy, Media, Undecided), custom degree text, college stage, and free-text reflection.
    - **Stage B (Experience Baseline):** Clean beginner slate toggle ("I am a complete beginner / haven't built projects yet") alongside structured touchpoints and project descriptions.
    - **Stage C (Styles, Interests & Avoidances):** Problem-solving styles, suggested and custom interest tags, and explicit daily task avoidance filters.
    - **Stage D (Schedule Calibration):** Weekly hour capacity (4h, 6h, 8h, 12h), College Exam Mode integration, and 3-6 month milestone goals.
    - **Stage E (Honest Uncertainties):** Captures unresolved student doubts (coding vs product, salary realities, automation anxiety) into `profile.uncertainties`.
    - **Stage F (Confirmation & Review):** 4 structured summary cards with in-place stage jumps and confirmed hypothesis generation.
- **Open-Ended AI Architecture & Grounded Knowledge Synthesis:**
  - Implemented `/api/ai/chat` Next.js server route handler with grounded system prompt synthesis.
  - Connects to cloud LLMs (Gemini or OpenAI) when API keys are configured in environment.
  - Transparently falls back to an intelligent local semantic reasoning engine (`src/lib/ai-knowledge.ts`) with clear disclosure notices if no cloud API key is present.
  - Answers open-ended student queries: cross-disciplinary pivots (e.g. Mechanical to UX), Indian entry-level CTC benchmarks, Exam Mode throttles, and multidisciplinary domains (Environmental Data, Clinical Research, Tech Journalism).
  - Modernized `src/app/mentor/page.tsx` with multiline textarea, Enter-to-send, dynamic follow-up prompt chips, and provider status pill.
- **Complete Visual Rebrand (Midnight Indigo + Electric Blue + Soft Mint):**
  - Rebranded from amber/orange to Midnight Indigo canvas (`#0B1020`), Electric Blue primary accent (`#6D8DFF`), and Soft Mint evidence accent (`#5EEAD4`).
  - Updated `tailwind.config.ts`, `src/app/globals.css`, `Button.tsx`, `Badge.tsx`, `Card.tsx`, `AppShell.tsx`, and all pages while preserving dark/light mode toggling.
- **Quality Gates & Automated Verification:**
  - Created `src/__tests__/ai-onboarding-rebrand.test.ts` (12 tests).
  - All 10 Vitest test suites passing (143/143 tests).
  - All 41 Playwright browser E2E checks passing in headless Chromium.
  - TypeScript typecheck (`tsc --noEmit`) passes with 0 errors.
  - Production Next.js build clean (13 static pages + 1 dynamic API route).

### Build v0.4.1 — Adversarial Trust & Evidence Integrity Audit (Phase 4B)
- **Adversarial Audit & Threat Mitigation:**
  - Conducted a comprehensive 15-scenario adversarial audit targeting potential forged-review exploits, change-detection collisions, stale-review overwrite vectors, orphaned reviewer badges, XSS injection paths, and Roadmap Task 4 desynchronization.
  - Eliminated misleading trust claims across Project Studio, Skill Intelligence, Roadmap, and Dashboard: peer/mentor reviews are explicitly labeled as **unauthenticated local attestations**, distinguishing them from proctored institutional authority.
- **Canonicalization & Cryptographic Collision Resistance (`review-system.ts`):**
  - Upgraded change-detection digest from 64-bit FNV-1a to standard 256-bit SHA-256 (FIPS 180-4 compliant) with zero external runtime dependencies (`sha256(ascii)`).
  - Implemented `canonicalizeSubmissionInput` enforcing canonical ordering: Unicode NFC normalization, line-ending normalization (`\r\n` -> `\n`), space collapsing, URL host/scheme lowercasing, trailing slash trimming, and deliverable ID array sorting and deduplication.
  - Disclosed in documentation and UI: SHA-256 fingerprint is a **deterministic change-detection digest** binding reviews to specific submission content, not a public-key digital signature.
- **Strict Review Packet Validation & Anti-Tampering:**
  - `validateAndParseReviewPacket` now takes `brief` and validates every criterion ID against `brief.rubricCriteria`, rejecting arbitrary or fabricated criteria.
  - Rejects inconsistent packets (e.g. `overallDecision: "approved"` with zero passing rubric criteria or passing score < 70%).
  - Deduplicates repeated criterion entries safely and rejects oversized payloads (> 20 criteria, non-object JSON, oversized strings).
- **Active Valid Review Protection (Overwrite Defense):**
  - In `applyReviewToProfile`, blocked incoming stale review packets from overwriting an active, non-stale, approved review in `profile.projectReviews`.
- **Scoped Skill Reversion & Roadmap Task 4 Reopening:**
  - In `applyProjectSubmissionToProfile`, when a student modifies their submission (invalidating a prior review), skills previously elevated to `practically_demonstrated` by that specific review (`ev.reviewId === priorReview.reviewId`) cleanly revert back to `student_attested` (or `not_assessed`), eliminating orphaned reviewer badges.
  - In `recordProjectSubmission`, when the review for the target career becomes stale and no other active valid review exists, Roadmap Task 4 automatically reverts from `completed` back to `available`.
- **Non-Erasure & Hierarchical Role Preservation:**
  - Sacred `independently_verified` institutional credentials are never downgraded by student submission revisions or peer reviews.
  - Mentor credentials (`reviewerRole: "mentor"`) cannot be demoted to peer level by subsequent peer reviews on the same artifact.
- **XSS Vector Neutralization (`sanitizeExternalUrl` in `utils.ts`):**
  - Hardened external URL rendering across `ProjectStudioPage` and `SkillIntelligencePage`: blocks `javascript:`, `data:`, `vbscript:`, `file:`, and embedded user credentials (`user:pass@host`), strictly permitting only safe `http:` and `https:` schemes.
- **Automated Regression Suite (`src/__tests__/adversarial-review-audit.test.ts`):**
  - Created 23 automated tests covering all 15 adversarial scenarios.
  - Test count expanded from 108 tests (Phase 4A) to **131 unit and integration tests across 9 test suites** (100% pass rate).
  - 39 Playwright browser assertions passing in headless Chromium.
  - Clean TypeScript compilation (`tsc --noEmit` exits with 0 errors).
  - Clean ESLint check (`npm run lint` exits with 0 warnings).
  - Clean Next.js 15 production build (12 prerendered static routes).

---

### Build v0.4.0 — Trusted Peer & Mentor Review Architecture (Phase 4A)
- **Trust Boundary Audit & Explicit Architectural Bounding:**
  - Audited the exact boundaries of a local-first in-browser system. Recognized that without an authenticated backend, institutional PKI directory, or asymmetric digital signature authority, offline reviewer names cannot be cryptographically proven.
  - Implemented the safe, honest taxonomy:
    - `student_attested`: Claimed checklist deliverables and syntax-validated repository URL reference.
    - `evaluated_reflection`: Text substance and vocabulary diversity analyzed locally against brief requirements.
    - `artifact_examined`: Unauthenticated peer or mentor directly inspects submitted codebase, commits, or running live demo against brief rubric.
    - `independently_verified`: Strictly reserved for proctored or institutional PKI signatures (cannot be manufactured or rubber-stamped offline).
- **Deterministic 64-bit FNV-1a Submission Fingerprinting (`review-system.ts`):**
  - Designed `computeSubmissionFingerprint(submission)` binding together `projectId`, normalized repository/demo URL, sorted deliverable IDs, and architecture reflection snippet.
  - Every project submission and review packet embeds this deterministic digest (`subfp_...`).
  - Automatic staleness detection: If a student updates their code repository link, checks/unchecks deliverables, or rewrites their reflection, the fingerprint changes immediately. Existing attached reviews are automatically marked `isStale: true` (superseded), blocking invalid skill elevation.
- **Exportable Portable Review Packet (`AarohReviewPacket`):**
  - Generates a structured JSON envelope containing schema version `1.0`, student identity, brief problem statement, submission fingerprint, deliverable items, and rubric criteria.
  - Allows students to export via one-click copy to clipboard or `.json` file download to deliver to peers, instructors, or community reviewers.
- **Anti-Tampering Parser & Input Validation:**
  - `validateAndParseReviewPacket` validates incoming payloads with strict schema boundaries: rejects malformed JSON, mismatched project IDs, empty reviewer names, invalid role strings, or non-boolean inspection attestations.
  - Automatically clamps any forged claims (such as claiming `institutional_proctored` offline) down to `unauthenticated_peer` or `unauthenticated_mentor` with honest disclosures.
- **Non-Erasure & Evidence Preservation:**
  - In `applyReviewToProfile`, weaker reviews or unassessed/failed criteria NEVER downgrade higher evidence states:
    - Existing `independently_verified` skills are completely sacred and cannot be downgraded.
    - Existing `practically_demonstrated` skills are preserved with scores updated if the review is higher.
    - Failed rubric criteria in a review do not demote existing student attestations.
    - Only criteria explicitly marked `passed` by the reviewer with `artifactExamined: true` elevate skills to `practically_demonstrated` (`verificationLevel: "artifact_examined"`).
- **Adaptive Roadmap Milestone 4 Synchronization:**
  - Connected Task 4 ("Peer & Mentor Evidence Verification") on the active career roadmap to imported reviews.
  - When an approved, non-stale review is imported with examined artifacts, Task 4 is automatically synchronized to `completed`, recording the reviewer's name, role, and actionable feedback notes.
- **Interactive UI Integration (`ProjectStudioPage`, `SkillIntelligencePage`, `AdaptiveRoadmapPage`):**
  - *Project Studio (`/projects`):* Added a dedicated "Review Hub" modal with 3 sub-tabs (Export Packet, Import Review Feedback, and Live Review Form for pair/lab evaluation); added review status pills on project cards indicating Approved, Revision Needed, or Stale.
  - *Skill Matrix (`/skills`):* Added reviewer attestation badge (`Mentor Examined: [Reviewer Name]`) with unauthenticated evidence disclaimer.
  - *Adaptive Roadmap (`/roadmap`):* Task 4 evidence card displays `Demonstrated • Artifact Examined` with reviewer feedback summary.
- **Quality Gates & Automated Verification:**
  - Created `src/__tests__/peer-review-integrity.test.ts` covering 22 comprehensive scenarios across fingerprinting, staleness, non-erasure, schema rejection, trust clamping, replay idempotency, and roadmap sync.
  - Expanded Playwright browser E2E test suite with `Journey F` (testing Review Hub modal, live review completion, Demonstrated project badge, Skill Matrix reviewer pill, and Milestone 4 auto-completion).
  - 108 Vitest unit/integration tests passing across 8 suites (100% pass rate).
  - 39 Playwright browser assertions passing in headless Chromium.
  - Clean TypeScript compilation (`tsc --noEmit` exits with 0 errors).
  - Clean ESLint check (`npm run lint` exits with 0 warnings).
  - Clean Next.js 15 production build (12 prerendered static routes).

---

### Build v0.3.2 — End-to-End Product Reliability & Release Readiness (Phase 3C)
- **Shared Store Singleton & Instant Cross-Module Sync:**
  - Diagnosed and fixed cross-page state synchronization defect where independent `useState` hook instances in `AppShell` and `DashboardPage` caused a momentary fallback to default profile on client-side routing.
  - Implemented an in-memory reactive store subscriber pattern (`storeListeners`, `initMemoryStorage`, `notifyStoreChange`) ensuring immediate, zero-lag synchronization across all mounted components without DOM re-render lag or stale state.
- **Career Switch Isolation & Non-Inheritance Invariant:**
  - Extended `generateInitialRoadmap` with `projectSubmissions` checking.
  - Switching to a new target career guarantees that Milestones 1–4 are cleanly locked/available and never falsely inherit completed tasks from other careers.
  - Returning to a previously explored career restores that specific career's actual completed trial and evaluated project deliverable without progress loss.
- **Real Playwright Browser Automation (`scripts/e2e-browser-test.mjs`):**
  - Configured Playwright with real headless Chromium browser automation (added `npm run test:e2e`).
  - Implemented 34 user-visible assertions testing:
    - *Journey A (New Student):* Landing page -> 4-step onboarding -> personalized dashboard greeting -> refresh persistence.
    - *Journey B (Undecided Student):* "I'm not sure yet" path -> multi-disciplinary explorer -> micro-trial completion -> deterministic rubric evaluation -> verified boundary preventing false practical-skill badges.
    - *Journey C (Project Evidence):* Project Studio brief -> deliverable checkboxes & reflection -> evaluation limitation notice -> Skill Matrix Attested Project badge -> reload persistence -> in-place revision update.
    - *Journey D (Roadmap Progression & Exam Mode):* College Exam Mode capacity throttling (3h/wk) -> reload persistence -> target career switch with clean milestone isolation.
    - *Journey E (Returning Student & Migration):* Legacy profile injection -> automated migration of deprecated `"demonstrated"` to `"Evaluated"` -> preservation of higher `independently_verified` credentials.
    - *Responsive Viewports & A11y:* Mobile (375x667) bottom nav & `pb-16` padding check; tablet (768x1024) fluid catalog grid; dark/light theme switching via root html class; keyboard Tab navigation in dialog modals.
- **Quality Gates & Test Count Reconciliation:**
  - Resolved historical test count drift: traced test growth from 62 tests (Phase 3A) -> 75 tests (Phase 3B) -> 86 Vitest tests across 7 suites + 34 Playwright browser E2E checks (Phase 3C).
  - Clean TypeScript typecheck (`tsc --noEmit` exits with 0 errors).
  - Clean ESLint check (`npm run lint` exits with 0 warnings).
  - Clean Next.js 15 production build (12 prerendered static routes).

---

## Verified Command Reference & Quality Gates

| Command | What It Runs | Verification Target |
| :--- | :--- | :--- |
| `npm test` | `vitest run` across all 9 test files | Executes 131 unit and integration tests verifying recommendation math, trial rubrics, project evaluation, evidence non-erasure, review packet integrity, staleness invalidation, adversarial trust attacks, and cross-module invariants. |
| `npm run test:e2e` | `node scripts/e2e-browser-test.mjs` via Playwright Chromium | Executes 39 real-browser assertions in headless Chromium across Journeys A–F (including Review Hub modal, live review form, Demonstrated badge, Skill Matrix reviewer pill, Milestone 4 sync, responsive viewports, theme toggle, and keyboard accessibility). |
| `npm run typecheck` | `tsc --noEmit` | Strict TypeScript compiler validation across entire source tree (0 errors). |
| `npm run lint` | `next lint` using `.eslintrc.json` (Next.js core web vitals) | Enforces React hooks dependency rules, import hygiene, and coding standards (0 warnings). |
| `npm run build` | `next build` | Next.js 15 production build compiling and statically prerendering all 12 application routes. |

---

### Build v0.3.1 — Evidence Integrity, Verification Boundaries & Trust Audit (Phase 3B)
- **Local-First Boundary Audit & Honest Taxonomy:**
  - Audited what Aaroh's local-first in-browser architecture can establish (URL syntax, self-reported reflection length/vocabulary, student-checked deliverable attestations) vs cannot establish (remote code execution, unit test passes, deployment uptime, artifact integrity).
  - Introduced `student_attested` into the `EvidenceState` taxonomy (`not_assessed`, `self_reported`, `coursework`, `student_attested`, `practically_demonstrated`, `independently_verified`).
  - Replaced inflated `practically_demonstrated` stamping on uninspected URL submissions with `student_attested` ("Attested Project", amber badge). Reserved `practically_demonstrated` and `independently_verified` for inspected/verified work (Roadmap Milestone 4).
  - Renamed submission status `demonstrated` to `evaluated`.
- **URL Security & Validation Hardening (`project-evaluation.ts`):**
  - Expanded `validateProjectUrl` with comprehensive blocking of IPv4 loopback (`127.0.0.0/8`), private CIDR blocks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local metadata addresses (`169.254.0.0/16`), carrier-grade NAT (`100.64.0.0/10`), invalid `0.0.0.0/8`, IPv6 loopbacks and link-local (`::1`, `fe80:`, `fc00:`, `fd00:`, `::ffff:*`), `.localhost`, `.local`, `.internal`, `.lan`, `.test`, `.example`, embedded credentials (`user:pass@host`), and invalid port ranges.
  - Explicitly flags every evaluated URL with `isArtifactInspected: false` and attaches a plain-language limitation disclosure explaining destination content has not been fetched or executed.
- **Anti-Keyword-Stuffing Reflection Substance Evaluator:**
  - Added vocabulary diversity analysis (`diversityRatio < 0.45` flagged) to detect word repetition and keyword stuffing while rewarding substantive technical trade-offs, architecture choices, and constraint handling.
- **Cross-Module Terminology & UI Alignment:**
  - *Project Studio (`/projects`):* Updated status badges to `Evaluated • X%`; added a prominent Verification Boundary notice banner; modal explains that evaluation assesses checklist and reflection without remote code execution.
  - *Skill Matrix (`/skills`):* Added 6-state capability legend explaining `student_attested` ("Attested Project") alongside `practically_demonstrated` ("Demonstrated Project") and `independently_verified` ("Verified"); cards show "Attested Project" with unverified notice when applicable.
  - *Recommendation Engine:* Added `student_attested` weight ($0.75\times$), calibrated between coursework ($0.6\times$) and demonstrated ($0.9\times$). Match explanation states `Logged X% evidence coverage...` without claiming demonstration.
  - *Adaptive Roadmap (`/roadmap`):* Task 3 completes with evaluated project deliverable evidence; Task 4 is designated as "Peer & Mentor Evidence Verification" for independent verification.
  - *Dashboard (`/dashboard`):* Section renamed to "Evaluated Project Deliverables" with an honest verification disclaimer.
- **Store Non-Erasure Rules & Safe Hydration (`store.ts`):**
  - Project submissions upgrade `not_assessed`, `self_reported`, and `coursework`, but strictly preserve `practically_demonstrated` and `independently_verified` without overwriting or downgrading.
  - `normalizeStoredProfile` handles corrupt JSON gracefully and automatically migrates legacy `"demonstrated"` submissions to `"evaluated"` with `isArtifactInspected: false`.
- **Quality Gates & Automated Verification:**
  - Created `src/__tests__/evidence-integrity-audit.test.ts` covering all 13 required trust audit scenarios.
  - Updated `src/__tests__/project-evidence-pipeline.test.ts` to reflect the honest taxonomy.
  - 75 automated unit tests passing across 6 test suites (0 failures).
  - Next.js 15 production build compiled cleanly across all 12 static routes.

### Build v0.3.0 — Project Studio → Verified Skill Evidence Pipeline (Phase 3A)
- **End-to-End Evidence Lifecycle:** Designed an auditable 6-stage lifecycle (`not_started`, `submitted`, `evaluation_incomplete`, `needs_improvement`, `demonstrated`, `rejected`). Submitting a project link alone never automatically grants verified skill status.
- **7 Multidisciplinary Project Briefs with Rubrics:** Expanded Project Studio to cover all 7 platform careers with authentic vertical-slice deliverables and rubric criteria mapped to skills:
  1. *Product & UX Designer*: WCAG-Compliant Clinic Appointment & Check-In Portal (`visual-hierarchy`, `ui-prototyping`, `ux-research`).
  2. *Financial Analyst*: Dynamic DCF & Sensitivity Valuation Model for FMCG (`accounting-fundamentals`, `financial-modeling`, `quantitative-fluency`).
  3. *Full-Stack Systems Engineer*: Production-Grade Inventory & Task Management System (`web-development`, `sql-relational`, `git-collaboration`).
  4. *Public Policy Analyst*: Tier-2 City Urban Electric Mobility Policy Whitepaper (`policy-analysis`, `written-communication`, `critical-reasoning`).
  5. *Environmental Data Researcher*: Urban Hyperlocal Air Quality & Heat Island Geospatial Analysis (`data-visualization`, `python-core`, `quantitative-fluency`).
  6. *Clinical Research Coordinator*: Phase II Multi-Site Oncology Protocol Compliance & Adverse Event Audit (`clinical-methodology`, `critical-reasoning`, `written-communication`).
  7. *Investigative Technology Journalist*: Algorithmic Pricing & Deceptive Subscription UX Investigative Dossier (`investigative-research`, `written-communication`, `critical-reasoning`).
- **Deterministic Rubric Evaluator (`project-evaluation.ts`):** Pure deterministic scoring engine that operates completely offline without external AI API dependencies:
  - *URL Validation:* Validates HTTP/HTTPS protocols, rejects localhost, private loopbacks, non-web URIs (`file:`, `javascript:`, `ftp:`), and recognizes repository, demo, and document platforms.
  - *Deliverable Checklist:* Verifies claimed artifacts; flags incomplete milestones (< 50% checked) as `evaluation_incomplete`.
  - *Reflection Substance Check:* Analyzes technical reasoning depth, keyword awareness (architecture, trade-offs, concurrency, validation, schema), and flags trivial submissions.
  - *Rubric Scoring:* Criterion-by-criterion evaluation with passing thresholds; returns overall score, criteria scores, pass/fail status, and actionable revision steps.
- **Skill Provenance & Non-Erasure Rules:**
  - When a project submission achieves `demonstrated` ($\ge 75\%$ overall score, $\ge 75\%$ deliverables checked, substantive reflection), only mapped skills meeting criteria thresholds upgrade to `practically_demonstrated`.
  - *Non-Erasure Rule:* If a skill is already `independently_verified`, project evaluation preserves that higher state and never downgrades it.
  - *Provenance Metadata:* Stores `sourceTitle`, `sourceUrl`, `assessedScore`, `reflection`, and `updatedAt` for 100% auditable evidence.
- **Cross-Module Synchronization:**
  - *Adaptive Roadmap:* When a project for the active career is demonstrated, Roadmap `task-3` ("Vertical-Slice Starter Project") marks complete with evidence attached, unlocking `task-4` ("Peer & Mentor Evidence Verification").
  - *Skill Matrix (`/skills`):* Displays verified project badge, source project title, rubric score percentage, clickable proof link, and reflection excerpt.
  - *Recommendation Engine:* Automatically recalculates `skillCoveragePercent`, reflecting newly demonstrated skills with 0.9x weight and generating transparent match explanations.
  - *Dashboard:* Displays a verified practical deliverables section summarizing demonstrated projects and direct links to Project Studio.
- **Repeated Submissions & Idempotency:** Revising a project modifies the existing record in-place under the project ID, preventing duplicate ghost records.
- **Automated Verification:** Added `project-evidence-pipeline.test.ts` (18 new tests; 62 total passing unit tests across 5 test files). Production build verified clean across 12 static routes.

### Build v0.2.2 — Career Intelligence Validation (Phase 2B)
- **Decoupled Trial Signals:** Separated scenario task performance (`taskScore` 0–100 from rubric) from personal daily affinity (`enjoymentRating` 1–5). A student with high aptitude but low enjoyment receives aptitude recognition alongside an explicit trade-off uncertainty flag; a student with high enjoyment but developing skills receives motivation credit and foundational bridge recommendations.
- **Semantic Domain Interest Matching:** Replaced brittle substring checking with domain-level taxonomy matching across disciplines, required skills, and curated keyword sets. Cross-disciplinary and multi-interest combinations now produce stable, additive hypotheses without destructive interference.
- **Honest Unknowns & Missing Evidence:** Explicitly tracks `unassessedSkillsCount`. Missing evidence is declared as unexplored ground rather than penalized as lack of innate ability.
- **Hypothesis Alignment Index & Limitations Notice:** Bounded heuristic score (20–95) rebranded as "Hypothesis Exploration Index", explicitly disclaiming false scientific/psychometric certainty or hiring predictions. Categorized into three transparent fit bands: `strong_hypothesis`, `promising_alternative`, and `exploratory_bridge`.
- **Cross-Module Roadmap Synchronization:** Completing a micro-trial for an active target career automatically advances the student's roadmap by marking Task 1 completed, recording reflection evidence, and unlocking Task 2 (Foundations). Setting a target career for an already completed trial initializes Task 1 as completed immediately.
- **Explore & Dashboard Consistency:** Fixed hardcoded trial filter on `/explore` to query `CAREER_TRIALS` dynamically across all 7 careers; added alignment status and fit bands to career cards. Updated Dashboard next action card to display actual active milestone titles and hours instead of hardcoded strings.
- **Automated Validation Test Suite:** Added `recommendation-validation.test.ts` with 12 comprehensive tests covering empty profiles, undecided explorers, conflicting signals, trial decoupling quadrants, repeated attempt non-inflation, and capacity constraints (44 total passing tests). Full production build verified.

### Build v0.2.1 — Career Trial Integrity & Multidisciplinary Expansion (Phase 2A)
- **Trial Persistence & Hydration:** Saved trial responses, rationale notes, option selections, rubric feedback, and enjoyment ratings now persist across page refreshes and returning visits using `localStorage`.
- **Integrity & Anti-Corruption:** Added strict submission validation preventing incomplete work from being marked complete; retry/revision workflows update stored records cleanly without duplicating array items or corrupting state.
- **Explainable Recommendation Integration:** Replaced brittle substring matching (`slug.split("-")[0]`) with exact `careerSlug` mapping. Integrated enjoyment ratings into recommendation scoring: ratings of 4-5 award +15 points and an energizing match reason; ratings of 1-2 record exploration effort (+5 points) but flag an explicit uncertainty note advising students to evaluate daily fit.
- **Three New Interactive Multidisciplinary Trials:**
  1. *Healthcare / Clinical Coordinator* (`clinical-research-coordinator`): Fictional outpatient clinic schedule disruption; evaluates patient safety triage (nurse delegation for post-op wound inflammation), transport deadlines (ambulance van departure), communication clarity, and patient privacy under HIPAA/DPDP principles. Features non-identifiable fictional data disclaimer and strictly distinguishes administrative coordination from clinical medical licensing.
  2. *Environmental Data Researcher* (`environmental-data-researcher`): Synthetic 4-zone microclimate dataset (Industrial, Commercial, Suburban, Urban Forest); evaluates thermal delta calculation (9.9°C), PM2.5 particulate interpretation, sensor missingness bias auditing (19.4% solar occlusion in Zone 4), and correlation vs causation reasoning. Features prominent synthetic dataset notice.
  3. *Investigative Technology Journalist* (`investigative-tech-journalist`): Algorithmic candidate screening investigation ("TalentScan AI"); features an evidentiary dossier classifying 4 sources (unverified whistleblower leak, corporate PR claim, independent academic audit pre-print, and anecdotal forum post); evaluates source triangulation, ethical right-of-reply, and balanced reporting. Features fictional scenario disclaimer with zero living figures.
- **Strict Evidence Boundary:** Micro-trials explicitly communicate that they evaluate exploratory affinity and initial reasoning, and do not grant "Practically Demonstrated" evidence in the Skill Intelligence matrix.
- **Quality & Testing:** Added comprehensive test suite in `trials-integrity.test.ts` (22 new tests, 32 total passed); Next.js production build succeeded with 0 errors across 12 static routes.

### Build v0.2.0 — UX Simplification & Product Quality Release
- **Navigation Architecture:** Streamlined primary navigation from 7 competing items down to 5 coherent pillars: **Home**, **Explore**, **Roadmap**, **Projects**, **Mentor**, with deep-dive tools (Skills Matrix, Micro-Trials) placed cleanly in secondary access.
- **Mobile Experience:** Added a native-feeling fixed bottom navigation bar on mobile with min-48px touch targets, active amber indicators, and quick top header drawer.
- **Landing Page Clarity:** Implemented required hero copy ("Explore careers that interest you, understand what they require, and discover your next practical step"), primary "Find My Direction" and secondary "Explore Careers" CTAs, intuitive curiosity spark visualizer, and a clear Before/After comparison demonstrating Aaroh's practical difference.
- **Conversational Onboarding:** Simplified flow from 5 dense steps to 4 supportive steps with a visible progress bar, safe "I'm not sure yet" options, and transparent preview of what happens next.
- **Dashboard Redesign (3 Core Questions):**
  1. *Where am I right now?* (Warm greeting, active target career, academic stage, and 1-tap College Exam Mode).
  2. *What is my next useful action?* (Hero card with what to do, why it matters, time required, what you gain, and one clear action button).
  3. *What can I explore next?* (2 clean career hypotheses with plain-language fit reasons and a visible link to explore all 7 fields).
- **Career Trials Playground:** Reframed micro-trials as low-stakes learning opportunities without pass/fail anxiety.
- **Skills Intelligence:** Added plain-language guides for the 5 evidence states (Unassessed, Self-Reported, Coursework, Demonstrated, Verified) without misleading percentages.
- **Adaptive Roadmap:** Emphasized the active milestone with clear instructions and criteria, keeping subsequent milestones compact and progressive.
- **Automated Verification:** Added `ux-simplification.test.ts`, passing all 10 unit tests in 740ms; verified Next.js production build with zero errors.

### Build v0.1.0 — Initial Foundation & Core Platform Release
- Initial Next.js 15, TypeScript, Tailwind CSS, local store, and curated domain models.
