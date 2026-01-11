import { expect, test } from "@playwright/test";

test.describe("Suite 3: Forms & Validation", () => {
	test.describe("3.1 User Registration with Validation", () => {
		test("shows validation errors for empty form submission", async ({
			page,
		}) => {
			await page.goto("/users/create");

			const responsePromise = page.waitForResponse((resp) =>
				resp.url().includes("/users"),
			);
			await page.getByRole("button", { name: "Create User" }).click();
			await responsePromise;

			await expect(
				page.getByText("Name must be at least 2 characters"),
			).toBeVisible({ timeout: 10000 });
			await expect(
				page.getByText("Please enter a valid email address"),
			).toBeVisible();
			await expect(
				page.getByText("Password must be at least 8 characters"),
			).toBeVisible();
		});

		test("errors clear individually as fields are fixed", async ({ page }) => {
			await page.goto("/users/create");

			let responsePromise = page.waitForResponse((resp) =>
				resp.url().includes("/users"),
			);
			await page.getByRole("button", { name: "Create User" }).click();
			await responsePromise;

			await expect(
				page.getByText("Name must be at least 2 characters"),
			).toBeVisible({ timeout: 10000 });

			await page.fill('[name="name"]', "John Doe");
			responsePromise = page.waitForResponse((resp) =>
				resp.url().includes("/users"),
			);
			await page.getByRole("button", { name: "Create User" }).click();
			await responsePromise;

			await expect(
				page.getByText("Name must be at least 2 characters"),
			).not.toBeVisible();
			await expect(
				page.getByText("Please enter a valid email address"),
			).toBeVisible();
		});

		test("successful creation redirects with flash message", async ({
			page,
		}) => {
			await page.goto("/users/create");

			await page.fill('[name="name"]', "Test User");
			await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
			await page.fill('[name="password"]', "password123");

			const responsePromise = page.waitForResponse((resp) =>
				resp.url().includes("/users"),
			);
			await page.getByRole("button", { name: "Create User" }).click();
			await responsePromise;

			await expect(page).toHaveURL("/users", { timeout: 10000 });
			await expect(page.getByText("User created successfully")).toBeVisible();
		});
	});

	test.describe("3.2 Duplicate Email Detection", () => {
		test("shows error for duplicate email", async ({ page }) => {
			const uniqueEmail = `duplicate-test-${Date.now()}@example.com`;

			await page.goto("/users/create");
			await page.fill('[name="name"]', "First User");
			await page.fill('[name="email"]', uniqueEmail);
			await page.fill('[name="password"]', "password123");
			await page.getByRole("button", { name: "Create User" }).click();

			await expect(page).toHaveURL("/users", { timeout: 10000 });

			await page.goto("/users/create");
			await page.fill('[name="name"]', "Second User");
			await page.fill('[name="email"]', uniqueEmail);
			await page.fill('[name="password"]', "password123");
			await page.getByRole("button", { name: "Create User" }).click();
			await page.waitForLoadState("networkidle");

			await expect(page.getByText("already taken")).toBeVisible();
		});
	});

	test.describe("3.3 Contact Form Success Flow", () => {
		test("shows success flash after valid submission", async ({ page }) => {
			await page.goto("/contact");

			await page.fill('[name="name"]', "John Doe");
			await page.fill('[name="email"]', "john@example.com");
			await page.fill(
				'[name="message"]',
				"This is a test message that is long enough.",
			);

			await page.getByRole("button", { name: "Send Message" }).click();

			await expect(page.getByText("Message sent successfully")).toBeVisible();
		});

		test("flash message disappears after navigation", async ({ page }) => {
			await page.goto("/contact");

			await page.fill('[name="name"]', "John Doe");
			await page.fill('[name="email"]', "john@example.com");
			await page.fill(
				'[name="message"]',
				"This is a test message that is long enough.",
			);
			await page.getByRole("button", { name: "Send Message" }).click();

			await expect(page.getByText("Message sent successfully")).toBeVisible();

			await page.goto("/about");
			await page.goto("/contact");

			await expect(
				page.getByText("Message sent successfully"),
			).not.toBeVisible();
		});
	});

	test.describe("3.4 Error Bags Isolate Form Errors", () => {
		test("login form errors don't affect create user form", async ({
			page,
		}) => {
			await page.goto("/error-bags");

			await page
				.locator("form")
				.filter({ hasText: "Login" })
				.getByRole("button")
				.click();
			await page.waitForLoadState("networkidle");

			await expect(
				page
					.locator("form")
					.filter({ hasText: "Login" })
					.getByText("Please enter a valid email"),
			).toBeVisible();

			await expect(
				page
					.locator("form")
					.filter({ hasText: "Create User" })
					.getByText("Please enter a valid email"),
			).not.toBeVisible();
		});

		test("create user form errors don't affect login form", async ({
			page,
		}) => {
			await page.goto("/error-bags");

			await page
				.locator("form")
				.filter({ hasText: "Create User" })
				.getByRole("button")
				.click();
			await page.waitForLoadState("networkidle");

			await expect(
				page
					.locator("form")
					.filter({ hasText: "Create User" })
					.getByText("Name must be"),
			).toBeVisible();

			await expect(
				page
					.locator("form")
					.filter({ hasText: "Login" })
					.getByText("Name must be"),
			).not.toBeVisible();
		});

		test("submitting one form doesn't clear other form's errors", async ({
			page,
		}) => {
			await page.goto("/error-bags");

			await page
				.locator("form")
				.filter({ hasText: "Login" })
				.getByRole("button")
				.click();
			await page.waitForLoadState("networkidle");
			await expect(
				page
					.locator("form")
					.filter({ hasText: "Login" })
					.getByText("Please enter a valid email"),
			).toBeVisible();

			await page
				.locator("form")
				.filter({ hasText: "Create User" })
				.getByRole("button")
				.click();
			await page.waitForLoadState("networkidle");

			await expect(
				page
					.locator("form")
					.filter({ hasText: "Login" })
					.getByText("Please enter a valid email"),
			).toBeVisible();
			await expect(
				page
					.locator("form")
					.filter({ hasText: "Create User" })
					.getByText("Name must be"),
			).toBeVisible();
		});
	});
});
