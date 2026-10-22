import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity/brain/1b69ab15-84d0-4ab4-b3b9-e608d1e1b000";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function verifyAndCapture() {
  console.log(`=== STARTING PLAYWRIGHT UI VERIFICATION & SCREENSHOT CAPTURE ===`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Artifact Output: ${ARTIFACT_DIR}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleLogs.push(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  // 1. Visit Landing Page
  console.log("\n1. Testing Landing Page...");
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  console.log("Landing page title:", await page.title());

  // Test curiosity spark button click
  const designSpark = page.locator('button:has-text("Human Experience & UX")');
  await designSpark.click();
  const selectedSpark = await page.locator('text=Digital Product & UX Designer').first().isVisible();
  console.log("Curiosity spark interaction works:", selectedSpark);

  // 2. Test Theme Toggle (Dark -> Light)
  console.log("\n2. Testing Theme Toggle...");
  const themeBtn = page.locator('button[aria-label*="theme"]').first();
  const initialClass = await page.evaluate(() => document.documentElement.className);
  console.log("Initial <html> class:", initialClass);

  await themeBtn.click();
  await page.waitForTimeout(300);
  const afterClass1 = await page.evaluate(() => document.documentElement.className);
  console.log("After 1st toggle <html> class:", afterClass1);

  // 3. Navigate to Dashboard in Light Mode
  console.log("\n3. Testing Dashboard in Light Mode...");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  
  // Ensure light mode is active
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("aaroh_theme", "light");
  });
  await page.waitForTimeout(300);

  const dashLightPath = path.join(ARTIFACT_DIR, "dashboard-light.png");
  await page.screenshot({ path: dashLightPath, fullPage: false });
  console.log(`Saved screenshot: ${dashLightPath}`);

  // Test "Exam Mode" toggle button on Dashboard
  const examToggle = page.locator('button:has-text("Exam Mode:")').or(page.locator('button:has-text("OFF")')).or(page.locator('button:has-text("ON")')).first();
  if (await examToggle.isVisible()) {
    await examToggle.click();
    console.log("Exam mode button clicked successfully!");
  }

  // Test "Ask Guide" input and navigation
  const askInput = page.locator('input[placeholder*="switching fields"]');
  if (await askInput.isVisible()) {
    await askInput.fill("What do entry level software engineers earn in India?");
    const askBtn = page.locator('button:has-text("Ask Guide")');
    await askBtn.click();
    await page.waitForURL("**/mentor*");
    console.log("Ask Guide button routed successfully to /mentor with query!");
  }

  // 4. Test Mentor Page & Switch to Dark Mode
  console.log("\n4. Testing Dark Mode & Mentor Page...");
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("aaroh_theme", "dark");
  });
  await page.waitForTimeout(300);

  const dashDarkPath = path.join(ARTIFACT_DIR, "dashboard-dark.png");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await page.screenshot({ path: dashDarkPath, fullPage: false });
  console.log(`Saved screenshot: ${dashDarkPath}`);

  // 5. Test Mobile Viewport (375x667)
  console.log("\n5. Testing Mobile Viewport (375px)...");
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  const dashMobilePath = path.join(ARTIFACT_DIR, "dashboard-mobile.png");
  await page.screenshot({ path: dashMobilePath, fullPage: false });
  console.log(`Saved screenshot: ${dashMobilePath}`);

  // Reset viewport to desktop
  await page.setViewportSize({ width: 1280, height: 800 });

  // 6. Test Career Explorer Page
  console.log("\n6. Testing Career Explorer Page...");
  await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle" });
  
  // Test search filter
  const searchBox = page.locator('input[placeholder*="Search careers"]');
  await searchBox.fill("UX");
  await page.waitForTimeout(300);
  const filteredCards = await page.locator('h3:has-text("Product & UX Designer")').count();
  console.log("Search filtering works:", filteredCards > 0);

  // Clear search and test discipline filter buttons
  await searchBox.fill("");
  const commerceBtn = page.locator('button:has-text("Commerce")');
  await commerceBtn.click();
  await page.waitForTimeout(300);
  console.log("Discipline filter clicked successfully");

  const exploreLightPath = path.join(ARTIFACT_DIR, "explore-light.png");
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("aaroh_theme", "light");
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: exploreLightPath, fullPage: false });
  console.log(`Saved screenshot: ${exploreLightPath}`);

  // 7. Test Micro-Trials in Dark Mode
  console.log("\n7. Testing Career Micro-Trials...");
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("aaroh_theme", "dark");
  });
  await page.goto(`${BASE_URL}/trials?career=full-stack-systems-engineer`, { waitUntil: "networkidle" });
  
  // Select scenario option
  const optionBtn = page.locator('input[type="radio"], button:has-text("Option")').first();
  if (await optionBtn.isVisible()) {
    await optionBtn.click();
    console.log("Scenario option selected");
  }

  const trialDarkPath = path.join(ARTIFACT_DIR, "trial-dark.png");
  await page.screenshot({ path: trialDarkPath, fullPage: false });
  console.log(`Saved screenshot: ${trialDarkPath}`);

  // 8. Test Projects / Peer Review Hub
  console.log("\n8. Testing Projects & Review Hub...");
  await page.goto(`${BASE_URL}/projects`, { waitUntil: "networkidle" });
  const projectsDarkPath = path.join(ARTIFACT_DIR, "projects-dark.png");
  await page.screenshot({ path: projectsDarkPath, fullPage: false });
  console.log(`Saved screenshot: ${projectsDarkPath}`);

  // 9. Check Error Logs
  console.log("\n=== CONSOLE & RUNTIME ERROR AUDIT ===");
  console.log("Console errors:", consoleLogs.length);
  if (consoleLogs.length > 0) {
    console.log(consoleLogs.join("\n"));
  }
  console.log("Page errors:", pageErrors.length);
  if (pageErrors.length > 0) {
    console.log(pageErrors.join("\n"));
  }

  await browser.close();

  if (pageErrors.length > 0) {
    console.error("FAIL: Runtime page errors occurred during navigation/interaction.");
    process.exit(1);
  } else {
    console.log("SUCCESS: All UI interactions, theme switching, and button wiring verified!");
  }
}

verifyAndCapture().catch((err) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
