import { test, expect } from "@playwright/test";

test.describe("Production Build", () => {
  // These tests verify the app works correctly
  // In CI, should run against production build

  test("home page loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Welcome");
  });

  test("page navigation works", async ({ page }) => {
    await page.goto("/");

    await page.click('a[href="/about"]');
    await expect(page.locator("h1")).toContainText("About");

    await page.click('a[href="/"]');
    await expect(page.locator("h1")).toContainText("Welcome");
  });

  test("form submission works", async ({ page }) => {
    await page.goto("/contact");

    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('textarea[name="message"]', "This is a test message");

    await page.click('button[type="submit"]');

    // Should redirect to home on success
    await page.waitForURL("/");
  });

  test("all feature pages are accessible", async ({ page }) => {
    const routes = [
      "/",
      "/about",
      "/contact",
      "/users",
      "/posts",
      "/deferred",
      "/once-props",
      "/optional-props",
      "/always-props",
      "/notifications",
      "/conversations",
      "/secure",
      "/error-bags",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible({ timeout: 5000 });
    }
  });

  test("no JavaScript errors in console", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/");
    await page.click('a[href="/about"]');
    await page.click('a[href="/users"]');

    expect(errors.length).toBe(0);
  });

  test("assets load correctly", async ({ page }) => {
    const failedRequests: string[] = [];
    page.on("response", (response) => {
      if (response.status() >= 400 && !response.url().includes("favicon")) {
        failedRequests.push(`${response.status()}: ${response.url()}`);
      }
    });

    await page.goto("/");
    await page.waitForTimeout(1000);

    expect(failedRequests.length).toBe(0);
  });
});
