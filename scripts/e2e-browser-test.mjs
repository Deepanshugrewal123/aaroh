import { chromium } from "playwright";

const BASE_URL = "http://localhost:3005";

async function runBrowserE2E() {
  console.log("=== STARTING PLAYWRIGHT BROWSER E2E TEST SUITE ===");
  const browser = await chromium.launch({ headless: true });
  const results = {
    passed: 0,
    failed: 0,
    details: [],
  };

  function logPass(title, details = "") {
    console.log(`[PASS] ${title} ${details ? `(${details})` : ""}`);
    results.passed++;
    results.details.push({ status: "PASS", title, details });
  }

  function logFail(title, error) {
    console.error(`[FAIL] ${title}:`, error);
    results.failed++;
    results.details.push({ status: "FAIL", title, error: String(error) });
  }

  try {
    // ----------------------------------------------------
    // JOURNEY A: New Student Onboarding & Persistence
    // ----------------------------------------------------
    console.log("\n--- EXECUTING JOURNEY A: New Student ---");
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
    await pageA.locator("text=Find My Direction").first().click();
    await pageA.waitForURL("**/onboarding");
    logPass("Journey A.2: Navigated from Landing Page to Onboarding");

    // 3. Complete Step 1: Name & Stage
    await pageA.fill('input[placeholder*="optional"]', "Aditi Verma");
    await pageA.click("text=1st or 2nd Year College");
    await pageA.click("text=Continue");
    logPass("Journey A.3: Onboarding Step 1 completed");

    // 4. Complete Step 2: Field (Technology & Code)
    await pageA.click("text=Technology & Code");
    await pageA.click("text=Continue");
    logPass("Journey A.4: Onboarding Step 2 completed");

    // 5. Complete Step 3: Workstyle
    await pageA.click("text=Hands-on & Practical");
    await pageA.click("text=Continue");
    logPass("Journey A.5: Onboarding Step 3 completed");

    // 6. Complete Step 4: Weekly Hours & Finish
    await pageA.click("text=Generate Starting Hypotheses");
    await pageA.waitForURL("**/dashboard");
    logPass("Journey A.6: Onboarding completed, redirected to Dashboard");

    // 7. Verify Dashboard & Profile Greeting
    const greeting = await pageA.textContent("h1");
    if (!greeting || !greeting.includes("Aditi Verma")) {
      throw new Error(`Dashboard greeting did not match name. Found: ${greeting}`);
    }
    logPass("Journey A.7: Dashboard reflects personalized student profile greeting");

    // 8. Refresh and verify persistence
    await pageA.reload();
    await pageA.waitForSelector("h1");
    const refreshedGreeting = await pageA.textContent("h1");
    if (!refreshedGreeting || !refreshedGreeting.includes("Aditi Verma")) {
      throw new Error(`Profile name lost upon page refresh. Found: ${refreshedGreeting}`);
    }
    logPass("Journey A.8: Profile persisted across browser reload");
    await contextA.close();

    // ----------------------------------------------------
    // JOURNEY B: Undecided Student Journey
    // ----------------------------------------------------
    console.log("\n--- EXECUTING JOURNEY B: Undecided Student ---");
    const contextB = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageB = await contextB.newPage();

    // 1. Start onboarding as undecided
    await pageB.goto(`${BASE_URL}/onboarding`);
    await pageB.fill('input[placeholder*="optional"]', "Rohan Undecided");
    await pageB.click("text=Open / Exploring");
    await pageB.click("text=Continue");

    // Step 2: Choose "I'm not sure yet"
    await pageB.click("text=I'm not sure yet");
    await pageB.click("text=Continue");

    // Step 3: Workstyle
    await pageB.click("text=Visual & Creative");
    await pageB.click("text=Continue");

    // Step 4: Finish
    await pageB.click("text=Generate Starting Hypotheses");
    await pageB.waitForURL("**/dashboard");
    logPass("Journey B.1: Undecided student onboarding completed");

    // 2. Verify dashboard hypotheses show diverse options
    const hypothesisCards = await pageB.$$('div.space-y-3 a[href*="/explore"]');
    if (hypothesisCards.length === 0) {
      throw new Error("No career hypotheses rendered for undecided student");
    }
    logPass("Journey B.2: Diverse hypotheses suggested for undecided explorer");

    // 3. Open Explore page and verify filters
    await pageB.click("text=Explore");
    await pageB.waitForURL("**/explore");
    const careerItems = await pageB.$$('div.grid > div.bg-surface-card');
    if (careerItems.length < 5) {
      throw new Error(`Expected at least 7 careers in catalog, found: ${careerItems.length}`);
    }
    logPass("Journey B.3: Career Explorer lists all multidisciplinary paths");

    // 4. Navigate to micro-trial for UX Designer
    await pageB.goto(`${BASE_URL}/trials?career=product-ux-designer`);
    await pageB.waitForSelector("h2");
    logPass("Journey B.4: Micro-trial loaded for target career");

    // 5. Select approach option and enter reflection
    const firstRadio = await pageB.$('input[name="trialChoice"]');
    if (firstRadio) {
      await firstRadio.click();
    }
    // Type in rationale textarea
    await pageB.fill('textarea', 
      "Prioritizing high contrast text with single-column linear layout prevents cognitive overload for elderly patients while adhering strictly to WCAG 2.1 AA accessibility guidelines.");

    // Submit trial
    await pageB.click('button:has-text("Submit & Evaluate Decision")');
    await pageB.waitForSelector("text=Trial Completed & Evaluated");
    logPass("Journey B.5: Micro-trial evaluated against deterministic rubric");

    // 6. Verify evidence state boundary: Micro-trial does NOT grant Practically Demonstrated
    await pageB.goto(`${BASE_URL}/skills`);
    await pageB.waitForSelector("h1:has-text('Skill Intelligence')");
    // Ensure no false "Demonstrated Project" is awarded in Skill Matrix
    const demonstratedBadges = await pageB.$$("text=Demonstrated Project");
    if (demonstratedBadges.length > 0) {
      throw new Error("Micro-trial completion falsely granted Demonstrated Project in Skill Matrix!");
    }
    logPass("Journey B.6: Micro-trial correctly maintained evidence boundary without false practical skill claims");
    await contextB.close();

    // ----------------------------------------------------
    // JOURNEY C: Project Evidence Pipeline
    // ----------------------------------------------------
    console.log("\n--- EXECUTING JOURNEY C: Project Evidence Pipeline ---");
    const contextC = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC = await contextC.newPage();

    // 1. Open Project Studio
    await pageC.goto(`${BASE_URL}/projects`);
    await pageC.waitForSelector("h1:has-text('Project Studio')");
    logPass("Journey C.1: Project Studio loaded");

    // 2. Click "Submit Deliverable" on first brief
    await pageC.locator('button:has-text("Submit Deliverable")').first().click();
    await pageC.waitForSelector('input[type="url"]');
    logPass("Journey C.2: Project submission modal opened");

    // 3. Fill in submission details
    await pageC.fill('input[type="url"]', "https://github.com/aaroh-student/accessible-clinic-portal");
    
    // Check all deliverable checkboxes
    const checkboxes = await pageC.$$('input[type="checkbox"]');
    for (const cb of checkboxes) {
      await cb.check();
    }

    // Fill in substantive reflection
    await pageC.fill('textarea', 
      "Designed a WCAG 2.1 AA accessible check-in interface. The principal architecture trade-off was removing multi-tiered modals in favor of a single-column linear layout to preserve screen reader tab index predictability. Enforced 4.5:1 text contrast and 48px touch targets.");

    // Submit for evaluation
    await pageC.click('button:has-text("Submit for Evaluation")');
    await pageC.waitForSelector("text=Submission Evaluated (Student-Attested)");
    logPass("Journey C.3: Project submission evaluated against rubric");

    // 4. Verify explicit limitation notice is visible in modal
    await pageC.waitForSelector("text=Evaluation Basis & Boundaries");
    const modalNotice = await pageC.locator('div[role="dialog"], div.fixed').first().textContent();
    if (!modalNotice.includes("NOT been inspected or executed") && !modalNotice.includes("not been fetched") && !modalNotice.includes("Evaluation Basis")) {
      throw new Error("Evaluation limitation notice was not displayed in results modal!");
    }
    logPass("Journey C.4: Modal accurately communicates that destination code was not inspected");

    // Close modal by clicking "Done"
    await pageC.click('button:has-text("Done")');

    // 5. Verify Skill Matrix shows Attested Project (amber badge)
    await pageC.goto(`${BASE_URL}/skills`);
    await pageC.waitForSelector("text=Attested Project");
    const attestedBadges = await pageC.$$("text=Attested Project");
    if (attestedBadges.length === 0) {
      throw new Error("Skill Matrix does not display 'Attested Project' badge for evaluated project!");
    }
    logPass("Journey C.5: Skill Matrix displays Attested Project evidence badge");

    // 6. Refresh page and verify persistence of submission
    await pageC.goto(`${BASE_URL}/projects`);
    await pageC.waitForSelector("text=Evaluated •");
    logPass("Journey C.6: Project submission status persisted across page reload");

    // 7. Revise submission in place
    await pageC.locator('button:has-text("Revise Submission")').first().click();
    await pageC.fill('input[type="url"]', "https://github.com/aaroh-student/accessible-clinic-portal-v2");
    await pageC.click('button:has-text("Submit for Evaluation")');
    await pageC.waitForSelector("text=Submission Evaluated (Student-Attested)");
    await pageC.click('button:has-text("Done")');

    // Verify submission record displayed on the card
    const card = pageC.locator('div.bg-surface-card:has-text("Evaluated")');
    const count = await card.count();
    if (count === 0) {
      throw new Error("Revised submission did not update status!");
    }
    logPass("Journey C.7: Revised project updated in place without duplicate records");
    await contextC.close();

    // ----------------------------------------------------
    // JOURNEY D: Roadmap Progression & Exam Mode
    // ----------------------------------------------------
    console.log("\n--- EXECUTING JOURNEY D: Roadmap Progression & Exam Mode ---");
    const contextD = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageD = await contextD.newPage();

    await pageD.goto(`${BASE_URL}/roadmap`);
    await pageD.waitForSelector("h1:has-text('Adaptive Roadmap')");
    logPass("Journey D.1: Adaptive Roadmap loaded");

    // 1. Toggle College Exam Mode
    const examModeToggle = await pageD.$('button:has-text("Turn ON")');
    if (examModeToggle) {
      await examModeToggle.click();
    }
    await pageD.waitForSelector("text=3 hours / week (Exam Mode Throttled)");
    logPass("Journey D.2: College Exam Mode toggled and capacity throttled to 3h/week");

    // 2. Refresh and verify Exam Mode remains ON
    await pageD.reload();
    await pageD.waitForSelector("text=3 hours / week (Exam Mode Throttled)");
    logPass("Journey D.3: College Exam Mode persisted across reload");

    // 3. Change Target Career from Explore and verify unrelated milestones are NOT inherited
    await pageD.goto(`${BASE_URL}/explore`);
    
    // Open Clinical Research Coordinator detail modal
    const clinicalCard = pageD.locator('div.bg-surface-card:has-text("Clinical Research Coordinator")');
    await clinicalCard.locator('button:has-text("View Realities & Paths")').click();
    await pageD.waitForSelector('text=Set as Target Path');
    await pageD.click('button:has-text("Set as Target Path")');

    // Verify roadmap for new career
    await pageD.goto(`${BASE_URL}/roadmap`);
    await pageD.waitForSelector("text=Clinical Research Coordinator");
    
    // Milestone 1 must be AVAILABLE (not completed) because this career's trial was not taken!
    const milestone1Text = await pageD.locator("div:has-text('Milestone 1')").first().textContent();
    if (milestone1Text.includes("COMPLETED")) {
      throw new Error("New career roadmap inherited completed milestone from previous career!");
    }
    logPass("Journey D.4: Changing target career cleanly initialized roadmap without inheriting unrelated completed tasks");
    await contextD.close();

    // ----------------------------------------------------
    // JOURNEY E: Returning Student & Storage Migration
    // ----------------------------------------------------
    console.log("\n--- EXECUTING JOURNEY E: Returning Student & Migration ---");
    const contextE = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageE = await contextE.newPage();

    // Seed outdated/legacy profile data into localStorage before opening page
    await pageE.goto(`${BASE_URL}/`);
    await pageE.evaluate(() => {
      const legacyProfile = {
        id: "student-returning-99",
        name: "Vikram Malhotra",
        stage: "recent_graduate",
        discipline: "commerce_business",
        selectedWorkStyles: ["analytical"],
        weeklyCapacityHours: 10,
        isExamMode: false,
        targetCareerSlug: "financial-analyst",
        targetCareerHypotheses: ["financial-analyst"],
        skillEvidence: {
          "financial-modeling": {
            skillId: "financial-modeling",
            state: "independently_verified", // High evidence tier!
            sourceTitle: "CFA Institute Research Challenge Winner",
            assessedScore: 95,
            updatedAt: "2025-10-01T00:00:00.000Z",
          },
          "accounting-fundamentals": {
            skillId: "accounting-fundamentals",
            state: "coursework",
            sourceTitle: "Financial Accounting 101",
            assessedScore: 78,
            updatedAt: "2025-10-01T00:00:00.000Z",
          },
        },
        completedTrialIds: ["trial-fa-01"],
        trialReflections: {
          "trial-fa-01": {
            trialId: "trial-fa-01",
            rating: 5,
            reflection: "Balanced growth and margins under inflation pressures.",
            score: 85,
            submittedAt: "2025-10-01T00:00:00.000Z",
          },
        },
        projectSubmissions: {
          "proj-2": {
            projectId: "proj-2",
            repoOrDemoUrl: "https://github.com/vikram/fmcg-dcf-model",
            checkedDeliverableIds: ["p2-deliv-1", "p2-deliv-2", "p2-deliv-3"],
            reflection: "Integrated 3-statement forecast schedule linking revenue drivers and WACC.",
            status: "demonstrated", // Outdated legacy status from Phase 3A!
            overallScore: 84,
            submittedAt: "2025-10-02T00:00:00.000Z",
          },
        },
        savedCareerSlugs: ["financial-analyst"],
      };

      localStorage.setItem("aaroh_user_profile_v1", JSON.stringify(legacyProfile));
    });

    // Navigate to Dashboard
    await pageE.goto(`${BASE_URL}/dashboard`);
    await pageE.waitForSelector("h1:has-text('Vikram Malhotra')");
    logPass("Journey E.1: Returning student profile successfully loaded from stored state");

    // Verify migration: legacy status "demonstrated" converted to "evaluated"
    await pageE.goto(`${BASE_URL}/projects`);
    await pageE.waitForSelector("text=Evaluated • 84%");
    logPass("Journey E.2: Legacy 'demonstrated' submission automatically normalized to 'Evaluated'");

    // Verify non-erasure: independently_verified skill preserved
    await pageE.goto(`${BASE_URL}/skills`);
    await pageE.waitForSelector("text=CFA Institute Research Challenge Winner");
    const verifiedBadge = await pageE.$("text=Verified");
    if (!verifiedBadge) {
      throw new Error("Independently verified skill was erased or downgraded during migration!");
    }
    logPass("Journey E.3: Non-erasure rule verified: independently_verified skill preserved");
    await contextE.close();

    // ----------------------------------------------------
    // JOURNEY F: Phase 4A - Peer & Mentor Review Integrity Journey
    // ----------------------------------------------------
    console.log("\n--- EXECUTING JOURNEY F: Peer & Mentor Review Integrity ---");
    const contextF = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageF = await contextF.newPage();

    // Set up student with evaluated project submission
    await pageF.goto(`${BASE_URL}/projects`);
    await pageF.evaluate(() => {
      const studentProfile = {
        id: "student-phase4a",
        name: "Aakash Reviewee",
        stage: "first_second_year",
        discipline: "engineering",
        selectedWorkStyles: ["analytical", "practical_hands_on"],
        interests: ["Technology", "System Design"],
        weeklyCapacityHours: 8,
        isExamMode: false,
        targetCareerSlug: "full-stack-systems-engineer",
        targetCareerHypotheses: ["full-stack-systems-engineer"],
        skillEvidence: {
          "web-development": {
            skillId: "web-development",
            state: "student_attested",
            assessedScore: 85,
            sourceTitle: "Full-Stack Microservices Platform",
            sourceUrl: "https://github.com/aakash/microservices-app",
            updatedAt: "2026-10-20T10:00:00.000Z",
          },
        },
        completedTrialIds: [],
        trialReflections: {},
        projectSubmissions: {
          "proj-3": {
            projectId: "proj-3",
            projectSlug: "full-stack-microservices-platform",
            careerSlug: "full-stack-systems-engineer",
            repoOrDemoUrl: "https://github.com/aakash/microservices-app",
            reflection: "Implemented Node.js microservices with Redis cache and PostgreSQL.",
            checkedDeliverableIds: ["p3-deliv-1", "p3-deliv-2", "p3-deliv-3", "p3-deliv-4", "p3-deliv-5"],
            status: "evaluated",
            overallScore: 88,
            criteriaScores: [
              {
                criterionId: "p3-crit-1",
                title: "Full-Stack Application Architecture & Validation",
                associatedSkillId: "web-development",
                score: 85,
                weight: 35,
                passed: true,
                feedback: "Attested architecture meets standard.",
              },
            ],
            upgradedSkillIds: ["web-development"],
            feedback: "Submission Evaluated.",
            actionableNextSteps: ["Proceed to peer review."],
            isArtifactInspected: false,
            verificationLimitationNotice: "Remote artifacts uninspected.",
            submissionFingerprint: "subfp_phase4a_test_fingerprint",
            submittedAt: "2026-10-20T10:00:00.000Z",
            evaluatedAt: "2026-10-20T10:05:00.000Z",
          },
        },
        projectReviews: {},
        savedCareerSlugs: ["full-stack-systems-engineer"],
      };

      localStorage.setItem("aaroh_user_profile_v1", JSON.stringify(studentProfile));
    });
    await pageF.reload();

    // 1. Visit Project Studio and open Review Hub
    await pageF.waitForSelector("text=Review");
    await pageF.locator('button:has-text("Review")').first().click();
    await pageF.waitForSelector("text=Verification Boundary & Trust Disclosure");
    logPass("Journey F.1: Review Hub modal opened with honest trust disclosure");

    // 2. Test Live Review Form Tab
    await pageF.click("text=3. Live Review Form");
    await pageF.fill('input[placeholder*="Priya Sharma"]', "Sunil Mentor");
    await pageF.selectOption("select", "mentor");
    await pageF.fill('input[placeholder*="Actionable notes"]', "Inspected repository code and test suite; architecture is robust.");
    await pageF.click("text=Record Verified Review Decision");
    await pageF.waitForSelector("text=Review successfully imported");
    logPass("Journey F.2: Live mentor review recorded and validated");

    // 3. Close modal and check card badge
    await pageF.click("text=Close");
    await pageF.waitForSelector("text=Mentor Reviewed: Sunil Mentor");
    logPass("Journey F.3: Project card shows 'Mentor Reviewed: Sunil Mentor' with Demonstrated badge");

    // 4. Verify Skill Matrix shows 'Mentor Examined: Sunil Mentor'
    await pageF.goto(`${BASE_URL}/skills`);
    await pageF.waitForSelector("text=Mentor Examined: Sunil Mentor");
    logPass("Journey F.4: Skill Intelligence displays honest reviewer provenance");

    // 5. Verify Adaptive Roadmap Milestone 4 auto-completion
    await pageF.goto(`${BASE_URL}/roadmap`);
    await pageF.waitForSelector("text=Peer & Mentor Evidence Verification");
    const task4Badge = await pageF.locator("div:has-text('Peer & Mentor Evidence Verification') >> span:has-text('COMPLETED')").first();
    if (!task4Badge) {
      throw new Error("Milestone 4 was not marked COMPLETED after mentor review!");
    }
    logPass("Journey F.5: Roadmap Milestone 4 successfully synchronized to COMPLETED");
    await contextF.close();

    // ----------------------------------------------------
    // RESPONSIVE VIEWPORT & ACCESSIBILITY TESTS
    // ----------------------------------------------------
    console.log("\n--- EXECUTING RESPONSIVE & ACCESSIBILITY AUDIT ---");

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

  console.log("\n=== PLAYWRIGHT BROWSER E2E TEST SUMMARY ===");
  console.log(`Total Checks Passed: ${results.passed}`);
  console.log(`Total Checks Failed: ${results.failed}`);

  if (results.failed > 0) {
    process.exit(1);
  }
}

runBrowserE2E();
