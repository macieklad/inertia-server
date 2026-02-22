import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { honoAdapter } from "../src/hono";
import { createInertia, prop } from "../src/index";
import { inertia } from "../src/testing";
import type { InertiaPage } from "../src/types";

const renderPage = (page: InertiaPage) => {
	return `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<div id="app" data-page='${JSON.stringify(page)}'></div>
</body>
</html>`;
};

const inertiaHeaders = {
	"X-Inertia": "true",
	"X-Inertia-Version": "1.0.0",
};

describe("hono adapter", () => {
	test("injects inertia helper into Hono context", async () => {
		const { definePage, createHelper } = createInertia({
			version: "1.0.0",
			render: renderPage,
		});
		const homePage = definePage({
			component: "Home",
			props: { title: prop<string>() },
		});

		const app = new Hono();
		app.use("*", honoAdapter(createHelper));
		app.get("/", (c) => {
			return c.get("inertia").render(homePage({ title: "Hello from Hono" }));
		});

		const response = await app.request("http://localhost/", {
			headers: inertiaHeaders,
		});

		await inertia(response)
			.component("Home")
			.has("title", "Hello from Hono")
			.assert();
	});

	test("supports flash adapter for validation errors", async () => {
		const { definePage, createHelper } = createInertia({
			version: "1.0.0",
			render: renderPage,
		});
		const loginPage = definePage({
			component: "Auth/Login",
			props: { title: prop<string>() },
		});

		let flashData: Record<string, unknown> = {};
		const app = new Hono();
		app.use(
			"*",
			honoAdapter(createHelper, () => ({
				getAll() {
					const current = { ...flashData };
					flashData = {};
					return current;
				},
				set(data) {
					flashData = { ...flashData, ...data };
				},
			})),
		);

		app.post("/login", (c) => {
			const inertia = c.get("inertia");
			inertia.errors({ email: "Invalid credentials" }, "login");
			return inertia.redirect("/login");
		});

		app.get("/login", (c) => {
			return c.get("inertia").render(loginPage({ title: "Sign in" }));
		});

		const submitResponse = await app.request("http://localhost/login", {
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
			body: "email=demo%40example.com&password=wrong",
		});
		expect(submitResponse.status).toBe(302);

		const renderResponse = await app.request("http://localhost/login", {
			headers: inertiaHeaders,
		});

		await inertia(renderResponse)
			.component("Auth/Login")
			.has("errors.login.email", "Invalid credentials")
			.assert();
	});
});
