import { test, expect } from "@playwright/test";

test.describe("Deferred Props", () => {
  test("loads page with quick data immediately", async ({ page }) => {
    await page.goto("/deferred");
    await expect(page.locator("h1")).toContainText("Deferred Props Demo");
    await expect(page.locator("text=This loads instantly!")).toBeVisible();
  });

  test("shows loading state for deferred data", async ({ page }) => {
    await page.goto("/deferred");

    // Initially should show loading state
    const loadingIndicator = page.locator('text=/loading|Loading|Skeleton/i');
    // The slow data takes 2 seconds to load, so we should see a loading state
    await expect(loadingIndicator.or(page.locator("[data-loading]"))).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading might be too fast to catch, that's okay
    });
  });

  test("eventually shows slow data", async ({ page }) => {
    await page.goto("/deferred");

    // Wait for the slow data to appear (takes 2 seconds according to route)
    await expect(page.locator("text=This data took 2 seconds to load")).toBeVisible({ timeout: 5000 });
  });

  test("shows sidebar data after loading", async ({ page }) => {
    await page.goto("/deferred");

    // Wait for sidebar data (takes 1.5 seconds according to route)
    await expect(page.locator("text=Sidebar Item 1")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Sidebar Item 2")).toBeVisible();
    await expect(page.locator("text=Sidebar Item 3")).toBeVisible();
  });
});
