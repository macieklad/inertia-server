import { test, expect } from "@playwright/test";

test.describe("Suite 5: History Management", () => {
  test.describe("5.1 Encrypted History for Sensitive Pages", () => {
    test("secure page has encrypted history state", async ({ page }) => {
      await page.goto("/secure");

      await expect(
        page.getByRole("heading", { name: "Secure Page" })
      ).toBeVisible();
      await expect(page.getByTestId("sensitive-data")).toBeVisible();

      const historyState = await page.evaluate(() => {
        return JSON.stringify(window.history.state);
      });

      expect(historyState).not.toContain("sensitive information");
    });

    test("can navigate back to encrypted page", async ({ page }) => {
      await page.goto("/");
      await page.goto("/secure");

      await expect(page.getByTestId("sensitive-data")).toBeVisible();

      await page.goto("/about");
      await expect(
        page.getByRole("heading", { name: "About Us" })
      ).toBeVisible();

      await page.goBack();

      await expect(
        page.getByRole("heading", { name: "Secure Page" })
      ).toBeVisible();
      await expect(page.getByTestId("sensitive-data")).toBeVisible();
    });
  });

  test.describe("5.2 Clear History on Logout", () => {
    test("logout clears history and redirects home", async ({ page }) => {
      await page.goto("/");
      await page.goto("/secure");

      await expect(
        page.getByRole("heading", { name: "Secure Page" })
      ).toBeVisible();

      await page
        .getByRole("button", { name: "Logout & Clear History" })
        .click();

      await expect(page).toHaveURL("/");
      await expect(
        page.getByRole("heading", { name: "Welcome" })
      ).toBeVisible();
    });
  });
});
