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
| **Phase 3** | Action & Practical Proof | **COMPLETED** | Adaptive Roadmap with dynamic capacity throttling and College Exam Mode, Project Studio with practical briefs, testing checklists, README generator, and opt-in public portfolio. |
| **Phase 4** | Preparation & AI Mentor | **COMPLETED** | Context-aware AI Mentor with optional privacy disclosure, rubric explanations, and anti-hallucination guardrails. |
| **Phase 5** | UX Simplification & Polish | **COMPLETED** | "Simple on the surface, powerful underneath" refactor: 5 primary nav items, dedicated mobile bottom tab bar, 3-question dashboard, conversational 4-step onboarding, and low-stress career trial playground. |
| **Phase 6** | Quality Gates & Verification | **COMPLETED** | Production build verified across 12 static routes; test suite expanded traceably from baseline 62 tests (Phase 3A) -> 75 tests (Phase 3B) -> 86 Vitest tests across 7 suites + 34 Playwright browser E2E checks (Phase 3C). |

---

## Change Log

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
