import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity/brain/1b69ab15-84d0-4ab4-b3b9-e608d1e1b000";
const BASE_URL = process.env.BASE_URL || "http://localhost:3005";

async function captureCinematicLanding() {
  console.log(`=== CAPTURING CINEMATIC LANDING SCREENSHOTS ===`);
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Dark Mode (Full page & hero)
  const contextDark = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const pageDark = await contextDark.newPage();
  await pageDark.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await pageDark.evaluate(() => {
    document.documentElement.classList.add("dark");
  });
  await pageDark.waitForTimeout(1000); // Wait for Three.js render loop

  const heroDarkPath = path.join(ARTIFACT_DIR, "cinematic-landing-hero-dark.png");
  await pageDark.screenshot({ path: heroDarkPath });
  console.log(`Saved: ${heroDarkPath}`);

  // Scroll to Constellation Explorer
  const constellSection = pageDark.locator("#constellations");
  await constellSection.scrollIntoViewIfNeeded();
  await pageDark.waitForTimeout(800);
  const constellPath = path.join(ARTIFACT_DIR, "cinematic-constellation-explorer.png");
  await pageDark.screenshot({ path: constellPath });
  console.log(`Saved: ${constellPath}`);

  // Scroll to Live Micro-Trial Simulation and select option
  const trialSection = pageDark.locator("#simulation");
  await trialSection.scrollIntoViewIfNeeded();
  await pageDark.waitForTimeout(600);
  const optionBtn = trialSection.locator('button:has-text("Visual Accessibility")').first();
  if (await optionBtn.isVisible()) {
    await optionBtn.click();
    await pageDark.waitForTimeout(500);
  }
  const trialPath = path.join(ARTIFACT_DIR, "cinematic-live-trial-preview.png");
  await pageDark.screenshot({ path: trialPath });
  console.log(`Saved: ${trialPath}`);

  // 2. Desktop Light Mode
  const contextLight = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const pageLight = await contextLight.newPage();
  await pageLight.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await pageLight.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });
  await pageLight.waitForTimeout(1000);

  const heroLightPath = path.join(ARTIFACT_DIR, "cinematic-landing-hero-light.png");
  await pageLight.screenshot({ path: heroLightPath });
  console.log(`Saved: ${heroLightPath}`);

  // 3. Mobile Viewport (375px x 812px iPhone style)
  const contextMobile = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await pageMobile.evaluate(() => {
    document.documentElement.classList.add("dark");
  });
  await pageMobile.waitForTimeout(1000);

  const mobilePath = path.join(ARTIFACT_DIR, "cinematic-landing-mobile.png");
  await pageMobile.screenshot({ path: mobilePath });
  console.log(`Saved: ${mobilePath}`);

  await browser.close();
  console.log("=== SCREENSHOT CAPTURE COMPLETE ===");
}

captureCinematicLanding().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
