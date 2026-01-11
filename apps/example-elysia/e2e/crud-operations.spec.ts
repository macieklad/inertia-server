import { expect, test } from "@playwright/test";

test.describe("Suite 4: CRUD Operations", () => {
	test.describe("4.1 Full User Lifecycle", () => {
		test("can create, edit, and delete a user", async ({ page }) => {
			const userName = `Test User ${Date.now()}`;
			const userEmail = `test-${Date.now()}@example.com`;

			await page.goto("/users/create");
			await page.fill('[name="name"]', userName);
			await page.fill('[name="email"]', userEmail);
			await page.fill('[name="password"]', "password123");
			await page.getByRole("button", { name: "Create User" }).click();

			await expect(page).toHaveURL("/users", { timeout: 10000 });
			await expect(page.getByText("User created successfully")).toBeVisible();

			let found = false;
			while (!found) {
				if (await page.getByText(userName).isVisible()) {
					found = true;
					break;
				}
				const nextLink = page.getByRole("link", { name: "Next" });
				if (await nextLink.isVisible()) {
					await nextLink.click();
					await page.waitForLoadState("networkidle");
					await page.waitForTimeout(200);
				} else {
					break;
				}
			}

			await expect(page.getByText(userName)).toBeVisible();

			const editRow = page.locator("tr").filter({ hasText: userName });
			await editRow.getByText("Edit").click();
			await expect(page).toHaveURL(/\/users\/\d+\/edit/);

			const updatedName = `${userName} Updated`;
			await page.fill('[name="name"]', updatedName);
			await page.getByRole("button", { name: "Update User" }).click();

			await expect(page).toHaveURL("/users", { timeout: 10000 });
			await expect(page.getByText("User updated successfully")).toBeVisible();

			found = false;
			while (!found) {
				if (await page.getByText(updatedName).isVisible()) {
					found = true;
					break;
				}
				const nextLink = page.getByRole("link", { name: "Next" });
				if (await nextLink.isVisible()) {
					await nextLink.click();
					await page.waitForLoadState("networkidle");
					await page.waitForTimeout(200);
				} else {
					break;
				}
			}

			await expect(page.getByText(updatedName)).toBeVisible();

			const deleteRow = page.locator("tr").filter({ hasText: updatedName });
			await deleteRow.getByText("Delete").click();
			await page.waitForLoadState("networkidle");

			await expect(
				page.getByText(`User "${updatedName}" deleted`),
			).toBeVisible();
			await expect(
				page.locator("tbody").getByText(updatedName),
			).not.toBeVisible();
		});
	});

	test.describe("4.2 User Search and Pagination", () => {
		test("search filters results correctly", async ({ page }) => {
			await page.goto("/users");
			await page.waitForLoadState("networkidle");

			const tableBody = page.locator("tbody");
			await expect(tableBody).toBeVisible();

			const initialCount = await page.locator("tbody tr").count();
			expect(initialCount).toBeGreaterThan(0);

			await page.fill('[name="search"]', "Admin");
			await page.getByRole("button", { name: "Search" }).click();
			await page.waitForLoadState("networkidle");

			const filteredRows = page.locator("tbody tr");
			const filteredCount = await filteredRows.count();

			if (filteredCount > 0) {
				for (let i = 0; i < filteredCount; i++) {
					await expect(filteredRows.nth(i)).toContainText(/admin/i);
				}
			}
		});

		test("pagination navigation works", async ({ page }) => {
			await page.goto("/users");

			const paginationExists = await page
				.locator('[data-testid="pagination"]')
				.isVisible();
			if (!paginationExists) {
				return;
			}

			const page1Content = await page.locator("tbody").textContent();

			await page.getByRole("link", { name: "2" }).click();
			await page.waitForTimeout(500);

			const page2Content = await page.locator("tbody").textContent();
			expect(page1Content).not.toBe(page2Content);

			await expect(page).toHaveURL(/page=2/);
		});

		test("search persists across pagination", async ({ page }) => {
			await page.goto("/users");
			await page.waitForLoadState("networkidle");

			const searchInput = page.locator('[name="search"]');
			await page.fill('[name="search"]', "Admin");
			await page.getByRole("button", { name: "Search" }).click();
			await page.waitForLoadState("networkidle");

			await expect(searchInput).toHaveValue("Admin");

			const nextLink = page.getByRole("link", { name: "Next" });
			if (await nextLink.isVisible()) {
				await nextLink.click();
				await page.waitForLoadState("networkidle");
				await expect(searchInput).toHaveValue("Admin");
			}
		});
	});
});
