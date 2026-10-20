import {
  ProjectBrief,
  ProjectSubmissionRecord,
  ProjectSubmissionStatus,
  ProjectCriterionScore,
} from "./types";
import { computeSubmissionFingerprint } from "./review-system";

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  urlType?: "repo" | "demo" | "document" | "other";
  sanitizedUrl?: string;
  isInspected: false;
  uninspectedNotice: string;
}

const UNINSPECTED_NOTICE =
  "Reference syntax validated. Destination content has not been fetched, executed, or verified by Aaroh.";

/**
 * Validates a repository or demonstration link.
 * Requires http/https, rejects private IPs, loopbacks (IPv4 and IPv6), and recognizes common platforms.
 * Explicitly discloses that destination content is NOT fetched or inspected.
 */
export function validateProjectUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      isValid: false,
      error: "Please provide a valid repository or project demo URL.",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length < 8) {
    return {
      isValid: false,
      error: "URL is too short to be a valid link.",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  // Reject local/private/dangerous schemes
  if (/^(file:|javascript:|data:|ftp:|blob:|about:|vbscript:)/i.test(trimmed)) {
    return {
      isValid: false,
      error: "Local file paths, JavaScript URIs, data URIs, or FTP links cannot be verified. Provide a public web URL.",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      error: "URL must begin with http:// or https:// (e.g. https://github.com/username/project).",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: "The provided URL is malformed or contains invalid characters.",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  // Reject userinfo (e.g. http://user:pass@host)
  if (parsed.username || parsed.password) {
    return {
      isValid: false,
      error: "URLs containing embedded credentials are not permitted.",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  let hostname = parsed.hostname.toLowerCase();

  // Strip IPv6 enclosing brackets if present
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.slice(1, -1);
  }

  // Check IPv6 loopback and private/local ranges
  if (
    hostname === "::1" ||
    hostname === "::" ||
    hostname.startsWith("fe80:") ||
    hostname.startsWith("fc00:") ||
    hostname.startsWith("fd00:") ||
    hostname.startsWith("::ffff:127.") ||
    hostname.startsWith("::ffff:10.") ||
    hostname.startsWith("::ffff:192.168.") ||
    hostname.startsWith("::ffff:172.")
  ) {
    return {
      isValid: false,
      error: "IPv6 loopback or private network addresses are not accessible for verification.",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  // Check IPv4 addresses
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = hostname.match(ipv4Regex);
  if (ipMatch) {
    const octets = ipMatch.slice(1, 5).map(Number);
    const [a, b, c, d] = octets;

    // Validate octet range
    if (octets.some((oct) => oct < 0 || oct > 255)) {
      return {
        isValid: false,
        error: "Malformed IP address in URL.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }

    // 127.0.0.0/8 (Loopback)
    if (a === 127) {
      return {
        isValid: false,
        error: "Loopback addresses (127.0.0.0/8) are not accessible for verification.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }

    // 0.0.0.0/8 (Current network)
    if (a === 0) {
      return {
        isValid: false,
        error: "Invalid network address 0.0.0.0/8 is not accessible for verification.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }

    // 10.0.0.0/8 (Private Class A)
    if (a === 10) {
      return {
        isValid: false,
        error: "Private network addresses (10.0.0.0/8) are not accessible for verification.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }

    // 172.16.0.0/12 (Private Class B: 172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) {
      return {
        isValid: false,
        error: "Private network addresses (172.16.0.0/12) are not accessible for verification.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }

    // 192.168.0.0/16 (Private Class C)
    if (a === 192 && b === 168) {
      return {
        isValid: false,
        error: "Private network addresses (192.168.0.0/16) are not accessible for verification.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }

    // 169.254.0.0/16 (Link-local / Cloud metadata endpoint)
    if (a === 169 && b === 254) {
      return {
        isValid: false,
        error: "Link-local metadata addresses (169.254.0.0/16) are not permitted.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }

    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (a === 100 && b >= 64 && b <= 127) {
      return {
        isValid: false,
        error: "Shared address space (100.64.0.0/10) is not accessible for verification.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }
  }

  // Check for localhost or local domain names
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".example")
  ) {
    return {
      isValid: false,
      error: "Localhost or private network domains are not accessible for verification. Deploy to a public host or push to GitHub.",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  // Ensure hostname has at least one dot separating valid labels (unless valid IPv6)
  if (!hostname.includes(":") && (!hostname.includes(".") || hostname.endsWith(".") || hostname.startsWith("."))) {
    return {
      isValid: false,
      error: "URL must contain a valid domain name with an extension (e.g. .com, .org, .dev).",
      isInspected: false,
      uninspectedNotice: UNINSPECTED_NOTICE,
    };
  }

  // Check port validity if present
  if (parsed.port) {
    const portNum = Number(parsed.port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return {
        isValid: false,
        error: "URL contains an invalid port number.",
        isInspected: false,
        uninspectedNotice: UNINSPECTED_NOTICE,
      };
    }
  }

  // Detect platform type
  let urlType: "repo" | "demo" | "document" | "other" = "other";
  if (/(github\.com|gitlab\.com|bitbucket\.org)/i.test(hostname)) {
    urlType = "repo";
  } else if (/(vercel\.app|render\.com|railway\.app|netlify\.app|fly\.dev|pages\.dev)/i.test(hostname)) {
    urlType = "demo";
  } else if (/(figma\.com|penpot\.app|notion\.site|docs\.google\.com|drive\.google\.com|zenodo\.org|ssrn\.com)/i.test(hostname)) {
    urlType = "document";
  }

  return {
    isValid: true,
    urlType,
    sanitizedUrl: parsed.href,
    isInspected: false,
    uninspectedNotice: UNINSPECTED_NOTICE,
  };
}

/**
 * Assesses the quality and substance of an architecture/trade-off reflection.
 * This is an automated assessment of student-authored self-reflection, NOT proof of external artifact correctness.
 */
export function evaluateReflectionSubstance(reflection: string): {
  score: number; // 0-100
  hasSubstance: boolean;
  wordCount: number;
  feedback: string;
  evaluationMethod: "heuristic_text_length_and_vocabulary";
} {
  const method = "heuristic_text_length_and_vocabulary" as const;

  if (!reflection || typeof reflection !== "string") {
    return {
      score: 10,
      hasSubstance: false,
      wordCount: 0,
      feedback: "No implementation reflection provided. Genuine projects require architectural explanation.",
      evaluationMethod: method,
    };
  }

  const trimmed = reflection.trim();
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  if (wordCount < 10) {
    return {
      score: 25,
      hasSubstance: false,
      wordCount,
      feedback: "Reflection is too brief (< 10 words). Explain your technical choices, architecture, and trade-offs.",
      evaluationMethod: method,
    };
  }

  // Check vocabulary diversity to discourage repetitive keyword stuffing
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const uniqueWords = new Set(lowerWords);
  const diversityRatio = uniqueWords.size / words.length;

  if (words.length >= 15 && diversityRatio < 0.45) {
    return {
      score: 35,
      hasSubstance: false,
      wordCount,
      feedback: "Reflection contains excessive word repetition. Provide a coherent, original explanation of your project architecture.",
      evaluationMethod: method,
    };
  }

  // Calculate substance based on technical depth and keywords
  const baseScore = wordCount >= 30 ? 75 : wordCount >= 18 ? 70 : 60;
  let bonus = 0;
  const lower = trimmed.toLowerCase();
  const substantiveKeywords = [
    "tradeoff",
    "trade-off",
    "architecture",
    "performance",
    "concurrency",
    "constraint",
    "accessibility",
    "validation",
    "wcag",
    "balance",
    "limitation",
    "security",
    "audit",
    "protocol",
    "schema",
  ];

  const matchedKeywords = substantiveKeywords.filter((k) => lower.includes(k));
  if (matchedKeywords.length >= 2) bonus += 15;
  else if (matchedKeywords.length === 1) bonus += 10;
  if (wordCount >= 40) bonus += 10;

  const score = Math.min(100, baseScore + bonus);
  const hasSubstance = score >= 70;

  return {
    score,
    hasSubstance,
    wordCount,
    feedback: hasSubstance
      ? "Detailed self-reflection discussing architectural choices and trade-offs (Self-Reported)."
      : "Reflection outlines basic choices, but lacks detailed discussion of trade-offs, constraints, or edge cases.",
    evaluationMethod: method,
  };
}

const VERIFICATION_LIMITATION_NOTICE =
  "Aaroh validated the URL reference format and evaluated your self-reflection against the brief rubric. The actual artifact (code, data, or deployment) at the external URL has NOT been inspected or executed. To elevate your skills from Student-Attested to Verified, submit your deliverable for independent mentor or peer verification (Roadmap Milestone 4).";

/**
 * Evaluates a project submission against the brief rubric.
 * Produces an honest assessment based solely on student-attested deliverables and reflection depth.
 * External destination artifacts remain explicitly uninspected.
 */
export function evaluateProjectSubmission(
  brief: ProjectBrief,
  input: {
    repoOrDemoUrl: string;
    checkedDeliverableIds: string[];
    reflection: string;
  }
): ProjectSubmissionRecord {
  const urlCheck = validateProjectUrl(input.repoOrDemoUrl);
  const reflectionCheck = evaluateReflectionSubstance(input.reflection);

  const deliverables = brief.deliverables || [];
  const totalDeliverables = deliverables.length;
  const checkedCount = input.checkedDeliverableIds.filter((id) =>
    deliverables.some((d) => d.id === id)
  ).length;

  const completionRatio = totalDeliverables > 0 ? checkedCount / totalDeliverables : 0.8;

  const fingerprint = computeSubmissionFingerprint({
    projectId: brief.id,
    repoOrDemoUrl: input.repoOrDemoUrl,
    checkedDeliverableIds: input.checkedDeliverableIds,
    reflection: input.reflection,
  });

  // Case 1: Malformed or Invalid URL Reference
  if (!urlCheck.isValid) {
    return {
      projectId: brief.id,
      projectSlug: brief.slug,
      careerSlug: brief.careerSlug,
      repoOrDemoUrl: input.repoOrDemoUrl,
      reflection: input.reflection,
      checkedDeliverableIds: input.checkedDeliverableIds,
      status: "rejected",
      overallScore: 0,
      criteriaScores: [],
      upgradedSkillIds: [],
      feedback: `Submission Rejected: ${urlCheck.error || "Invalid project URL."}`,
      actionableNextSteps: [
        "Provide a publicly accessible HTTP/HTTPS URL to a GitHub repository, deployed web application, or document.",
        "Ensure the link does not point to localhost, private IP spaces, or local disk paths.",
      ],
      isArtifactInspected: false,
      verificationLimitationNotice: VERIFICATION_LIMITATION_NOTICE,
      submissionFingerprint: fingerprint,
      submittedAt: new Date().toISOString(),
      evaluatedAt: new Date().toISOString(),
    };
  }

  // Case 2: Incomplete Deliverables (< 50% claimed)
  if (totalDeliverables > 0 && completionRatio < 0.5) {
    const missingDeliverables = deliverables
      .filter((d) => !input.checkedDeliverableIds.includes(d.id))
      .map((d) => d.label);

    const baseScore = Math.round(completionRatio * 50);

    return {
      projectId: brief.id,
      projectSlug: brief.slug,
      careerSlug: brief.careerSlug,
      repoOrDemoUrl: input.repoOrDemoUrl,
      reflection: input.reflection,
      checkedDeliverableIds: input.checkedDeliverableIds,
      status: "evaluation_incomplete",
      overallScore: baseScore,
      criteriaScores: (brief.rubricCriteria || []).map((c) => ({
        criterionId: c.id,
        title: c.title,
        associatedSkillId: c.associatedSkillId,
        score: Math.round(baseScore * 0.8),
        weight: c.weight,
        passed: false,
        feedback: `Missing required deliverable claims for ${c.title}. Only ${checkedCount}/${totalDeliverables} deliverables claimed.`,
        evaluationBasis: "Student attestation checklist incomplete",
      })),
      upgradedSkillIds: [],
      feedback: `Evaluation Incomplete: ${checkedCount} of ${totalDeliverables} deliverables claimed. Core project milestones are missing.`,
      actionableNextSteps: [
        "Complete and attest to the following required deliverables before requesting evaluation:",
        ...missingDeliverables.slice(0, 3).map((item) => `• ${item}`),
        "Ensure your public link contains references for all claimed milestone artifacts.",
      ],
      isArtifactInspected: false,
      verificationLimitationNotice: VERIFICATION_LIMITATION_NOTICE,
      submissionFingerprint: fingerprint,
      submittedAt: new Date().toISOString(),
      evaluatedAt: new Date().toISOString(),
    };
  }

  // Evaluate each Rubric Criterion
  const criteria = brief.rubricCriteria || [];
  const criteriaScores: ProjectCriterionScore[] = [];
  let weightedScoreSum = 0;
  let totalWeight = 0;
  const upgradedSkillIds: string[] = [];

  criteria.forEach((crit) => {
    // Score components:
    // 55% from checked deliverables ratio (student attestation)
    // 25% from reflection substance (self-reported depth)
    // 20% from valid URL format reference
    const deliverablePoints = completionRatio * 55;
    const reflectionPoints = (reflectionCheck.score / 100) * 25;
    const urlPoints = urlCheck.isValid ? 20 : 0;

    const rawScore = Math.min(100, Math.round(deliverablePoints + reflectionPoints + urlPoints));
    const passed = rawScore >= crit.passingThreshold;

    let critFeedback = "";
    if (passed) {
      critFeedback = `Meets attestation standard (${rawScore}/${crit.passingThreshold}). Attested deliverables and reflection support ${crit.title} (Artifact uninspected).`;
    } else if (rawScore >= crit.passingThreshold - 15) {
      critFeedback = `Approaching standard (${rawScore}/${crit.passingThreshold}). Requires more complete deliverable attestation or deeper reflection.`;
    } else {
      critFeedback = `Below standard (${rawScore}/${crit.passingThreshold}). Missing core milestone attestations or technical explanation.`;
    }

    criteriaScores.push({
      criterionId: crit.id,
      title: crit.title,
      associatedSkillId: crit.associatedSkillId,
      score: rawScore,
      weight: crit.weight,
      passed,
      feedback: critFeedback,
      evaluationBasis: "Evaluated student-attested checklist and reflection",
    });

    weightedScoreSum += rawScore * crit.weight;
    totalWeight += crit.weight;
  });

  const overallScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 70;

  // Status Determination
  let status: ProjectSubmissionStatus = "needs_improvement";
  const actionableNextSteps: string[] = [];

  const passedCriteriaCount = criteriaScores.filter((c) => c.passed).length;
  const allCriticalCriteriaPassed = passedCriteriaCount >= Math.max(1, criteriaScores.length - 1);

  // Evaluated conditions:
  // 1. Overall score >= 75
  // 2. Completion ratio >= 0.75 (at least 75% of deliverables claimed)
  // 3. Reflection has substance (>= 15 words)
  // 4. Critical criteria satisfied
  if (
    overallScore >= 75 &&
    completionRatio >= 0.75 &&
    reflectionCheck.hasSubstance &&
    reflectionCheck.wordCount >= 15 &&
    allCriticalCriteriaPassed
  ) {
    status = "evaluated";
    // Mapped skills for criteria that actually passed
    criteriaScores.forEach((c) => {
      if (c.passed && !upgradedSkillIds.includes(c.associatedSkillId)) {
        upgradedSkillIds.push(c.associatedSkillId);
      }
    });

    actionableNextSteps.push(
      "Submission evaluated against brief rubric! Mapped skills updated to 'Student-Attested' in your Skill Matrix.",
      "Notice: External artifacts remain uninspected. Request peer or mentor review (Roadmap Milestone 4) to elevate this work to 'Verified'.",
      "Add this project deliverable and reflection to your student portfolio."
    );
  } else {
    status = "needs_improvement";

    if (completionRatio < 0.75) {
      actionableNextSteps.push(
        `Complete and attest remaining deliverables (${checkedCount}/${totalDeliverables} claimed). Review the brief checklist.`
      );
    }
    if (reflectionCheck.wordCount < 15) {
      actionableNextSteps.push(
        "Expand your architectural reflection to explain design decisions, performance trade-offs, and lessons learned (min 15 words)."
      );
    }
    criteriaScores
      .filter((c) => !c.passed)
      .forEach((c) => {
        actionableNextSteps.push(
          `Refine ${c.title} (scored ${c.score}%, standard is ${critThreshold(brief, c.criterionId)}%): review milestone requirements.`
        );
      });
  }

  const feedback =
    status === "evaluated"
      ? `Submission Evaluated (${overallScore}% Completeness). Attested deliverables and reflection satisfy the brief rubric. External artifacts are uninspected.`
      : `Needs Improvement (${overallScore}% Completeness, standard is 75%). See below for actionable steps to satisfy the brief rubric.`;

  return {
    projectId: brief.id,
    projectSlug: brief.slug,
    careerSlug: brief.careerSlug,
    repoOrDemoUrl: input.repoOrDemoUrl,
    reflection: input.reflection,
    checkedDeliverableIds: input.checkedDeliverableIds,
    status,
    overallScore,
    criteriaScores,
    upgradedSkillIds,
    feedback,
    actionableNextSteps,
    isArtifactInspected: false,
    verificationLimitationNotice: VERIFICATION_LIMITATION_NOTICE,
    submissionFingerprint: fingerprint,
    submittedAt: new Date().toISOString(),
    evaluatedAt: new Date().toISOString(),
  };
}

function critThreshold(brief: ProjectBrief, critId: string): number {
  const match = (brief.rubricCriteria || []).find((c) => c.id === critId);
  return match ? match.passingThreshold : 70;
}
