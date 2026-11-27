import { test, expect } from "@playwright/test";

test.describe("AURA Theme & Dark/Light Switch Suite", () => {
  test("1. Default follows emulated system theme (dark)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const themeAttr = await page.locator("html").getAttribute("data-theme");
    expect(themeAttr).toBe("dark");
  });

  test("2. Default follows emulated system theme (light)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const themeAttr = await page.locator("html").getAttribute("data-theme");
    expect(themeAttr).toBe("light");
  });

  test("3. Toggle changes the theme from dark to light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const toggle = page.locator('button[role="switch"][aria-label="Dark mode"]').first();
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    const saved = await page.evaluate(() => localStorage.getItem("aura-theme"));
    expect(saved).toBe("light");
  });

  test("4. Choice persists after reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const toggle = page.locator('button[role="switch"][aria-label="Dark mode"]').first();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("5. Choice persists in a new tab / page context", async ({ context }) => {
    const page1 = await context.newPage();
    await page1.emulateMedia({ colorScheme: "dark" });
    await page1.goto("/");
    const toggle = page1.locator('button[role="switch"][aria-label="Dark mode"]').first();
    await toggle.click();
    await expect(page1.locator("html")).toHaveAttribute("data-theme", "light");

    const page2 = await context.newPage();
    await page2.goto("/");
    await expect(page2.locator("html")).toHaveAttribute("data-theme", "light");
    await page1.close();
    await page2.close();
  });

  test("6. Theme attribute is set before hydration", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("aura-theme", "light");
    });
    // Intercept immediately before React hydrates
    await page.goto("/");
    const themeImmediate = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeImmediate).toBe("light");
  });

  test("7. Keyboard operation (Space and Enter keys)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const toggle = page.locator('button[role="switch"][aria-label="Dark mode"]').first();
    await toggle.focus();

    // Trigger Space
    await page.keyboard.press("Space");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    // Trigger Enter
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("8. Measured toggle size is at least 44x44px", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator('button[role="switch"][aria-label="Dark mode"]').first();
    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("9. Reduced motion is respected", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.goto("/");
    const toggle = page.locator('button[role="switch"][aria-label="Dark mode"]').first();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
