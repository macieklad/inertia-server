import { expect, type Page, test } from "@playwright/test";

test.describe("mergedProp() - infinite scroll", () => {
	test("initial page load shows 10 posts", async ({ page }) => {
		await visitPostsPage(page);
		await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

		const postCards = getPostCards(page);
		await expect(postCards).toHaveCount(10);

		await expect(page.getByText("Post #10:")).toBeVisible();
		await expect(page.getByText("Showing 10 posts")).toBeVisible();
	});

	test("scrolling to bottom loads more posts", async ({ page }) => {
		await visitPostsPage(page);
		await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

		const postCards = getPostCards(page);
		await expect(postCards).toHaveCount(10);

		await scrollToBottom(page);
		await expect(postCards).toHaveCount(20, { timeout: 10000 });

		await expect(page.getByText("Post #1:")).toBeVisible();
		await expect(page.getByText("Post #11:")).toBeVisible();
		await expect(page.getByText("Showing 20 posts")).toBeVisible();
	});

	test("multiple scrolls accumulate posts correctly", async ({ page }) => {
		await visitPostsPage(page);
		await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

		const postCards = getPostCards(page);
		await expect(postCards).toHaveCount(10);

		await scrollToBottom(page);
		await expect(postCards).toHaveCount(20, { timeout: 10000 });

		await scrollToBottom(page);
		await expect(postCards).toHaveCount(30, { timeout: 10000 });

		await expect(page.getByText("Post #1:")).toBeVisible();
		await expect(page.getByText("Post #15:")).toBeVisible();
		await expect(page.getByText("Post #25:")).toBeVisible();
	});

	test("shows end message when all posts loaded", async ({ page }) => {
		await visitPostsPage(page);
		await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

		const postCards = getPostCards(page);

		for (let i = 0; i < 4; i++) {
			await scrollToBottom(page);
			await expect(postCards).toHaveCount((i + 2) * 10, { timeout: 10000 });
		}

		await expect(postCards).toHaveCount(50);
		await expect(page.getByText("Showing 50 posts")).toBeVisible();
		await expect(page.getByText("You've reached the end!")).toBeVisible({
			timeout: 10000,
		});
	});

	test("posts maintain order after multiple loads", async ({ page }) => {
		await visitPostsPage(page);
		await expect(page.getByText("Post #1:")).toBeVisible({ timeout: 30000 });

		const postCards = getPostCards(page);

		await scrollToBottom(page);
		await expect(postCards).toHaveCount(20, { timeout: 10000 });

		await scrollToBottom(page);
		await expect(postCards).toHaveCount(30, { timeout: 10000 });

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

async function scrollToBottom(page: Page) {
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await page.waitForTimeout(500);
}
