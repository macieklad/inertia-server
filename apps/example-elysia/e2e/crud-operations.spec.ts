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

			const initialRows = page.locator("tbody tr");
			const initialCount = await initialRows.count();
			expect(initialCount).toBeGreaterThan(0);

			const firstUserName = await initialRows
				.first()
				.locator("td")
				.first()
				.textContent();
			const searchTerm = firstUserName?.split(" ")[0] ?? "User";

			await page.fill('[name="search"]', searchTerm);
			await page.getByRole("button", { name: "Search" }).click();
			await page.waitForLoadState("networkidle");

			const filteredRows = page.locator("tbody tr");
			await expect(filteredRows.first()).toBeVisible();

			const visibleCount = await filteredRows.count();
			expect(visibleCount).toBeGreaterThan(0);

			await expect(filteredRows.first()).toContainText(
				new RegExp(searchTerm, "i"),
			);
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

			const firstUserName = await page
				.locator("tbody tr")
				.first()
				.locator("td")
				.first()
				.textContent();
			const searchTerm = firstUserName?.split(" ")[0] ?? "User";

			const searchInput = page.locator('[name="search"]');
			await page.fill('[name="search"]', searchTerm);
			await page.getByRole("button", { name: "Search" }).click();
			await page.waitForLoadState("networkidle");

			await expect(searchInput).toHaveValue(searchTerm);

			const nextLink = page.getByRole("link", { name: "Next" });
			if (await nextLink.isVisible()) {
				await nextLink.click();
				await page.waitForLoadState("networkidle");
				await expect(searchInput).toHaveValue(searchTerm);
			}
		});
	});
});
