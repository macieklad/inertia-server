import { expect, type Page } from "@playwright/test";

export async function waitForPageLoad(page: Page) {
	await page.waitForLoadState("networkidle");
}

export async function waitForInertiaNavigation(page: Page) {
	await page.waitForResponse(
		(response) => response.headers()["x-inertia"] === "true",
	);
}

export async function expectFlashMessage(
	page: Page,
	type: "success" | "error",
	messageContains: string,
) {
	const flashSelector = `[data-flash="${type}"]`;
	await expect(page.locator(flashSelector)).toContainText(messageContains);
}

export async function expectNoFlashMessage(page: Page) {
	await expect(page.locator("[data-flash]")).toHaveCount(0);
}

export async function expectValidationError(
	page: Page,
	fieldName: string,
	errorContains: string,
) {
	const errorSelector = `[data-error="${fieldName}"]`;
	await expect(page.locator(errorSelector)).toContainText(errorContains);
}

export async function expectNoValidationError(page: Page, fieldName: string) {
	const errorSelector = `[data-error="${fieldName}"]`;
	await expect(page.locator(errorSelector)).toHaveCount(0);
}

export async function fillForm(page: Page, formData: Record<string, string>) {
	for (const [name, value] of Object.entries(formData)) {
		await page.fill(`[name="${name}"]`, value);
	}
}

export async function submitForm(page: Page, buttonText?: string) {
	if (buttonText) {
		await page.click(`button:has-text("${buttonText}")`);
	} else {
		await page.click('button[type="submit"]');
	}
}

export async function navigateTo(page: Page, path: string) {
	await page.goto(path);
	await waitForPageLoad(page);
}

export async function clickLink(page: Page, text: string) {
	await page.click(`a:has-text("${text}")`);
	await waitForPageLoad(page);
}

export async function getPagePropsFromDom(page: Page) {
	return page.evaluate(() => {
		const el = document.getElementById("app");
		if (!el) return null;
		const dataPage = el.getAttribute("data-page");
		return dataPage ? JSON.parse(dataPage) : null;
	});
}

export async function waitForDeferredProp(
	page: Page,
	selector: string,
	timeout = 10000,
) {
	await expect(page.locator(selector)).toBeVisible({ timeout });
}

export async function getHistoryState(page: Page) {
	return page.evaluate(() => window.history.state);
}

export async function countElements(page: Page, selector: string) {
	return page.locator(selector).count();
}

export async function getTextContent(page: Page, selector: string) {
	return page.locator(selector).textContent();
}

export async function isVisible(page: Page, selector: string) {
	return page.locator(selector).isVisible();
}

export async function waitForText(page: Page, text: string, timeout = 5000) {
	await expect(page.getByText(text)).toBeVisible({ timeout });
}

export async function waitForSelector(
	page: Page,
	selector: string,
	timeout = 5000,
) {
	await expect(page.locator(selector)).toBeVisible({ timeout });
}

export function getBaseUrl() {
	return process.env.BASE_URL || "http://localhost:3000";
}
