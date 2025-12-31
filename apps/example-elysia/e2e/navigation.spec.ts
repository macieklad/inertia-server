import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("loads home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Welcome to Inertia Server");
    await expect(page).toHaveTitle(/Inertia/);
  });

  test("navigates to about page via link", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/about"]');
    await expect(page.locator("h1")).toContainText("About Us");
  });

  test("navigates to contact page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/contact"]');
    await expect(page.locator("h1")).toContainText("Contact Us");
  });

  test("feature cards link to correct pages", async ({ page }) => {
    await page.goto("/");

    // Check CRUD card links to users
    const crudCard = page.locator('a[href="/users"]');
    await expect(crudCard).toContainText("CRUD Operations");

    // Check Posts card
    const postsCard = page.locator('a[href="/posts"]');
    await expect(postsCard).toContainText("Infinite Scroll");

    // Check Deferred card
    const deferredCard = page.locator('a[href="/deferred"]');
    await expect(deferredCard).toContainText("Deferred Props");
  });

  test("back/forward browser navigation works", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/about"]');
    await expect(page.locator("h1")).toContainText("About Us");

    await page.goBack();
    await expect(page.locator("h1")).toContainText("Welcome to Inertia Server");

    await page.goForward();
    await expect(page.locator("h1")).toContainText("About Us");
  });

  test("navigation preserves Inertia state (no full page reload)", async ({ page }) => {
    await page.goto("/");

    // Execute script in page context to set a marker
    await page.evaluate(() => {
      (window as unknown as Record<string, boolean>).__inertiaMarker = true;
    });

    // Navigate
    await page.click('a[href="/about"]');
    await expect(page.locator("h1")).toContainText("About Us");

    // Marker should still exist (no full page reload)
    const markerExists = await page.evaluate(() => {
      return (window as unknown as Record<string, boolean>).__inertiaMarker;
    });
    expect(markerExists).toBe(true);
  });
});
