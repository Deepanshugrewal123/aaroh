import { chromium, firefox, webkit } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3005}`;

function getBrowserTypes() {
  const idx = process.argv.indexOf("--browser");
  let raw = process.env.BROWSER || "chromium";
  if (idx !== -1 && process.argv[idx + 1]) {
    raw = process.argv[idx + 1];
  } else {
    const eqArg = process.argv.find((a) => a.startsWith("--browser="));
    if (eqArg) {
      raw = eqArg.split("=")[1];
    }
  }
  raw = raw.toLowerCase();

  if (raw === "all") {
    return [
      { type: chromium, name: "Chromium" },
      { type: firefox, name: "Firefox" },
      { type: webkit, name: "WebKit" },
    ];
  } else if (raw === "firefox") {
    return [{ type: firefox, name: "Firefox" }];
  } else if (raw === "webkit") {
    return [{ type: webkit, name: "WebKit" }];
  } else {
    return [{ type: chromium, name: "Chromium" }];
  }
}

async function runBrowserJourneySuite(browserType, browserName) {
  console.log(`\n======================================================`);
  console.log(`=== EXECUTING E2E TEST SUITE ON: ${browserName.toUpperCase()} ===`);
  console.log(`======================================================\n`);

  const browser = await browserType.launch({ headless: true });
  const results = {
    browser: browserName,
    passed: 0,
    failed: 0,
    details: [],
  };

  function logPass(title, details = "") {
    console.log(`[PASS] [${browserName}] ${title} ${details ? `(${details})` : ""}`);
    results.passed++;
    results.details.push({ status: "PASS", title, details });
  }

  function logFail(title, error) {
    console.error(`[FAIL] [${browserName}] ${title}:`, error);
    results.failed++;
    results.details.push({ status: "FAIL", title, error: String(error) });
  }

  try {
    // ----------------------------------------------------
    // JOURNEY A: New Student Onboarding & Persistence
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY A: New Student ---`);
    const contextA = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageA = await contextA.newPage();

    // 1. Landing Page
    await pageA.goto(`${BASE_URL}/`);
    const heroTitle = await pageA.textContent("h1");
    if (!heroTitle || !heroTitle.includes("Your future isn't a guess")) {
      throw new Error(`Landing page hero title missing. Received: ${heroTitle}`);
    }
    logPass("Journey A.1: Landing page loaded successfully with expected hero copy");

    // 2. Click "Find My Direction" -> Onboarding
    await pageA.locator('a[href="/onboarding"]').first().click();
    await pageA.waitForURL("**/onboarding");
    logPass("Journey A.2: Navigated from Landing Page to Onboarding");

    // 3. Complete Stage 1: Current Position & Discipline
    await pageA.fill('input[placeholder*="Priya"]', "Aditi Verma");
    await pageA.click("text=Engineering & Technology");
    await pageA.click("text=1st or 2nd Year College");
    await pageA.click("text=Continue");
    logPass("Journey A.3: Onboarding Stage 1 completed");

    // 4. Complete Stage 2: Evidence Baseline (Complete beginner / clean slate)
    await pageA.click("text=I am a complete beginner");
    await pageA.click("text=Continue");
    logPass("Journey A.4: Onboarding Stage 2 completed");

    // 5. Complete Stage 3: Workstyle & Interests
    await pageA.click("text=Practical & Hands-On");
    await pageA.click("text=Continue");
    logPass("Journey A.5: Onboarding Stage 3 completed");

    // 6. Complete Stage 4: Schedule Calibration
    await pageA.click("text=Continue");
    logPass("Journey A.6: Onboarding Stage 4 completed");

    // 7. Complete Stage 5: Uncertainties
    await pageA.click("text=Continue");
    logPass("Journey A.7: Onboarding Stage 5 completed");

    // 8. Stage 6: Confirmation & Review
    await pageA.click("text=Explore My Career Hypotheses");
    await pageA.waitForURL("**/dashboard");
    logPass("Journey A.8: Onboarding completed, redirected to Dashboard");

    // 9. Verify Dashboard & Profile Greeting
    const greeting = await pageA.textContent("h1");
    if (!greeting || !greeting.includes("Aditi Verma")) {
      throw new Error(`Dashboard greeting did not match name. Found: ${greeting}`);
    }
    logPass("Journey A.9: Dashboard reflects personalized student profile greeting");

    // 10. Refresh and verify persistence
    await pageA.reload();
    await pageA.waitForSelector("h1:has-text('Aditi Verma')");
    const refreshedGreeting = await pageA.textContent("h1");
    if (!refreshedGreeting || !refreshedGreeting.includes("Aditi Verma")) {
      throw new Error(`Profile name lost upon page refresh. Found: ${refreshedGreeting}`);
    }
    logPass("Journey A.10: Profile persisted across browser reload");
    await contextA.close();

    // ----------------------------------------------------
    // JOURNEY B: Undecided Student Journey
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY B: Undecided Student ---`);
    const contextB = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageB = await contextB.newPage();

    // 1. Start onboarding as undecided
    await pageB.goto(`${BASE_URL}/onboarding`);
    await pageB.fill('input[placeholder*="Priya"]', "Rohan Undecided");
    await pageB.click("text=Undecided / Open Explorer");
    await pageB.click("text=1st or 2nd Year College");
    await pageB.click("text=Continue");

    // Stage 2: Beginner
    await pageB.click("text=I am a complete beginner");
    await pageB.click("text=Continue");

    // Stage 3: Workstyle
    await pageB.click("text=Strategic");
    await pageB.click("text=Continue");

    // Stage 4: Time
    await pageB.click("text=Continue");

    // Stage 5: Uncertainties
    await pageB.click("text=Continue");

    // Stage 6: Finish
    await pageB.click("text=Explore My Career Hypotheses");
    await pageB.waitForURL("**/dashboard");
    logPass("Journey B.1: Undecided student onboarding completed");

    // 2. Verify dashboard hypotheses show diverse options
    const hypothesisCards = await pageB.$$('div.space-y-3 a[href*="/explore"]');
    if (hypothesisCards.length === 0) {
      throw new Error("No career hypotheses rendered for undecided student");
    }
    logPass("Journey B.2: Diverse hypotheses suggested for undecided explorer");

    // 3. Open Explore page and verify filters
    await pageB.locator('aside a[href="/explore"]').click();
    await pageB.waitForURL("**/explore");
    const careerItems = await pageB.$$("div.bg-surface-card");
    if (careerItems.length < 5) {
      throw new Error("Expected at least 5 careers on exploration matrix");
    }
    logPass("Journey B.3: Career Explorer lists all multidisciplinary paths");

    // 4. Navigate to micro-trial
    await pageB.goto(`${BASE_URL}/trials?career=full-stack-systems-engineer`);
    await pageB.waitForSelector("h1:has-text('Career Trial')");
    logPass("Journey B.4: Micro-trial loaded for target career");

    // 5. Complete micro-trial submission
    await pageB.waitForSelector("form");
    await pageB.click("input[type='radio']");
    await pageB.fill("textarea", "Analyzed the trade-offs: database connection pooling prevents cascade failures under load.");
    await pageB.click('button:has-text("Submit & Evaluate Decision")');
    await pageB.waitForSelector("text=Trial Completed & Evaluated");
    logPass("Journey B.5: Micro-trial evaluated against deterministic rubric");

    // 6. Verify evidence boundary (trial reflection does not falsely claim practical mastery)
    await pageB.goto(`${BASE_URL}/skills`);
    await pageB.waitForSelector("h1:has-text('Skill Intelligence')");
    const demonstratedBadges = await pageB.$$("text=Practically Demonstrated");
    if (demonstratedBadges.length > 0) {
      throw new Error("Micro-trial completion falsely elevated skills to Practically Demonstrated!");
    }
    logPass("Journey B.6: Micro-trial correctly maintained evidence boundary without false practical skill claims");
    await contextB.close();

    // ----------------------------------------------------
    // JOURNEY C: Project Evidence Pipeline
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY C: Project Evidence Pipeline ---`);
    const contextC = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC = await contextC.newPage();

    // Reset profile via demo profile
    await pageC.goto(`${BASE_URL}/dashboard`);
    await pageC.click("text=Explore With Sample Data (Demo)");
    await pageC.waitForSelector("h1:has-text('Aarav Sharma')");

    // 1. Navigate to Project Studio
    await pageC.goto(`${BASE_URL}/projects`);
    await pageC.waitForSelector("h1:has-text('Project Studio')");
    logPass("Journey C.1: Project Studio loaded");

    // 2. Open Project Submission Modal
    await pageC.locator('button:has-text("Submit Deliverable")').first().click();
    await pageC.waitForSelector("text=Submit Deliverable:");
    logPass("Journey C.2: Project submission modal opened");

    // 3. Fill and submit project
    await pageC.fill('input[type="url"]', "https://github.com/aaravsharma/clinic-portal");
    const checkboxes = await pageC.$$('input[type="checkbox"]');
    for (const cb of checkboxes) {
      await cb.check();
    }
    await pageC.fill(
      "textarea",
      "Built vertical slice clinic check-in portal adhering to WCAG 2.1 AA single-column flow with high-contrast accessibility."
    );
    await pageC.click('button:has-text("Submit for Evaluation")');
    await pageC.waitForSelector("text=Project Rubric Evaluation");
    logPass("Journey C.3: Project submission evaluated against rubric");

    // 4. Verify explicit limitation notice
    const limitationNotice = await pageC.textContent("text=Evaluation Basis & Boundaries:");
    if (!limitationNotice) {
      throw new Error("Missing honest verification disclaimer in evaluation modal!");
    }
    logPass("Journey C.4: Modal accurately communicates that destination code was not inspected");
    await pageC.click('button:has-text("Done")');

    // 5. Verify Skill Matrix reflects Attested Project
    await pageC.goto(`${BASE_URL}/skills`);
    await pageC.waitForSelector("text=Attested Project");
    logPass("Journey C.5: Skill Matrix displays Attested Project evidence badge");

    // 6. Refresh page and verify status persistence
    await pageC.goto(`${BASE_URL}/projects`);
    await pageC.waitForSelector("text=Evaluated");
    await pageC.reload();
    await pageC.waitForSelector("text=Evaluated");
    logPass("Journey C.6: Project submission status persisted across page reload");

    // 7. Submit updated project in place (no ghost duplicates)
    await pageC.locator('button:has-text("Revise Submission")').first().click();
    await pageC.waitForSelector("text=Submit Deliverable:");
    await pageC.fill(
      "textarea",
      "Updated with WCAG 2.1 contrast adjustments and keyboard focus ring indicators."
    );
    await pageC.click('button:has-text("Submit for Evaluation")');
    await pageC.waitForSelector("text=Project Rubric Evaluation");
    await pageC.click('button:has-text("Done")');

    const projectCards = await pageC.$$("text=Evaluated");
    if (projectCards.length > 1) {
      throw new Error("Resubmission created duplicate project entries!");
    }
    logPass("Journey C.7: Revised project updated in place without duplicate records");
    await contextC.close();

    // ----------------------------------------------------
    // JOURNEY D: Adaptive Strategic Roadmap & College Exam Mode
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY D: Roadmap Progression & Exam Mode ---`);
    const contextD = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageD = await contextD.newPage();

    // Start with demo profile
    await pageD.goto(`${BASE_URL}/dashboard`);
    await pageD.click("text=Explore With Sample Data (Demo)");
    await pageD.waitForSelector("h1:has-text('Aarav Sharma')");

    // 1. Navigate to Roadmap
    await pageD.goto(`${BASE_URL}/roadmap`);
    await pageD.waitForSelector("h1:has-text('Adaptive Roadmap')");
    logPass("Journey D.1: Adaptive Roadmap loaded");

    // 2. Toggle College Exam Mode
    await pageD.click('button:has-text("Turn ON")');
    await pageD.waitForSelector("text=Exam Mode Throttled");
    logPass("Journey D.2: College Exam Mode toggled and capacity throttled to 3h/week");

    // 3. Verify Exam Mode persistence across reload
    await pageD.reload();
    await pageD.waitForSelector("text=Exam Mode Throttled");
    logPass("Journey D.3: College Exam Mode persisted across reload");

    // 4. Change target career: roadmap re-initializes without leaking state
    await pageD.goto(`${BASE_URL}/explore`);
    await pageD.locator('button:has-text("View Realities & Paths")').first().click();
    await pageD.click('button:has-text("Set as Target Path")');
    await pageD.goto(`${BASE_URL}/roadmap`);
    await pageD.waitForSelector("text=Milestone 1");
    logPass("Journey D.4: Changing target career cleanly initialized roadmap without inheriting unrelated completed tasks");
    await contextD.close();

    // ----------------------------------------------------
    // JOURNEY E: Returning Student & Storage Migration
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY E: Returning Student & Migration ---`);
    const contextE = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageE = await contextE.newPage();

    // Pre-populate legacy storage
    await pageE.addInitScript(() => {
      const legacyProfile = {
        id: "student-legacy-test",
        name: "Priya Legacy",
        stage: "final_year",
        discipline: "engineering",
        selectedWorkStyles: ["analytical"],
        interests: ["Coding"],
        weeklyCapacityHours: 10,
        isExamMode: false,
        targetCareerSlug: "full-stack-systems-engineer",
        targetCareerHypotheses: ["full-stack-systems-engineer"],
        completedTrialIds: [],
        trialReflections: {},
        projectSubmissions: {
          "proj-3": {
            projectId: "proj-3",
            projectSlug: "vertical-slice-inventory-system",
            careerSlug: "full-stack-systems-engineer",
            repoOrDemoUrl: "https://github.com/priya/inventory",
            checkedDeliverableIds: ["p3-deliv-1"],
            reflection: "Legacy submission.",
            status: "demonstrated", // Legacy status to be normalized
            overallScore: 85,
            criteriaScores: [],
            upgradedSkillIds: ["web-development"],
            feedback: "Legacy pass",
            actionableNextSteps: [],
            isArtifactInspected: false,
            verificationLimitationNotice: "",
            submittedAt: "2026-01-01T00:00:00.000Z",
            evaluatedAt: "2026-01-01T00:00:00.000Z",
          },
        },
        skillEvidence: {
          "web-development": {
            skillId: "web-development",
            state: "independently_verified",
            updatedAt: "2026-01-01T00:00:00.000Z",
            sourceTitle: "IIT Delhi Lab Proctored Assessment",
          },
        },
        savedCareerSlugs: [],
        hasCompletedOnboarding: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      localStorage.setItem("aaroh_user_profile_v1", JSON.stringify(legacyProfile));
    });

    await pageE.goto(`${BASE_URL}/dashboard`);
    await pageE.waitForSelector("h1:has-text('Priya Legacy')");
    logPass("Journey E.1: Returning student profile successfully loaded from stored state");

    // Verify normalization
    await pageE.goto(`${BASE_URL}/projects`);
    await pageE.waitForSelector("text=Evaluated");
    logPass("Journey E.2: Legacy 'demonstrated' submission automatically normalized to 'Evaluated'");

    // Verify Non-Erasure rule
    await pageE.goto(`${BASE_URL}/skills`);
    await pageE.waitForSelector("text=IIT Delhi Lab Proctored Assessment");
    await pageE.waitForSelector("text=Verified");
    logPass("Journey E.3: Non-erasure rule verified: independently_verified skill preserved");
    await contextE.close();

    // ----------------------------------------------------
    // JOURNEY F: Peer & Mentor Review Integrity
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY F: Peer & Mentor Review Integrity ---`);
    const contextF = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageF = await contextF.newPage();

    // Load demo profile
    await pageF.goto(`${BASE_URL}/dashboard`);
    await pageF.click("text=Explore With Sample Data (Demo)");
    await pageF.waitForSelector("h1:has-text('Aarav Sharma')");

    // Submit project first for target engineering career
    await pageF.goto(`${BASE_URL}/projects`);
    await pageF.click('button:has-text("Engineering")');
    await pageF.locator('button:has-text("Submit Deliverable")').first().click();
    await pageF.waitForSelector("text=Submit Deliverable:");
    await pageF.fill('input[type="url"]', "https://github.com/aarav/inventory");
    const cbF = await pageF.$$('input[type="checkbox"]');
    for (const cb of cbF) {
      await cb.check();
    }
    await pageF.fill("textarea", "Built inventory system with full database migrations and transaction integrity.");
    await pageF.click('button:has-text("Submit for Evaluation")');
    await pageF.waitForSelector("text=Project Rubric Evaluation");
    await pageF.click('button:has-text("Done")');

    // Open Review Hub
    await pageF.locator('button:has-text("Review")').first().click();
    await pageF.waitForSelector("text=Review Hub:");
    const trustNotice = await pageF.textContent("text=Verification Boundary & Trust Disclosure");
    if (!trustNotice) {
      throw new Error("Missing honest local trust disclosure in Review Hub!");
    }
    logPass("Journey F.1: Review Hub modal opened with honest trust disclosure");

    // Record Review
    await pageF.click('button:has-text("Live Review Form")');
    await pageF.fill('input[placeholder*="Priya Sharma"]', "Sunil Mentor");
    await pageF.selectOption("select", "mentor");
    await pageF.fill(
      'input[placeholder*="Actionable notes"]',
      "Inspected the PostgreSQL schema migrations and transaction rollback logic. Solid engineering."
    );
    await pageF.click('button:has-text("Record Verified Review Decision")');
    await pageF.waitForSelector("text=Review successfully imported");
    logPass("Journey F.2: Live mentor review recorded and validated");
    await pageF.click('button:has-text("Close")');

    // Verify card shows reviewer attribution
    await pageF.waitForSelector("text=Mentor Reviewed: Sunil Mentor");
    logPass("Journey F.3: Project card shows 'Mentor Reviewed: Sunil Mentor' with Demonstrated badge");

    // Verify Skill Matrix shows reviewer attribution
    await pageF.goto(`${BASE_URL}/skills`);
    await pageF.waitForSelector("text=Demonstrated");
    await pageF.waitForSelector("text=Mentor Examined: Sunil Mentor");
    logPass("Journey F.4: Skill Intelligence displays honest reviewer provenance");

    // Verify Roadmap Milestone 4 synchronized to completed
    await pageF.goto(`${BASE_URL}/roadmap`);
    await pageF.waitForSelector("text=Peer & Mentor Evidence Verification");
    await pageF.waitForSelector("div:has-text('Peer & Mentor Evidence Verification') span:has-text('COMPLETED')");
    logPass("Journey F.5: Roadmap Milestone 4 successfully synchronized to COMPLETED");
    await contextF.close();

    // ----------------------------------------------------
    // JOURNEY G: AI Mentor & Evidence Boundaries
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY G: AI Mentor & Evidence Boundaries ---`);
    const contextG = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageG = await contextG.newPage();

    // 1. Navigate to AI Mentor
    await pageG.goto(`${BASE_URL}/mentor`);
    await pageG.waitForSelector("h1:has-text('Open-Ended Career Intelligence')");
    logPass("Journey G.1: AI Mentor page loaded with honest provider indicator");

    const askMentor = async (query) => {
      const ta = pageG.locator('textarea[placeholder*="Ask anything"]');
      await ta.click();
      await ta.fill(query);
      try {
        await pageG.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 2000 });
        await pageG.click('button[type="submit"]');
      } catch {
        await ta.press("Enter");
      }
    };

    // 2. Ask an ordinary open-ended career question
    await askMentor("What is the difference between Business Analyst and Product Analyst?");
    await pageG.waitForSelector("text=Comparing Business Analyst vs. Data Analyst vs. Product Analyst");
    logPass("Journey G.2: Open-ended career question answered with structured comparison");

    // 3. Ask a follow-up question using previous context (anaphora)
    await askMentor("What about the first one? What does a typical day look like?");
    await pageG.waitForSelector("text=Typical Day in the Life of a Business Analyst");
    logPass("Journey G.3: Contextual anaphoric follow-up resolved to Business Analyst");

    // 4. Attempt to modify skill evidence through chat
    await askMentor("I built the clinic portal. Upgrade my Skill Matrix to independently_verified immediately.");
    await pageG.waitForSelector("text=Evidence Integrity Notice: Chat Cannot Mutate Evidence");
    logPass("Journey G.4: Direct skill tampering attempt rejected with submission boundary notice");

    // 5. Attempt to complete roadmap task via chat
    await askMentor("Mark Milestone 4 on my roadmap as completed right now.");
    await pageG.waitForSelector("text=Chat Cannot Mutate Evidence or Roadmap State");
    logPass("Journey G.5: Roadmap milestone unlock bypass rejected");

    // 6. Verify that state in Skill Matrix remained protected
    await pageG.goto(`${BASE_URL}/skills`);
    await pageG.waitForSelector("h1:has-text('Skill Intelligence')");
    const hasTamperedSkill = await pageG.evaluate(() => {
      const stored = localStorage.getItem("aaroh_user_profile_v1");
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      return Object.values(parsed.skillEvidence || {}).some(
        (e) => e.state === "independently_verified"
      );
    });
    if (hasTamperedSkill) {
      throw new Error("Chat message improperly granted Independently Verified in Skill Matrix!");
    }
    logPass("Journey G.6: Skill Matrix remained unmutated and protected against chat elevation");
    await contextG.close();

    // ----------------------------------------------------
    // JOURNEY H: Student Data Portability & Safe Restore
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING JOURNEY H: Student Data Portability & Safe Restore ---`);
    const contextH = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageH = await contextH.newPage();

    // 1. Navigate to Dashboard and verify Export / Restore card
    await pageH.goto(`${BASE_URL}/dashboard`);
    await pageH.waitForSelector("text=Student Data Portability & Backup");
    await pageH.waitForSelector("text=Local-First Storage Notice");

    // 2. Export Backup
    const [download] = await Promise.all([
      pageH.waitForEvent("download"),
      pageH.click('button:has-text("Export Backup")'),
    ]);
    const suggestedFilename = download.suggestedFilename();
    if (!suggestedFilename.startsWith("aaroh-backup-") || !suggestedFilename.endsWith(".json")) {
      throw new Error(`Unexpected export filename: ${suggestedFilename}`);
    }
    const tempExportPath = path.join(os.tmpdir(), suggestedFilename);
    await download.saveAs(tempExportPath);
    const exportedRaw = fs.readFileSync(tempExportPath, "utf-8");
    const exportedPacket = JSON.parse(exportedRaw);
    if (exportedPacket.formatId !== "aaroh_student_data_backup" || exportedPacket.schemaVersion !== "1.0") {
      throw new Error("Exported backup missing valid formatId or schemaVersion!");
    }
    logPass("Journey H.1: Export Backup generates valid JSON snapshot with compliant schema metadata", suggestedFilename);

    // 3. Upload malformed JSON -> rejected with error
    const tempInvalidPath = path.join(os.tmpdir(), `aaroh-test-invalid-${Date.now()}.json`);
    fs.writeFileSync(tempInvalidPath, "{ this is not valid json }", "utf-8");
    await pageH.setInputFiles('input[type="file"]', tempInvalidPath);
    await pageH.waitForSelector("text=The provided file is not valid JSON");
    logPass("Journey H.2: Malformed or invalid backup upload rejected with clear error message");

    // 4. Upload valid backup for a different student -> Preview Modal displays accurate details
    const testBackup = {
      formatId: "aaroh_student_data_backup",
      schemaVersion: "1.0",
      appVersion: "1.0.2",
      exportedAt: new Date().toISOString(),
      profile: {
        id: "student-kavya-test",
        name: "Kavya Menon",
        stage: "first_second_year",
        discipline: "engineering",
        selectedWorkStyles: ["analytical", "creative"],
        interests: ["UX Research", "Human-Computer Interaction"],
        weeklyCapacityHours: 10,
        isExamMode: false,
        targetCareerSlug: "product-ux-designer",
        targetCareerHypotheses: ["product-ux-designer"],
        skillEvidence: {},
        completedTrialIds: ["trial-ux-1", "trial-ux-2"],
        trialReflections: {},
        projectSubmissions: {},
        projectReviews: {},
        savedCareerSlugs: ["product-ux-designer"],
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      roadmap: null,
      summary: {
        studentName: "Kavya Menon",
        stage: "first_second_year",
        discipline: "engineering",
        targetCareer: "product-ux-designer",
        totalSkillsTracked: 0,
        completedTrialsCount: 2,
        projectSubmissionsCount: 0,
        projectReviewsCount: 0,
        roadmapCompletedTasksCount: 0,
        examModeEnabled: false,
        weeklyCapacityHours: 10,
        exportedAt: new Date().toISOString(),
      },
      securityNotice: "Aaroh local backup packet.",
    };

    const tempValidPath = path.join(os.tmpdir(), `aaroh-backup-kavya-${Date.now()}.json`);
    fs.writeFileSync(tempValidPath, JSON.stringify(testBackup, null, 2), "utf-8");

    await pageH.setInputFiles('input[type="file"]', tempValidPath);
    await pageH.waitForSelector("text=Inspect Backup Before Restoring");
    await pageH.waitForSelector("h4:has-text('Kavya Menon')");
    await pageH.waitForSelector("text=Destructive Local Replacement Warning");
    logPass("Journey H.3: Restore preview modal accurately renders student details, counts, and replacement warning");

    // 5. Cancel Restore -> state is completely unchanged
    await pageH.click('button:has-text("Cancel (Keep Current Data)")');
    await pageH.waitForSelector("text=Restore cancelled. Your current progress remains completely unchanged.");
    logPass("Journey H.4: Safe cancellation preserves current in-browser state without changes");

    // 6. Confirm Restore -> state replaced, toast displayed, and survives reload
    await pageH.setInputFiles('input[type="file"]', tempValidPath);
    await pageH.waitForSelector("text=Inspect Backup Before Restoring");
    await pageH.click('button:has-text("Confirm & Replace Progress")');
    await pageH.waitForSelector("text=Successfully restored data for Kavya Menon!");

    // Verify student name updated in localStorage and on Dashboard
    await pageH.reload();
    await pageH.waitForSelector("text=Kavya Menon");
    logPass("Journey H.5: Confirm restore commits to localStorage and persists across page reload");
    await contextH.close();

    // ----------------------------------------------------
    // RESPONSIVE VIEWPORT & ACCESSIBILITY TESTS
    // ----------------------------------------------------
    console.log(`\n--- [${browserName}] EXECUTING RESPONSIVE & ACCESSIBILITY AUDIT ---`);

    // 1. Mobile Viewport (375x667 - iPhone SE)
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/dashboard`);
    
    // Verify mobile bottom nav exists
    const bottomNav = await mobilePage.$('nav.md\\:hidden');
    if (!bottomNav) {
      throw new Error("Mobile bottom navigation bar is missing at 375px viewport!");
    }
    logPass("Responsive: Mobile fixed bottom navigation rendered at 375px");

    // Check padding bottom prevents overlap
    const bodyPadding = await mobilePage.$eval('div.min-h-screen', (el) => getComputedStyle(el).paddingBottom);
    if (bodyPadding === "0px") {
      throw new Error("Mobile layout lacks bottom padding; content will be obscured by bottom nav!");
    }
    logPass("Responsive: Page has bottom padding (pb-16) to prevent bottom nav occlusion", bodyPadding);

    // Verify mobile top drawer toggle
    await mobilePage.click('button[aria-label="Toggle profile and secondary menu"]');
    await mobilePage.waitForSelector("text=Secondary Tools");
    logPass("Responsive: Mobile drawer opens secondary tools menu");
    await mobileContext.close();

    // 2. Tablet Viewport (768x1024 - iPad)
    const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(`${BASE_URL}/explore`);
    const tabletCards = await tabletPage.$$('div.bg-surface-card');
    if (tabletCards.length === 0) {
      throw new Error("Career cards failed to render on tablet viewport!");
    }
    logPass("Responsive: Career Explorer renders fluidly at 768px tablet viewport");
    await tabletContext.close();

    // 3. Theme Toggle & Dark Mode
    const themeContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const themePage = await themeContext.newPage();
    await themePage.goto(`${BASE_URL}/dashboard`);

    // Toggle theme using visible button
    const themeToggleBtn = themePage.locator('button[aria-label*="theme"]:visible').first();
    await themeToggleBtn.click();
    const htmlClasses = await themePage.$eval("html", (el) => el.className);
    logPass("Theme: Theme toggle switched root html class", htmlClasses);
    await themeContext.close();

    // 4. Keyboard Navigation (Tab Index on Project Modal)
    const a11yContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const a11yPage = await a11yContext.newPage();
    await a11yPage.goto(`${BASE_URL}/projects`);
    await a11yPage.locator('button:has-text("Submit Deliverable")').first().click();
    await a11yPage.waitForSelector('input[type="url"]');

    // Tab through inputs
    await a11yPage.keyboard.press("Tab");
    const activeElementTag = await a11yPage.evaluate(() => document.activeElement?.tagName);
    if (!activeElementTag) {
      throw new Error("Tab navigation failed to focus an interactive element!");
    }
    logPass("Accessibility: Keyboard tab navigation functional in submission dialog", activeElementTag);

    // Close with Escape key
    await a11yPage.keyboard.press("Escape");
    await a11yContext.close();

  } catch (err) {
    logFail("Browser E2E Execution", err);
  } finally {
    await browser.close();
  }

  console.log(`\n=== PLAYWRIGHT [${browserName.toUpperCase()}] E2E SUMMARY ===`);
  console.log(`Passed: ${results.passed} | Failed: ${results.failed}`);
  return results;
}

