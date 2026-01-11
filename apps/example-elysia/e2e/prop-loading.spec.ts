import { test, expect } from "@playwright/test";

test.describe("prop loading strategies", () => {
  test.describe("dashboard with lazy-loaded analytics (deferred props)", () => {
    test("shows quick data immediately while slow data loads", async ({
      page,
    }) => {
      await page.goto("/deferred");

      await expect(page.getByText("This loads instantly!")).toBeVisible();

      await expect(page.getByTestId("slow-data-loading")).toBeVisible();
      await expect(page.getByTestId("sidebar-loading")).toBeVisible();

      await expect(
        page.getByText("This data took 2 seconds to load")
      ).toBeVisible({
        timeout: 5000,
      });

      await expect(page.getByText("Sidebar Item 1")).toBeVisible({
        timeout: 5000,
      });
      await expect(page.getByText("Sidebar Item 2")).toBeVisible();
      await expect(page.getByText("Sidebar Item 3")).toBeVisible();
    });

    test("deferred props load independently by group", async ({ page }) => {
      await page.goto("/deferred");

      await expect(page.getByText("This loads instantly!")).toBeVisible();

      const sidebarLoaded = page.getByText("Sidebar Item 1");
      const mainLoaded = page.getByText("This data took 2 seconds");

      await expect(sidebarLoaded).toBeVisible({ timeout: 5000 });
      await expect(mainLoaded).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("pricing page with cached configuration (once props)", () => {
    test("once props are cached across navigations", async ({ page }) => {
      await page.goto("/once-props");
      await expect(page.getByTestId("timestamp")).toBeVisible();

      const initialTimestamp = await page
        .getByTestId("timestamp")
        .textContent();
      const initialConfig = await page
        .getByTestId("config-theme")
        .textContent();

      await page.goto("/about");
      await expect(page.getByText("About Us")).toBeVisible();

      await page.goto("/once-props");
      await expect(page.getByTestId("timestamp")).toBeVisible();

      const newTimestamp = await page.getByTestId("timestamp").textContent();
      const newConfig = await page.getByTestId("config-theme").textContent();

      expect(newTimestamp).not.toBe(initialTimestamp);
      expect(newConfig).toBe(initialConfig);
    });

    test("plans data is cached with once modifier", async ({ page }) => {
      await page.goto("/once-props");

      await expect(page.getByText("Basic: $9/mo")).toBeVisible();
      await expect(page.getByText("Pro: $29/mo")).toBeVisible();
      await expect(page.getByText("Enterprise: $99/mo")).toBeVisible();
    });
  });

  test.describe("on-demand heavy data loading (optional props)", () => {
    test("optional prop is not included on initial load", async ({ page }) => {
      await page.goto("/optional-props");

      await expect(page.getByText("This always loads")).toBeVisible();
      await expect(page.getByTestId("heavy-data-placeholder")).toBeVisible();
      await expect(page.getByTestId("heavy-data-content")).not.toBeVisible();
    });

    test("optional prop loads when explicitly requested", async ({ page }) => {
      await page.goto("/optional-props");

      await expect(page.getByTestId("heavy-data-placeholder")).toBeVisible();

      await page.getByRole("button", { name: "Load Heavy Data" }).click();

      await expect(page.getByTestId("heavy-data-content")).toBeVisible({
        timeout: 5000,
      });
      await expect(page.getByText("1000 items loaded")).toBeVisible();
    });
  });

  test.describe("auth state always fresh (always props)", () => {
    test("always props are included even in partial reloads", async ({
      page,
    }) => {
      await page.goto("/always-props");

      await expect(page.getByTestId("regular-data")).toBeVisible();
      await expect(page.getByTestId("auth-data")).toBeVisible();

      const initialAuthTime = await page
        .getByTestId("auth-last-checked")
        .textContent();

      await page.waitForTimeout(1100);
      await page.getByRole("button", { name: "Partial Reload" }).click();
      await page.waitForTimeout(500);

      const newAuthTime = await page
        .getByTestId("auth-last-checked")
        .textContent();
      expect(newAuthTime).not.toBe(initialAuthTime);
    });

    test("permissions are always present", async ({ page }) => {
      await page.goto("/always-props");

      await expect(page.getByText("read")).toBeVisible();
      await expect(page.getByText("write")).toBeVisible();
      await expect(page.getByText("delete")).toBeVisible();
    });
  });
});
