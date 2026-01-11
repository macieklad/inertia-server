import { test, expect, type Page } from "@playwright/test";

test.describe("mergedProp() - infinite scroll", () => {
  test("initial page load shows 10 posts", async ({ page }) => {
    await visitPostsPage(page);
    await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

    const postCards = getPostCards(page);
    await expect(postCards).toHaveCount(10);

    await expect(page.getByText("Post #10:")).toBeVisible();
    await expect(page.getByText("page 1 of 5")).toBeVisible();
    await expect(getLoadMoreButton(page)).toBeVisible();
  });

  test("clicking Load More appends next page of posts", async ({ page }) => {
    await visitPostsPage(page);
    await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

    const postCards = getPostCards(page);
    await expect(postCards).toHaveCount(10);

    await getLoadMoreButton(page).click();

    await expect(postCards).toHaveCount(20);

    await expect(page.getByText("Post #1:")).toBeVisible();
    await expect(page.getByText("Post #10:")).toBeVisible();
    await expect(page.getByText("Post #11:")).toBeVisible();
    await expect(page.getByText("Post #20:")).toBeVisible();
    await expect(page.getByText("Showing 20 posts")).toBeVisible();
  });

  test("multiple Load More clicks accumulate posts correctly", async ({
    page,
  }) => {
    await visitPostsPage(page);
    await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

    const postCards = getPostCards(page);

    await expect(postCards).toHaveCount(10);

    await getLoadMoreButton(page).click();
    await expect(postCards).toHaveCount(20);

    await getLoadMoreButton(page).click();
    await expect(postCards).toHaveCount(30);

    await expect(page.getByText("Post #1:")).toBeVisible();
    await expect(page.getByText("Post #15:")).toBeVisible();
    await expect(page.getByText("Post #25:")).toBeVisible();
  });

  test("Load More button disappears when all posts loaded", async ({
    page,
  }) => {
    await visitPostsPage(page);
    await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

    const loadMoreButton = getLoadMoreButton(page);
    const postCards = getPostCards(page);

    for (let i = 0; i < 4; i++) {
      await expect(loadMoreButton).toBeVisible();
      await loadMoreButton.click();
      await expect(postCards).toHaveCount((i + 2) * 10);
    }

    await expect(loadMoreButton).not.toBeVisible();
    await expect(page.getByText("You've reached the end!")).toBeVisible();
    await expect(postCards).toHaveCount(50);
    await expect(page.getByText("Showing 50 posts")).toBeVisible();
  });

  test("posts maintain order after multiple loads", async ({ page }) => {
    await visitPostsPage(page);
    await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

    const postCards = getPostCards(page);
    await getLoadMoreButton(page).click();
    await expect(postCards).toHaveCount(20);
    await getLoadMoreButton(page).click();
    await expect(postCards).toHaveCount(30);

    const firstPost = postCards.first();
    const lastPost = postCards.last();

    await expect(firstPost).toContainText("Post #1:");
    await expect(lastPost).toContainText("Post #30:");

    await expect(page.getByText("Post #15:")).toBeVisible();
  });
});

function visitPostsPage(page: Page) {
  return page.goto("/posts", { waitUntil: "networkidle" });
}

function getPostCards(page: Page) {
  return page.locator("[data-testid='card-header']");
}

function getLoadMoreButton(page: Page) {
  return page.getByRole("button", { name: "Load More" });
}
