import { test, expect } from "@playwright/test";

test.describe("Users CRUD", () => {
  test.describe("Index Page", () => {
    test("displays users list", async ({ page }) => {
      await page.goto("/users");
      await expect(page.locator("h1")).toContainText("Users");
      await expect(page.locator("text=John Doe")).toBeVisible();
      await expect(page.locator("text=Jane Smith")).toBeVisible();
    });

    test("shows pagination controls", async ({ page }) => {
      await page.goto("/users");
      // Check for page navigation
      await expect(page.locator("text=Page 1")).toBeVisible();
    });

    test("navigates to next page", async ({ page }) => {
      await page.goto("/users");

      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForURL(/page=2/);
        await expect(page.locator("text=Page 2")).toBeVisible();
      }
    });

    test("filters users by search", async ({ page }) => {
      await page.goto("/users");

      const searchInput = page.locator('input[name="search"], input[placeholder*="Search"]');
      await searchInput.fill("Alice");

      // Trigger search (press Enter or wait for debounce)
      await searchInput.press("Enter");
      await page.waitForURL(/search=Alice/);

      await expect(page.locator("text=Alice Brown")).toBeVisible();
      await expect(page.locator("text=John Doe")).not.toBeVisible();
    });
  });

  test.describe("Create User", () => {
    test("displays create form", async ({ page }) => {
      await page.goto("/users/create");
      await expect(page.locator("h1")).toContainText("Create User");
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    test("shows validation errors for empty form", async ({ page }) => {
      await page.goto("/users/create");

      await page.click('button[type="submit"]');
      await page.waitForURL("/users/create");

      await expect(page.locator("text=Name must be at least 2 characters")).toBeVisible();
      await expect(page.locator("text=Please enter a valid email address")).toBeVisible();
      await expect(page.locator("text=Password must be at least 8 characters")).toBeVisible();
    });

    test("redirects to users list on successful creation", async ({ page }) => {
      await page.goto("/users/create");

      await page.fill('input[name="name"]', "New User");
      await page.fill('input[name="email"]', "newuser@example.com");
      await page.fill('input[name="password"]', "password123");

      await page.click('button[type="submit"]');

      await page.waitForURL("/users");
      await expect(page.locator("h1")).toContainText("Users");
    });
  });

  test.describe("Edit User", () => {
    test("displays edit form with pre-filled data", async ({ page }) => {
      await page.goto("/users/1/edit");
      await expect(page.locator("h1")).toContainText("Edit");

      const nameInput = page.locator('input[name="name"]');
      await expect(nameInput).toHaveValue("John Doe");

      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toHaveValue("john@example.com");
    });

    test("shows validation errors on invalid update", async ({ page }) => {
      await page.goto("/users/1/edit");

      await page.fill('input[name="name"]', "J");
      await page.click('button[type="submit"]');

      await page.waitForURL("/users/1/edit");
      await expect(page.locator("text=Name must be at least 2 characters")).toBeVisible();
    });

    test("redirects to users list on successful update", async ({ page }) => {
      await page.goto("/users/1/edit");

      await page.fill('input[name="name"]', "John Updated");
      await page.click('button[type="submit"]');

      await page.waitForURL("/users");
      await expect(page.locator("h1")).toContainText("Users");
    });
  });
});