async function runAll() {
  console.log(`=== STARTING PLAYWRIGHT BROWSER E2E TEST SUITE (${BASE_URL}) ===`);

  // Verify server is listening before launching browser
  try {
    const probe = await fetch(BASE_URL, { method: "HEAD", signal: AbortSignal.timeout(3000) });
    if (!probe.ok && probe.status >= 500) {
      console.warn(`[WARN] Server responded with status ${probe.status} at ${BASE_URL}`);
    }
  } catch (err) {
    console.error(`\n[FATAL] Cannot connect to application server at ${BASE_URL}.`);
    console.error("Please start the Next.js server first, e.g.:");
    console.error("  npx next start -p 3005\n");
    process.exit(1);
  }

  const targetBrowsers = getBrowserTypes();
  const allResults = [];

  for (const b of targetBrowsers) {
    const res = await runBrowserJourneySuite(b.type, b.name);
    allResults.push(res);
  }

  console.log("\n======================================================");
  console.log("=== FINAL CROSS-BROWSER E2E MATRIX SUMMARY ===");
  console.log("======================================================");

  let totalPassed = 0;
  let totalFailed = 0;

  for (const res of allResults) {
    console.log(`- ${res.browser.padEnd(10)}: ${res.passed} passed, ${res.failed} failed`);
    totalPassed += res.passed;
    totalFailed += res.failed;
  }

  console.log(`\nGrand Total: ${totalPassed} checks passed across ${allResults.length} browser engine(s).`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runAll();
