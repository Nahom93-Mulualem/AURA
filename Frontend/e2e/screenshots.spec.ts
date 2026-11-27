import { test as it } from "@playwright/test";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR = "C:/Users/HP/.gemini/antigravity/brain/a29d051e-ddcb-4142-827d-508a98cabdb9/screenshots";

it.describe("Screenshot capture suite", () => {
  it.setTimeout(60000);

  it.beforeAll(() => {
    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }
  });

  const viewports = [
    { name: "375px", width: 375, height: 667 },
    { name: "1280px", width: 1280, height: 800 },
  ];

  const themes = ["dark", "light"] as const;

  for (const theme of themes) {
    for (const vp of viewports) {
      it(`Capture ${theme} ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.emulateMedia({ colorScheme: theme });
        await page.addInitScript((t) => {
          localStorage.setItem("aura-theme", t);
        }, theme);

        // 1. Home
        await page.goto("/");
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `home_${theme}_${vp.name}.png`), fullPage: false });

        if (vp.name === "1280px") {
          const toggle = page.locator('button[role="switch"][aria-label="Dark mode"]').first();
          if (await toggle.isVisible()) {
            await toggle.screenshot({ path: path.join(ARTIFACTS_DIR, `toggle_zoomed_${theme}.png`) });
          }
        }

        // 2. Collection Bottle
        await page.goto("/collection");
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `collection_bottle_${theme}_${vp.name}.png`), fullPage: false });

        // Collection Description
        const descToggle = page.locator('button[aria-label="View fragrance description"]').first();
        if (await descToggle.isVisible()) {
          await descToggle.click();
          await page.waitForTimeout(400);
        }
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `collection_description_${theme}_${vp.name}.png`), fullPage: false });

        // 3. Help Modal
        const helpBtn = page.locator('button:has-text("Guide"), button:has-text("Types"), button[aria-label="Open fragrance types guide"]').first();
        if (await helpBtn.isVisible()) {
          await helpBtn.click();
          await page.waitForTimeout(400);
          await page.screenshot({ path: path.join(ARTIFACTS_DIR, `help_modal_${theme}_${vp.name}.png`), fullPage: false });
        }

        // 4. Detail
        await page.goto("/perfumes/rose-%C3%A9th%C3%A9r%C3%A9e");
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `detail_${theme}_${vp.name}.png`), fullPage: false });

        // 5. Admin Login
        await page.goto("/admin/login");
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `admin_login_${theme}_${vp.name}.png`), fullPage: false });

        // 6. Admin Dashboard
        await page.goto("/admin");
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `admin_dashboard_${theme}_${vp.name}.png`), fullPage: false });

        // 7. 404
        await page.goto("/non-existent-page-aura");
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `not_found_${theme}_${vp.name}.png`), fullPage: false });
      });
    }
  }

  // Hero overlap verification
  const heroViewports = [
    { name: "1280x600", width: 1280, height: 600 },
    { name: "1366x768", width: 1366, height: 768 },
    { name: "1280x800", width: 1280, height: 800 },
    { name: "375x667", width: 375, height: 667 },
  ];

  for (const vp of heroViewports) {
    it(`Hero overlap ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/");
      await page.waitForTimeout(600);

      const navBox = await page.locator("header").boundingBox();
      const headingBox = await page.locator("h1").boundingBox();
      const cardBox = await page.locator("section div.aspect-\\[4\\/5\\]").first().boundingBox();

      const navY = navBox?.y ?? 0;
      const navH = navBox?.height ?? 0;
      const headY = headingBox?.y ?? 0;
      const cY = cardBox?.y ?? 0;
      console.log(`Hero Viewport ${vp.name}: NavBottom=${navY + navH}, HeadingTop=${headY}, CardTop=${cY}`);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, `hero_overlap_${vp.name}.png`), fullPage: false });
    });
  }
});
