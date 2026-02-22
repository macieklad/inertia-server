import { expect, test } from "@playwright/test";
import { submitLogin, visitLogin } from "./helpers";

test.describe("auth flow", () => {
	test("shows login errors for invalid credentials", async ({ page }) => {
		await visitLogin(page);
		await submitLogin(page, {
			email: "demo@example.com",
			password: "bad",
		});

		await expect(page).toHaveURL("/login");
		await expect(page.getByTestId("login-password-error")).toBeVisible();
		await expect(page.locator('[data-flash="error"]')).toContainText(
			"Fix form errors",
		);
	});

	test("logs in, renders dashboard, and logs out", async ({ page }) => {
		await visitLogin(page);
		await submitLogin(page, {
			email: "demo@example.com",
			password: "password123",
		});

		await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
		await expect(page.locator('[data-flash="success"]')).toContainText(
			"Welcome back",
		);
		await expect(page.getByTestId("login-count")).toHaveText("1");

		await page.getByRole("button", { name: "Sign out" }).click();

		await expect(page).toHaveURL("/login", { timeout: 10000 });
		await expect(page.locator('[data-flash="success"]')).toContainText(
			"Signed out",
		);
	});
});
