import {
  AarohReviewPacket,
  ProjectBrief,
  ProjectReviewRecord,
  ProjectSubmissionRecord,
  ReviewCriterionEvaluation,
  ReviewTrustLevel,
  UserProfile,
  UserSkillEvidence,
} from "./types";

export interface ReviewValidationResult {
  isValid: boolean;
  review?: ProjectReviewRecord;
  error?: string;
  isStale?: boolean;
  stalenessReason?: string;
}

export const LOCAL_REVIEW_DISCLOSURE =
  "Local peer/mentor review attestation — identity not authenticated. Verifies that a reviewer reported examining artifacts against rubric criteria. Not an institutionally verified PKI credential.";

/**
 * Standard pure TypeScript SHA-256 implementation (FIPS 180-4 compliant).
 * Runs synchronously in any JavaScript runtime (Node.js, browser, edge) with zero dependencies.
 * Provides standard 256-bit cryptographic collision resistance for submission change-detection digests.
 */
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const words: number[] = [];
  let result = "";

  // Initial hash values: first 32 bits of the fractional parts of square roots of first 8 primes 2..19
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  // Round constants: first 32 bits of fractional parts of cube roots of first 64 primes 2..311
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // Convert string to UTF-8 byte stream
  const utf8Bytes: number[] = [];
  for (let idx = 0; idx < ascii.length; idx++) {
    let charcode = ascii.charCodeAt(idx);
    if (charcode < 0x80) {
      utf8Bytes.push(charcode);
    } else if (charcode < 0x800) {
      utf8Bytes.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8Bytes.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      idx++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (ascii.charCodeAt(idx) & 0x3ff));
      utf8Bytes.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  const bitLength = utf8Bytes.length * 8;
  utf8Bytes.push(0x80);
  while ((utf8Bytes.length % 64) !== 56) {
    utf8Bytes.push(0);
  }

  // Append length in bits as 64-bit big-endian integer
  for (let offset = 7; offset >= 0; offset--) {
    utf8Bytes.push(Math.floor(bitLength / Math.pow(256, offset)) & 0xff);
  }

  // Convert bytes into 32-bit words
  for (let offset = 0; offset < utf8Bytes.length; offset += 4) {
    words.push(
      (utf8Bytes[offset] << 24) |
      (utf8Bytes[offset + 1] << 16) |
      (utf8Bytes[offset + 2] << 8) |
      utf8Bytes[offset + 3]
    );
  }

  // Process 512-bit (16-word) blocks
  for (let blockStart = 0; blockStart < words.length; blockStart += 16) {
    const w = new Array(64);
    for (let t = 0; t < 16; t++) {
      w[t] = words[blockStart + t];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (let t = 0; t < 64; t++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[t] + w[t]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (let idx = 0; idx < 8; idx++) {
    result += (hash[idx] >>> 0).toString(16).padStart(8, "0");
  }

  return result;
}

/**
 * Canonicalizes project submission fields into a standardized, deterministic string.
 * Normalization Rules:
 * 1. ProjectId: trimmed and lowercased.
 * 2. URL: trimmed, protocol and host lowercased, trailing slash stripped from pathname.
 * 3. Deliverables: trimmed, filtered non-empty, deduplicated, sorted in natural order.
 * 4. Reflection: Unicode normalized with NFC, \r\n converted to \n, consecutive whitespace collapsed, trimmed.
 */
export function canonicalizeSubmissionInput(input: {
  projectId: string;
  repoOrDemoUrl: string;
  checkedDeliverableIds: string[];
  reflection?: string;
}): string {
  const normProjectId = (input.projectId || "").trim().toLowerCase();

  // Normalize URL
  let normUrl = (input.repoOrDemoUrl || "").trim();
  try {
    const parsed = new URL(normUrl);
    const host = parsed.hostname.toLowerCase();
    const proto = parsed.protocol.toLowerCase();
    let path = parsed.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    normUrl = `${proto}//${host}${parsed.port ? `:${parsed.port}` : ""}${path}${parsed.search}`;
  } catch {
    normUrl = normUrl.toLowerCase().replace(/\/+$/, "");
  }

  // Normalize deliverable IDs
  const normDeliverables = Array.from(
    new Set((input.checkedDeliverableIds || []).map((d) => d.trim()).filter(Boolean))
  ).sort().join(",");

  // Normalize reflection text (NFC Unicode, \r\n to \n, collapse spaces)
  const normReflection = (input.reflection || "")
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  return [
    `projectId=${normProjectId}`,
    `url=${normUrl}`,
    `deliverables=${normDeliverables}`,
    `reflection=${normReflection}`,
  ].join("\n");
}

/**
 * Computes a deterministic SHA-256 change-detection fingerprint for a project submission.
 *
 * CRITICAL ARCHITECTURAL BOUNDARY:
 * This digest is a submission-binding change-detection aid, NOT a cryptographic signature or proof of reviewer identity.
 * In a client-only architecture, a client-computed hash cannot prove who reviewed the work or prevent local tampering.
 */
export function computeSubmissionFingerprint(input: {
  projectId: string;
  repoOrDemoUrl: string;
  checkedDeliverableIds: string[];
  reflection?: string;
}): string {
  const canonical = canonicalizeSubmissionInput(input);
  const digest = sha256(canonical);
  return `subfp_sha256_${digest}`;
}

/**
 * Creates an exportable portable Review Packet for a project submission.
 */
export function createReviewPacket(
  submission: ProjectSubmissionRecord,
  brief: ProjectBrief,
  studentName?: string
): AarohReviewPacket {
  const fingerprint =
    submission.submissionFingerprint ||
    computeSubmissionFingerprint({
      projectId: brief.id,
      repoOrDemoUrl: submission.repoOrDemoUrl,
      checkedDeliverableIds: submission.checkedDeliverableIds,
      reflection: submission.reflection,
    });

  return {
    schemaVersion: "1.0",
    type: "aaroh_review_packet",
    exportedAt: new Date().toISOString(),
    studentName: (studentName || "Aaroh Learner").trim().slice(0, 80),
    projectId: brief.id,
    projectTitle: brief.title,
    careerSlug: brief.careerSlug,
    submissionFingerprint: fingerprint,
    submittedAt: submission.submittedAt,
    repoOrDemoUrl: submission.repoOrDemoUrl,
    checkedDeliverableIds: submission.checkedDeliverableIds,
    deliverables: brief.deliverables || [],
    reflection: submission.reflection,
    rubricCriteria: brief.rubricCriteria || [],
    review: submission.review,
  };
}

/**
 * Generates a completed sample review record for a submission.
 * Useful for fast reviewer evaluation forms, offline review generation, and automated testing.
 */
export function generateCompletedReview(
  brief: ProjectBrief,
  submission: ProjectSubmissionRecord,
  options: {
    reviewerName: string;
    reviewerRole: "peer" | "mentor" | "community";
    overallDecision?: "approved" | "changes_requested";
    overallFeedback?: string;
    artifactExamined?: boolean;
    criteriaScores?: Record<string, { passed: boolean; score: number; feedback: string }>;
  }
): ProjectReviewRecord {
  const fingerprint =
    submission.submissionFingerprint ||
    computeSubmissionFingerprint({
      projectId: brief.id,
      repoOrDemoUrl: submission.repoOrDemoUrl,
      checkedDeliverableIds: submission.checkedDeliverableIds,
      reflection: submission.reflection,
    });

  const criteriaEvaluations: ReviewCriterionEvaluation[] = (brief.rubricCriteria || []).map((crit) => {
    const custom = options.criteriaScores?.[crit.id];
    if (custom) {
      return {
        criterionId: crit.id,
        passed: Boolean(custom.passed),
        score: Math.max(0, Math.min(100, Math.round(custom.score))),
        feedback: (custom.feedback || "").trim().slice(0, 500),
      };
    }
    const isApproved = options.overallDecision !== "changes_requested";
    return {
      criterionId: crit.id,
      passed: isApproved,
      score: isApproved ? 85 : 55,
      feedback: isApproved
        ? `Criterion "${crit.title}" verified against submitted code and live demonstration.`
        : `Criterion "${crit.title}" requires deeper implementation or refactoring.`,
    };
  });

  const trustLevel: ReviewTrustLevel =
    options.reviewerRole === "mentor" ? "unauthenticated_mentor" : "unauthenticated_peer";

  return {
    reviewId: `rev_${brief.id}_${Date.now()}`,
    projectId: brief.id,
    projectSlug: brief.slug,
    submissionFingerprint: fingerprint,
    reviewerName: (options.reviewerName || "Peer Reviewer").trim().slice(0, 80),
    reviewerRole: options.reviewerRole,
    trustLevel,
    criteriaEvaluations,
    overallFeedback: (
      options.overallFeedback ||
      (options.overallDecision === "changes_requested"
        ? "Deliverables inspected; revisions requested before rubric requirements are fully satisfied."
        : "Artifact examined against the brief requirements. Deliverables and implementation verified.")
    )
      .trim()
      .slice(0, 2000),
    overallDecision: options.overallDecision || "approved",
    artifactExamined: options.artifactExamined !== false,
    reviewedAt: new Date().toISOString(),
    isStale: false,
    trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
  };
}

/**
 * Validates and parses raw review packet JSON against the student's current submission and project brief.
 * Enforces strict typing, rejects malformed payloads, verifies rubric mapping, checks submission fingerprint matching,
 * and clamps any forged trust claims.
 */
export function validateAndParseReviewPacket(
  rawInput: unknown,
  currentSubmission: ProjectSubmissionRecord,
  brief?: ProjectBrief
): ReviewValidationResult {
  if (!rawInput) {
    return { isValid: false, error: "Review input is empty or null." };
  }

  let parsed: any = rawInput;
  if (typeof rawInput === "string") {
    try {
      parsed = JSON.parse(rawInput);
    } catch {
      return { isValid: false, error: "Invalid JSON format: unable to parse review packet." };
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { isValid: false, error: "Invalid review packet format: expected a JSON object." };
  }

  // Extract review object (support both top-level review record or wrapped in AarohReviewPacket)
  let candidateReview: any = null;
  if (parsed.type === "aaroh_review_packet") {
    if (parsed.schemaVersion !== "1.0") {
      return { isValid: false, error: `Unsupported review packet schema version: ${parsed.schemaVersion}` };
    }
    if (!parsed.review) {
      return { isValid: false, error: "Review packet does not contain a completed review record." };
    }
    candidateReview = parsed.review;
  } else if (parsed.reviewId && parsed.submissionFingerprint) {
    candidateReview = parsed;
  } else {
    return {
      isValid: false,
      error: "Invalid review structure: must be an AarohReviewPacket or valid ProjectReviewRecord.",
    };
  }

  // Validate candidateReview basic fields & lengths
  if (
    typeof candidateReview.reviewId !== "string" ||
    candidateReview.reviewId.trim().length < 3 ||
    candidateReview.reviewId.length > 64
  ) {
    return { isValid: false, error: "Invalid reviewId: must be a non-empty string between 3 and 64 characters." };
  }

  if (typeof candidateReview.projectId !== "string" || candidateReview.projectId !== currentSubmission.projectId) {
    return {
      isValid: false,
      error: `Project ID mismatch: review is for '${candidateReview.projectId}' but current submission is for '${currentSubmission.projectId}'.`,
    };
  }

  if (
    typeof candidateReview.reviewerName !== "string" ||
    candidateReview.reviewerName.trim().length < 2 ||
    candidateReview.reviewerName.length > 80
  ) {
    return { isValid: false, error: "Invalid reviewerName: reviewer must provide a name or handle (2-80 characters)." };
  }

  const validRoles = ["peer", "mentor", "community"];
  if (!validRoles.includes(candidateReview.reviewerRole)) {
    return { isValid: false, error: `Invalid reviewerRole: must be one of ${validRoles.join(", ")}.` };
  }

  const validDecisions = ["approved", "changes_requested"];
  if (!validDecisions.includes(candidateReview.overallDecision)) {
    return { isValid: false, error: `Invalid overallDecision: must be one of ${validDecisions.join(", ")}.` };
  }

  if (!Array.isArray(candidateReview.criteriaEvaluations) || candidateReview.criteriaEvaluations.length === 0) {
    return { isValid: false, error: "Invalid criteriaEvaluations: must be a non-empty array." };
  }

  if (candidateReview.criteriaEvaluations.length > 20) {
    return { isValid: false, error: "Oversized criteriaEvaluations: exceeds maximum of 20 criteria." };
  }

  // Rubric mapping check if brief is available
  const knownCriteriaIds = new Set((brief?.rubricCriteria || []).map((c) => c.id));
  const seenCriteria = new Set<string>();
  const sanitizedCriteria: ReviewCriterionEvaluation[] = [];

  for (const crit of candidateReview.criteriaEvaluations) {
    if (!crit || typeof crit.criterionId !== "string" || !crit.criterionId.trim()) {
      return { isValid: false, error: "Malformed criterion evaluation: missing criterionId." };
    }
    const cleanId = crit.criterionId.trim();

    // If brief was passed, reject unknown criteria
    if (brief && knownCriteriaIds.size > 0 && !knownCriteriaIds.has(cleanId)) {
      return { isValid: false, error: `Unknown rubric criterion '${cleanId}' not found in project brief.` };
    }

    // Deduplicate criteria evaluations (keep first valid occurrence)
    if (seenCriteria.has(cleanId)) {
      continue;
    }
    seenCriteria.add(cleanId);

    sanitizedCriteria.push({
      criterionId: cleanId,
      passed: Boolean(crit.passed),
      score: typeof crit.score === "number" ? Math.max(0, Math.min(100, Math.round(crit.score))) : 75,
      feedback: typeof crit.feedback === "string" ? crit.feedback.trim().slice(0, 500) : "",
    });
  }

  // Consistency invariant: An approved review must have at least one passed criterion with score >= 70
  if (candidateReview.overallDecision === "approved" && Boolean(candidateReview.artifactExamined)) {
    const passedCount = sanitizedCriteria.filter((c) => c.passed && c.score >= 70).length;
    if (passedCount === 0) {
      return {
        isValid: false,
        error: "Inconsistent review: overallDecision is 'approved' but no rubric criteria were evaluated as passed with standard score (>= 70%).",
      };
    }
  }

  // Check fingerprint match with current submission
  const currentFingerprint =
    currentSubmission.submissionFingerprint ||
    computeSubmissionFingerprint({
      projectId: currentSubmission.projectId,
      repoOrDemoUrl: currentSubmission.repoOrDemoUrl,
      checkedDeliverableIds: currentSubmission.checkedDeliverableIds,
      reflection: currentSubmission.reflection,
    });

  const reviewFingerprint = String(candidateReview.submissionFingerprint || "").trim();
  const isStale = reviewFingerprint !== currentFingerprint;
  const stalenessReason = isStale
    ? "Submission was modified after this review was conducted (fingerprint mismatch). Review is stale and cannot elevate skills."
    : undefined;

  // Enforce trust boundary: clamping client claims to unauthenticated local level
  const trustLevel: ReviewTrustLevel =
    candidateReview.reviewerRole === "mentor" ? "unauthenticated_mentor" : "unauthenticated_peer";

  const sanitizedReview: ProjectReviewRecord = {
    reviewId: String(candidateReview.reviewId).trim().slice(0, 64),
    projectId: currentSubmission.projectId,
    projectSlug: currentSubmission.projectSlug,
    submissionFingerprint: reviewFingerprint,
    reviewerName: String(candidateReview.reviewerName).trim().slice(0, 80),
    reviewerRole: candidateReview.reviewerRole,
    trustLevel,
    criteriaEvaluations: sanitizedCriteria,
    overallFeedback: typeof candidateReview.overallFeedback === "string"
      ? candidateReview.overallFeedback.trim().slice(0, 2000)
      : "No overall feedback provided.",
    overallDecision: candidateReview.overallDecision,
    artifactExamined: Boolean(candidateReview.artifactExamined),
    reviewedAt: typeof candidateReview.reviewedAt === "string" && !isNaN(Date.parse(candidateReview.reviewedAt))
      ? candidateReview.reviewedAt
      : new Date().toISOString(),
    isStale,
    trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
  };

  return {
    isValid: true,
    review: sanitizedReview,
    isStale,
    stalenessReason,
  };
}

/**
 * Applies a validated review record to a user profile.
 * Enforces:
 * 1. Non-erasure & hierarchical preservation: Weaker reviews or unassessed criteria NEVER downgrade
 *    existing higher evidence (independently_verified is sacred; mentor-reviewed credentials cannot be downgraded by peer reviews).
 * 2. Active Review Protection: A stale review CANNOT overwrite an existing active, valid review.
 * 3. Staleness barrier: If review is stale (fingerprint mismatch), no skills are promoted.
 * 4. Artifact examination requirement: artifactExamined must be true to elevate skills.
 * 5. Honest taxonomy: Promotes mapped skills to 'practically_demonstrated' with
 *    verificationLevel = 'artifact_examined' (NOT 'independently_verified').
 */
export function applyReviewToProfile(
  profile: UserProfile,
  brief: ProjectBrief,
  review: ProjectReviewRecord
): {
  updatedProfile: UserProfile;
  promotedSkillIds: string[];
  ignoredSkillIds: string[];
  isStale: boolean;
  error?: string;
} {
  const currentSubmission = profile.projectSubmissions[brief.id];
  const currentFingerprint = currentSubmission
    ? currentSubmission.submissionFingerprint ||
      computeSubmissionFingerprint({
        projectId: currentSubmission.projectId,
        repoOrDemoUrl: currentSubmission.repoOrDemoUrl,
        checkedDeliverableIds: currentSubmission.checkedDeliverableIds,
        reflection: currentSubmission.reflection,
      })
    : null;

  const isStale = !currentFingerprint || review.submissionFingerprint !== currentFingerprint;

  // Active Review Protection Invariant:
  // If profile already has an active, valid, approved review, a stale review packet must NOT overwrite it!
  const existingReview = profile.projectReviews?.[brief.id];
  if (isStale && existingReview && !existingReview.isStale && existingReview.overallDecision === "approved") {
    return {
      updatedProfile: profile,
      promotedSkillIds: [],
      ignoredSkillIds: [],
      isStale: true,
      error: "Cannot overwrite active valid review with a stale review packet.",
    };
  }

  const markedReview: ProjectReviewRecord = {
    ...review,
    isStale,
  };

  const updatedSubmissions = { ...profile.projectSubmissions };
  if (currentSubmission) {
    updatedSubmissions[brief.id] = {
      ...currentSubmission,
      review: markedReview,
    };
  }

  const updatedReviews = {
    ...(profile.projectReviews || {}),
    [brief.id]: markedReview,
  };

  const promotedSkillIds: string[] = [];
  const ignoredSkillIds: string[] = [];
  const updatedSkillEvidence: Record<string, UserSkillEvidence> = { ...profile.skillEvidence };

  // If review is stale, changes requested, or artifacts were NOT examined, skills are NOT promoted
  if (!isStale && review.overallDecision === "approved" && review.artifactExamined) {
    const rubricMap = new Map((brief.rubricCriteria || []).map((c) => [c.id, c]));

    for (const critEval of review.criteriaEvaluations) {
      const rubricCrit = rubricMap.get(critEval.criterionId);
      if (!rubricCrit) continue;

      const skillId = rubricCrit.associatedSkillId;
      const existing = profile.skillEvidence[skillId];

      if (critEval.passed) {
        // Non-erasure rule 1: NEVER downgrade independently_verified
        if (existing?.state === "independently_verified") {
          ignoredSkillIds.push(skillId);
          continue;
        }

        // Non-erasure rule 2: NEVER downgrade practically_demonstrated
        if (existing?.state === "practically_demonstrated") {
          // Hierarchical preservation: Do not demote mentor role to peer
          const preservedRole =
            existing.reviewerRole === "mentor" && review.reviewerRole !== "mentor"
              ? "mentor"
              : review.reviewerRole;
          const preservedName =
            existing.reviewerRole === "mentor" && review.reviewerRole !== "mentor"
              ? existing.reviewerName || review.reviewerName
              : review.reviewerName;

          updatedSkillEvidence[skillId] = {
            ...existing,
            reviewerName: preservedName,
            reviewerRole: preservedRole,
            reviewId: review.reviewId,
            reviewedAt: review.reviewedAt,
            isArtifactInspected: true,
            assessedScore: Math.max(existing.assessedScore ?? 0, critEval.score),
            updatedAt: new Date().toISOString(),
          };
          promotedSkillIds.push(skillId);
          continue;
        }

        // Upgrade not_assessed, self_reported, coursework, or student_attested -> practically_demonstrated
        updatedSkillEvidence[skillId] = {
          skillId,
          state: "practically_demonstrated",
          sourceTitle: `${brief.title} (Reviewed by ${review.reviewerName})`,
          sourceUrl: currentSubmission?.repoOrDemoUrl,
          assessedScore: critEval.score,
          reflection: critEval.feedback || review.overallFeedback,
          verificationLevel: "artifact_examined",
          evaluationBasis: `Rubric criterion "${rubricCrit.title}" inspected by ${review.reviewerRole} (${review.reviewerName}).`,
          unverifiedNotice: `Unauthenticated local evidence: Peer/mentor attestation (reviewer: ${review.reviewerName}). Examined project artifacts against brief rubric.`,
          isArtifactInspected: true,
          reviewerName: review.reviewerName,
          reviewerRole: review.reviewerRole,
          reviewId: review.reviewId,
          reviewedAt: review.reviewedAt,
          updatedAt: new Date().toISOString(),
        };
        promotedSkillIds.push(skillId);
      } else {
        // Criterion failed: Non-erasure rule protects existing evidence!
        ignoredSkillIds.push(skillId);
      }
    }
  }

  const updatedProfile: UserProfile = {
    ...profile,
    projectSubmissions: updatedSubmissions,
    projectReviews: updatedReviews,
    skillEvidence: updatedSkillEvidence,
    updatedAt: new Date().toISOString(),
  };

  return {
    updatedProfile,
    promotedSkillIds,
    ignoredSkillIds,
    isStale,
  };
}
