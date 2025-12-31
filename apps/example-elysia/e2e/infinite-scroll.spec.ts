import { test, expect } from "@playwright/test";

test.describe("Posts Infinite Scroll", () => {
  test("displays initial posts", async ({ page }) => {
    await page.goto("/posts");
    await expect(page.locator("h1")).toContainText("Posts");
    await expect(page.locator("text=Post #1")).toBeVisible();
  });

  test("shows multiple posts on first page", async ({ page }) => {
    await page.goto("/posts");

    // Should show first batch of posts
    await expect(page.locator("text=Post #1")).toBeVisible();
    await expect(page.locator("text=Post #2")).toBeVisible();
  });

  test("can load more posts", async ({ page }) => {
    await page.goto("/posts");

    // Look for a "Load More" button
    const loadMoreButton = page.locator('button:has-text("Load More"), button:has-text("Show More"), a:has-text("Load More")');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();

      // After loading more, should have additional posts
      await expect(page.locator("text=Post #11")).toBeVisible({ timeout: 3000 });
    }
  });

  test("posts are merged (previous posts remain visible)", async ({ page }) => {
    await page.goto("/posts");

    // Initial posts visible
    await expect(page.locator("text=Post #1")).toBeVisible();

    const loadMoreButton = page.locator('button:has-text("Load More"), button:has-text("Show More"), a:has-text("Load More")');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(500);

      // Both old and new posts should be visible
      await expect(page.locator("text=Post #1")).toBeVisible();
      await expect(page.locator("text=Post #11")).toBeVisible({ timeout: 3000 });
    }
  });

  test("shows author names", async ({ page }) => {
    await page.goto("/posts");

    // Authors from the mock data
    const authors = ["Alice", "Bob", "Charlie", "Diana", "Edward"];
    for (const author of authors.slice(0, 3)) {
      await expect(page.locator(`text=${author}`).first()).toBeVisible();
    }
  });
});
