import { test as it, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const VERIFY_DIR = "C:/Users/HP/.gemini/antigravity/brain/a29d051e-ddcb-4142-827d-508a98cabdb9/screenshots/verification";

it.describe("Mobile & Desktop Form Geometry Suite (Both Themes)", () => {
  it.setTimeout(120000);

  it.beforeAll(() => {
    if (!fs.existsSync(VERIFY_DIR)) {
      fs.mkdirSync(VERIFY_DIR, { recursive: true });
    }
  });

  const viewports = [
    { name: "360x640", width: 360, height: 640 },
    { name: "375x667", width: 375, height: 667 },
    { name: "390x844", width: 390, height: 844 },
    { name: "412x915", width: 412, height: 915 },
    { name: "768x1024", width: 768, height: 1024 },
    { name: "1366x768", width: 1366, height: 768 },
    { name: "667x375-landscape", width: 667, height: 375 },
  ];

  const themes = ["dark", "light"] as const;

  const mockPerfumeList = [
    {
      id: "perfume-test-1",
      name: "Oud Royale",
      slug: "oud-royale",
      subtitle: "Smoky Cambodian Oud & Vanilla",
      tagline: "Scents that stay in memory.",
      description: "A majestic evening blend.",
      shortDescription: "A luxurious extrait de parfum.",
      price: 12500,
      sizeMl: "100ml",
      category: "unisex",
      fragranceType: "extrait_de_parfum",
      status: "available",
      featured: true,
      notes: {
        top: ["Saffron", "Bergamot"],
        heart: ["Oud", "Rose"],
        base: ["Vanilla", "Amber"],
      },
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
      ],
      longevity: "Long-lasting",
      bestSeason: "Fall & Winter",
    },
  ];

  for (const theme of themes) {
    for (const vp of viewports) {
      it(`Measure Add Form at ${vp.name} [${theme}]`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.emulateMedia({ colorScheme: theme });

        await page.route("**/api/v1/admin/me", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ id: "admin-1", email: "admin@aura.et" }),
          });
        });
        await page.route("**/api/v1/perfumes**", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: mockPerfumeList }),
          });
        });

        await page.addInitScript(
          ({ t }) => {
            localStorage.setItem("aura_admin_token", "mock-token-12345");
            localStorage.setItem("aura-theme", t);
          },
          { t: theme }
        );

        await page.goto("/admin");
        await page.waitForTimeout(400);

        // Open "Add Fragrance"
        const addBtn = page.locator('button:has-text("Add Fragrance")').first();
        await expect(addBtn).toBeVisible({ timeout: 5000 });
        await addBtn.click();
        await page.waitForTimeout(300);

        const dialogTitle = page.locator("#dialog-title");
        await expect(dialogTitle).toBeVisible();

        const titleBox = await dialogTitle.boundingBox();
        const saveBtn = page.locator('button:has-text("Publish to Boutique")').first();
        const saveBox = await saveBtn.boundingBox();
        const dialogBox = await page.locator('div[role="dialog"] > div').first().boundingBox();

        const titleTop = titleBox ? titleBox.y : -1;
        const saveBottom = saveBox ? saveBox.y + saveBox.height : -1;
        const dialogTop = dialogBox ? dialogBox.y : -1;
        const dialogBottom = dialogBox ? dialogBox.y + dialogBox.height : -1;

        console.log(
          `[DATA_POINT_ADD] Theme=${theme} | VP=${vp.name} | ViewportHeight=${vp.height} | TitleTop=${titleTop.toFixed(
            1
          )} | SaveBottom=${saveBottom.toFixed(1)} | DialogTop=${dialogTop.toFixed(
            1
          )} | DialogBottom=${dialogBottom.toFixed(1)}`
        );

        expect(titleTop).toBeGreaterThanOrEqual(0);
        expect(saveBottom).toBeLessThanOrEqual(vp.height + 1); // within viewport boundary

        await page.screenshot({
          path: path.join(VERIFY_DIR, `add_form_${vp.name}_${theme}.png`),
          fullPage: false,
        });

        // Close form
        const cancelBtn = page.locator('button:has-text("Cancel")').first();
        await cancelBtn.click();
      });

      // Also verify Edit Form shares the exact same geometry and behavior
      if (vp.name === "1366x768" || vp.name === "375x667") {
        it(`Measure Edit Form at ${vp.name} [${theme}]`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.emulateMedia({ colorScheme: theme });

          await page.route("**/api/v1/admin/me", async (route) => {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({ id: "admin-1", email: "admin@aura.et" }),
            });
          });
          await page.route("**/api/v1/perfumes**", async (route) => {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({ data: mockPerfumeList }),
            });
          });

          await page.addInitScript(
            ({ t }) => {
              localStorage.setItem("aura_admin_token", "mock-token-12345");
              localStorage.setItem("aura-theme", t);
            },
            { t: theme }
          );

          await page.goto("/admin");
          await page.waitForTimeout(400);

          // Click Edit button on the mock perfume (matches visible button on mobile cards or desktop table)
          const editBtn = page.locator('button[title*="Edit"]:visible').first();
          await expect(editBtn).toBeVisible({ timeout: 5000 });
          await editBtn.click();
          await page.waitForTimeout(300);

          const dialogTitle = page.locator("#dialog-title");
          await expect(dialogTitle).toContainText("Edit: Oud Royale");

          const titleBox = await dialogTitle.boundingBox();
          const saveBtn = page.locator('button:has-text("Save Changes")').first();
          const saveBox = await saveBtn.boundingBox();
          const dialogBox = await page.locator('div[role="dialog"] > div').first().boundingBox();

          const titleTop = titleBox ? titleBox.y : -1;
          const saveBottom = saveBox ? saveBox.y + saveBox.height : -1;

          console.log(
            `[DATA_POINT_EDIT] Theme=${theme} | VP=${vp.name} | ViewportHeight=${vp.height} | TitleTop=${titleTop.toFixed(
              1
            )} | SaveBottom=${saveBottom.toFixed(1)}`
          );

          expect(titleTop).toBeGreaterThanOrEqual(0);
          expect(saveBottom).toBeLessThanOrEqual(vp.height + 1);

          await page.screenshot({
            path: path.join(VERIFY_DIR, `edit_form_${vp.name}_${theme}.png`),
            fullPage: false,
          });

          const cancelBtn = page.locator('button:has-text("Cancel")').first();
          await cancelBtn.click();
        });
      }
    }
  }

  // Footer touch target verification
  it("Verify Footer Collection link touch target >= 44px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const footerCollectionLink = page.locator('footer a:has-text("Perfume Collection")').first();
    await footerCollectionLink.scrollIntoViewIfNeeded();
    const box = await footerCollectionLink.boundingBox();
    console.log(`Footer Collection Link Box: ${box?.width}x${box?.height}`);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
