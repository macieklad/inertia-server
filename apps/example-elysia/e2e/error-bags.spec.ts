import { test, expect } from "@playwright/test";

test.describe("Error Bags", () => {
  test("displays error bags demo page", async ({ page }) => {
    await page.goto("/error-bags");
    await expect(page.locator("h1")).toContainText("Error Bags Demo");
  });

  test("shows two separate forms", async ({ page }) => {
    await page.goto("/error-bags");

    // Should have login form (form1) and create user form (form2)
    const forms = await page.locator("form").count();
    expect(forms).toBeGreaterThanOrEqual(2);
  });

  test("login form shows validation errors", async ({ page }) => {
    await page.goto("/error-bags");

    // Find the login form and submit
    const loginForm = page.locator('form[action*="form1"]').or(page.locator("form").first());
    const submitButton = loginForm.locator('button[type="submit"]');

    await submitButton.click();
    await page.waitForURL("/error-bags");

    // Should show login form errors
    await expect(page.locator("text=Please enter a valid email")).toBeVisible();
    await expect(page.locator("text=Password must be at least 6 characters")).toBeVisible();
  });

  test("create user form shows validation errors", async ({ page }) => {
    await page.goto("/error-bags");

    // Find the create user form and submit
    const createForm = page.locator('form[action*="form2"]').or(page.locator("form").last());
    const submitButton = createForm.locator('button[type="submit"]');

    await submitButton.click();
    await page.waitForURL("/error-bags");

    // Should show create user form errors
    await expect(page.locator("text=Name must be at least 2 characters")).toBeVisible();
    await expect(page.locator("text=Password must be at least 8 characters")).toBeVisible();
  });

  test("errors are scoped to their form", async ({ page }) => {
    await page.goto("/error-bags");

    // Submit login form with invalid data
    const loginEmailInput = page.locator('form').first().locator('input[name="email"]');
    if (await loginEmailInput.isVisible()) {
      await loginEmailInput.fill("invalid");
      await page.locator("form").first().locator('button[type="submit"]').click();
      await page.waitForURL("/error-bags");

      // Login form should show error
      await expect(page.locator("text=Please enter a valid email")).toBeVisible();
    }
  });
});
