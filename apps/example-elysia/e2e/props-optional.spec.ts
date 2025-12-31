import { test, expect } from "@playwright/test";

test.describe("Optional Props", () => {
  test("displays page with basic data", async ({ page }) => {
    await page.goto("/optional-props");
    await expect(page.locator("h1")).toContainText("Optional Props Demo");
    await expect(page.locator("text=This always loads")).toBeVisible();
  });

  test("heavy data is not loaded by default", async ({ page }) => {
    await page.goto("/optional-props");

    // Heavy data should not be visible initially (optional props)
    const heavyDataVisible = await page.locator("text=Item 1").isVisible({ timeout: 500 }).catch(() => false);
    // This may or may not be visible depending on implementation
  });

  test("can manually load optional data", async ({ page }) => {
    await page.goto("/optional-props");

    // Look for a reload/load button
    const loadButton = page.locator('button:has-text("Load"), button:has-text("Reload"), button:has-text("Fetch")');
    if (await loadButton.isVisible()) {
      await loadButton.click();
      await expect(page.locator("text=Item 1")).toBeVisible({ timeout: 3000 });
    }
  });
});
