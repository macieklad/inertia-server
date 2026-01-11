import { expect, test } from "@playwright/test";

test.describe("navigation & redirects", () => {
	test("redirects with flash message", async ({ page }) => {
		await page.goto("/users/create");

		await page.fill('[name="name"]', `Redirect Test ${Date.now()}`);
		await page.fill('[name="email"]', `redirect-${Date.now()}@example.com`);
		await page.fill('[name="password"]', "password123");

		await page.getByRole("button", { name: "Create User" }).click();

		await expect(page).toHaveURL("/users", { timeout: 10000 });
		await expect(page.getByText("User created successfully")).toBeVisible();

		await page.reload({ waitUntil: "networkidle" });

		await expect(page.getByText("User created successfully")).not.toBeVisible();
	});

	test("same page reloads preserves flash message", async ({ page }) => {
		await page.goto("/contact");

		await page.fill('[name="name"]', "Flash Test");
		await page.fill('[name="email"]', "flash@test.com");
		await page.fill(
			'[name="message"]',
			"Testing flash message persistence across redirect.",
		);

		await page.getByRole("button", { name: "Send Message" }).click();

		await expect(page).toHaveURL("/contact", { timeout: 10000 });
		await expect(page.getByText("Message sent successfully")).toBeVisible();
	});
});
