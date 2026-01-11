import { test, expect } from "@playwright/test";

test.describe("Suite 7: Shared Data", () => {
  test.describe("7.1 App-Wide Shared Data", () => {
    test("app name is available on all pages", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("link", { name: /Inertia Server/ })).toBeVisible();

      await page.goto("/about");
      await expect(page.getByRole("link", { name: /Inertia Server/ })).toBeVisible();

      await page.goto("/users");
      await expect(page.getByRole("link", { name: /Inertia Server/ })).toBeVisible();

      await page.goto("/contact");
      await expect(page.getByRole("link", { name: /Inertia Server/ })).toBeVisible();
    });

    test("shared data persists across navigation", async ({ page }) => {
      await page.goto("/");

      const appNameLocator = page.locator('[data-testid="app-name"]');
      if (await appNameLocator.isVisible()) {
        const appName = await appNameLocator.textContent();

        await page.goto("/about");
        await expect(appNameLocator).toHaveText(appName!);

        await page.goto("/users");
        await expect(appNameLocator).toHaveText(appName!);
      }
    });
  });
});

test.describe("Suite 8: Partial Reloads", () => {
  test.describe("8.1 Refresh Single Section", () => {
    test("partial reload updates only specified props", async ({ page }) => {
      await page.goto("/always-props");

      await expect(page.getByTestId("regular-data")).toBeVisible();
      await expect(page.getByTestId("auth-data")).toBeVisible();

      const initialTitle = await page.getByTestId("page-title").textContent();
      const initialRegularData = await page.getByTestId("regular-data").textContent();

      await page.waitForTimeout(1100);
      await page.getByRole("button", { name: "Partial Reload" }).click();
      await page.waitForTimeout(500);

      const newRegularData = await page.getByTestId("regular-data").textContent();
      const newTitle = await page.getByTestId("page-title").textContent();

      expect(newRegularData).not.toBe(initialRegularData);
      expect(newTitle).toBe(initialTitle);
    });

    test("always props are refreshed even when not in only list", async ({ page }) => {
      await page.goto("/always-props");

      const initialAuthTime = await page.getByTestId("auth-last-checked").textContent();

      await page.waitForTimeout(1100);
      await page.getByRole("button", { name: "Partial Reload" }).click();
      await page.waitForTimeout(500);

      const newAuthTime = await page.getByTestId("auth-last-checked").textContent();

      expect(newAuthTime).not.toBe(initialAuthTime);
    });
  });

  test.describe("8.2 Prop Merging with Partial Reloads", () => {
    test("merged props accumulate across partial reloads", async ({ page }) => {
      await page.goto("/posts");

      await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

      const initialCount = await page.locator("[data-testid='card-header']").count();
      expect(initialCount).toBe(10);

      await page.getByRole("button", { name: "Load More" }).click();

      await expect(page.locator("[data-testid='card-header']")).toHaveCount(20);

      await expect(page.getByText("Post #1:")).toBeVisible();
      await expect(page.getByText("Post #11:")).toBeVisible();
    });
  });
});
