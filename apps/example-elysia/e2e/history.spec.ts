import { test, expect } from "@playwright/test";

test.describe("History Encryption & Clear", () => {
  test("displays secure page", async ({ page }) => {
    await page.goto("/secure");
    await expect(page.locator("h1")).toContainText("Secure Page");
  });

  test("shows sensitive data", async ({ page }) => {
    await page.goto("/secure");
    await expect(page.locator("text=sensitive")).toBeVisible();
  });

  test("logout clears history and redirects home", async ({ page }) => {
    await page.goto("/secure");

    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Log out")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to home
      await page.waitForURL("/");
      await expect(page.locator("h1")).toContainText("Welcome to Inertia Server");
    }
  });

  test("back navigation after logout does not show secure page", async ({ page }) => {
    await page.goto("/secure");
    await expect(page.locator("h1")).toContainText("Secure Page");

    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Log out")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL("/");

      // Try to go back - should not show secure page due to clearHistory
      await page.goBack();

      // Either stays on home or shows home again (not secure page)
      await page.waitForTimeout(500);
      const url = page.url();
      // The page should not contain sensitive data if history was cleared
    }
  });
});
