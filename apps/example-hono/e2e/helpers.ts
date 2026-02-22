import { expect, type Page } from "@playwright/test";

export async function visitLogin(page: Page) {
	await page.goto("/login");
	await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
}

export async function submitLogin(
	page: Page,
	credentials: { email: string; password: string },
) {
	await page.getByLabel("Email").fill(credentials.email);
	await page.getByLabel("Password").fill(credentials.password);
	await page.getByTestId("login-submit").click();
}
