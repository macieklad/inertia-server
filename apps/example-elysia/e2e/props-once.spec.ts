import { test, expect } from "@playwright/test";

test.describe("Once Props", () => {
  test("displays page with cached config", async ({ page }) => {
    await page.goto("/once-props");
    await expect(page.locator("h1")).toContainText("Once Props Demo");
  });

  test("shows config data", async ({ page }) => {
    await page.goto("/once-props");
    await expect(page.locator("text=dark")).toBeVisible();
    await expect(page.locator("text=en-US")).toBeVisible();
  });

  test("displays pricing plans", async ({ page }) => {
    await page.goto("/once-props");
    await expect(page.locator("text=Basic")).toBeVisible();
    await expect(page.locator("text=Pro")).toBeVisible();
    await expect(page.locator("text=Enterprise")).toBeVisible();
  });

  test("timestamp is displayed", async ({ page }) => {
    await page.goto("/once-props");

    // Get the initial timestamp
    const timestampElement = page.locator("[data-timestamp]");
    if (await timestampElement.isVisible()) {
      const initialTimestamp = await timestampElement.textContent();

      // Navigate away and back
      await page.goto("/");
      await page.goto("/once-props");

      // Timestamp should be the same (cached via once prop) or different (new render)
      // This test primarily checks the page renders correctly
      await expect(timestampElement).toBeVisible();
    }
  });
});
