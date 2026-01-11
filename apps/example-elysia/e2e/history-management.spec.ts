import { expect, test } from "@playwright/test";

test.describe("Suite 5: History & Remember", () => {
	test.describe("5.1 Data Leak Without Encryption", () => {
		test("useRemember data leaks after logout", async ({ page }) => {
			await page.goto("/history-demo");
			await page.evaluate(() => localStorage.clear());

			await page.getByTestId("name-input").fill("Alice");
			await page.getByRole("button", { name: "Continue to Form" }).click();

			await expect(page.getByTestId("greeting")).toContainText("Hello, Alice!");

			await page.getByTestId("message-input").fill("Alice's secret message");
			await page.getByRole("button", { name: "Submit" }).click();

			await expect(page.getByTestId("result-user")).toHaveText("Alice");
			await expect(page.getByTestId("result-message")).toHaveText(
				"Alice's secret message",
			);

			await page.getByTestId("logout-button").click();

			await page.getByTestId("go-back-button").click();

			await expect(page.getByTestId("greeting")).toContainText("Guest mode");

			const messageInput = page.getByTestId("message-input");
			await expect(messageInput).toHaveValue("Alice's secret message");

			await expect(page.getByText("Data Leak Detected")).toBeVisible();
		});
	});

	test.describe("5.2 No Leak With Encryption", () => {
		test("useRemember data is cleared with encryption enabled", async ({
			page,
		}) => {
			await page.goto("/history-demo");
			await page.evaluate(() => localStorage.clear());

			await page.getByTestId("name-input").fill("Alice");
			await page.getByTestId("encrypt-checkbox").check();
			await page.getByRole("button", { name: "Continue to Form" }).click();

			await expect(page.getByTestId("greeting")).toContainText("Hello, Alice!");

			await page.getByTestId("message-input").fill("Alice's secret");
			await page.getByRole("button", { name: "Submit" }).click();

			await expect(page.getByTestId("result-message")).toHaveText(
				"Alice's secret",
			);

			await page.getByTestId("logout-button").click();
			await page.getByTestId("go-back-button").click();

			await page.waitForLoadState("networkidle");

			await expect(page.getByTestId("greeting")).toContainText("Guest mode");

			const messageInput = page.getByTestId("message-input");
			await expect(messageInput).toHaveValue("");

			await expect(page.getByText("Data Leak Detected")).not.toBeVisible();
		});
	});

	test.describe("5.3 Full Flow", () => {
		test("complete flow works correctly", async ({ page }) => {
			await page.goto("/history-demo");
			await page.evaluate(() => localStorage.clear());

			await page.getByTestId("name-input").fill("Charlie");
			await page.getByRole("button", { name: "Continue to Form" }).click();

			await expect(page.getByTestId("greeting")).toContainText(
				"Hello, Charlie!",
			);

			await page.getByTestId("message-input").fill("Hello from Charlie");
			await page.getByRole("button", { name: "Submit" }).click();

			await expect(page.getByText("Step 3: Submission Complete")).toBeVisible();
			await expect(page.getByTestId("result-user")).toHaveText("Charlie");
			await expect(page.getByTestId("result-message")).toHaveText(
				"Hello from Charlie",
			);
		});

		test("history state display is visible on start page", async ({ page }) => {
			await page.goto("/history-demo");
			await page.evaluate(() => localStorage.clear());

			const historyState = page.getByTestId("history-state");
			await expect(historyState).toBeVisible();
		});
	});
});
