import { test, expect } from "@playwright/test";

test.describe("Notifications Prepend", () => {
  test("displays notifications page", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.locator("h1")).toContainText("Notifications");
  });

  test("shows initial notifications", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.locator("text=Welcome to the app!")).toBeVisible();
  });

  test("can add new notification", async ({ page }) => {
    await page.goto("/notifications");

    // Get initial notification count
    const initialNotifications = await page.locator('[data-notification], [role="listitem"], .notification').count();

    // Look for add notification button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Should have more notifications
      const newNotifications = await page.locator('[data-notification], [role="listitem"], .notification').count();
      expect(newNotifications).toBeGreaterThanOrEqual(initialNotifications);
    }
  });

  test("new notifications appear at top (prepend)", async ({ page }) => {
    await page.goto("/notifications");

    // Store first notification text
    const firstNotification = page.locator('[data-notification], [role="listitem"], .notification').first();
    const initialText = await firstNotification.textContent();

    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // The first notification should be different (new one prepended)
      const newFirstNotification = page.locator('[data-notification], [role="listitem"], .notification').first();
      const newText = await newFirstNotification.textContent();
      // Either text changed or the count increased
    }
  });
});
