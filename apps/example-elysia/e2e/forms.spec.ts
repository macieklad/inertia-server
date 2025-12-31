import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test("displays contact form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText("Contact Us");
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test("shows validation errors for empty form", async ({ page }) => {
    await page.goto("/contact");

    await page.click('button[type="submit"]');

    // Wait for redirect back with errors
    await page.waitForURL("/contact");

    await expect(page.locator("text=Name must be at least 2 characters")).toBeVisible();
    await expect(page.locator("text=Please enter a valid email address")).toBeVisible();
    await expect(page.locator("text=Message must be at least 10 characters")).toBeVisible();
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/contact");

    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('textarea[name="message"]', "This is a valid message");

    await page.click('button[type="submit"]');
    await page.waitForURL("/contact");

    await expect(page.locator("text=Please enter a valid email address")).toBeVisible();
  });

  test("shows validation error for short name", async ({ page }) => {
    await page.goto("/contact");

    await page.fill('input[name="name"]', "J");
    await page.fill('input[name="email"]', "john@example.com");
    await page.fill('textarea[name="message"]', "This is a valid message");

    await page.click('button[type="submit"]');
    await page.waitForURL("/contact");

    await expect(page.locator("text=Name must be at least 2 characters")).toBeVisible();
  });

  test("shows validation error for short message", async ({ page }) => {
    await page.goto("/contact");

    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "john@example.com");
    await page.fill('textarea[name="message"]', "Short");

    await page.click('button[type="submit"]');
    await page.waitForURL("/contact");

    await expect(page.locator("text=Message must be at least 10 characters")).toBeVisible();
  });

  test("redirects to home on successful submission", async ({ page }) => {
    await page.goto("/contact");

    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "john@example.com");
    await page.fill('textarea[name="message"]', "This is a valid message that is long enough");

    await page.click('button[type="submit"]');

    await page.waitForURL("/");
    await expect(page.locator("h1")).toContainText("Welcome to Inertia Server");
  });
});
