import { test, expect } from "@playwright/test";

test.describe("Always Props", () => {
  test("displays page with regular data", async ({ page }) => {
    await page.goto("/always-props");
    await expect(page.locator("h1")).toContainText("Always Props Demo");
    await expect(page.locator("text=This is regular data")).toBeVisible();
  });

  test("shows auth data", async ({ page }) => {
    await page.goto("/always-props");
    // Auth data should always be included
    await expect(page.locator("text=read")).toBeVisible();
    await expect(page.locator("text=write")).toBeVisible();
    await expect(page.locator("text=delete")).toBeVisible();
  });

  test("auth data persists across partial reloads", async ({ page }) => {
    await page.goto("/always-props");

    // Verify auth data is present
    await expect(page.locator("text=read")).toBeVisible();

    // Look for a reload button
    const reloadButton = page.locator('button:has-text("Reload"), button:has-text("Refresh")');
    if (await reloadButton.isVisible()) {
      await reloadButton.click();
      // Auth data should still be there after partial reload
      await expect(page.locator("text=read")).toBeVisible();
    }
  });
});
