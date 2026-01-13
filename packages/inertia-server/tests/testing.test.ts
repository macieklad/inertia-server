import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createAppHelper, inertia, inertiaFromPage } from "../src/testing";
import type { InertiaPage } from "../src/types";
import { isInertiaPage } from "../src/utils";

function createJsonResponse(page: InertiaPage): Response {
	return new Response(JSON.stringify(page), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"X-Inertia": "true",
		},
	});
}

function createHtmlResponse(page: InertiaPage): Response {
	const html = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<div id="app" data-page='${JSON.stringify(page)}'></div>
</body>
</html>`;
	return new Response(html, {
		status: 200,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}

function basePage(overrides: Partial<InertiaPage> = {}): InertiaPage {
	return {
		component: "Test/Page",
		props: {},
		url: "/test",
		version: "1.0.0",
		...overrides,
	};
}

describe("inertia() response parsing", () => {
	test("parses JSON response", async () => {
		const page = basePage({ props: { title: "Hello" } });
		const response = createJsonResponse(page);

		const title = await inertia(response).props<string>("title");
		expect(title).toBe("Hello");
	});

	test("parses HTML response with data-page attribute", async () => {
		const page = basePage({ props: { title: "From HTML" } });
		const response = createHtmlResponse(page);

		const title = await inertia(response).props<string>("title");
		expect(title).toBe("From HTML");
	});

	test("parses HTML with double-quoted data-page", async () => {
		const page = basePage({ props: { name: "Test" } });
		const html = `<div id="app" data-page="${JSON.stringify(page).replace(
			/"/g,
			"&quot;",
		)}"></div>`;
		const response = new Response(html, {
			headers: { "Content-Type": "text/html" },
		});

		const name = await inertia(response).props<string>("name");
		expect(name).toBe("Test");
	});

	test("throws on missing data-page in HTML", async () => {
		const response = new Response("<html><body>No page</body></html>", {
			headers: { "Content-Type": "text/html" },
		});

		await expect(inertia(response).assert()).rejects.toThrow(
			"Could not find data-page",
		);
	});

	test("throws on unexpected content type", async () => {
		const response = new Response("plain text", {
			headers: { "Content-Type": "text/plain" },
		});

		await expect(inertia(response).assert()).rejects.toThrow(
			"Unexpected response content type",
		);
	});
});

describe("isInertiaPage()", () => {
	test("returns true for valid InertiaPage", () => {
		const page = basePage({ props: { title: "Test" } });
		expect(isInertiaPage(page)).toBe(true);
	});

	test("returns true for page with optional fields", () => {
		const page: InertiaPage = {
			component: "Test",
			props: { data: 1 },
			url: "/test",
			version: "1.0.0",
			encryptHistory: true,
			clearHistory: false,
			deferredProps: { default: ["lazy"] },
			mergeProps: ["items"],
		};
		expect(isInertiaPage(page)).toBe(true);
	});

	test("returns false for null", () => {
		expect(isInertiaPage(null)).toBe(false);
	});

	test("returns false for undefined", () => {
		expect(isInertiaPage(undefined)).toBe(false);
	});

	test("returns false for primitives", () => {
		expect(isInertiaPage("string")).toBe(false);
		expect(isInertiaPage(123)).toBe(false);
		expect(isInertiaPage(true)).toBe(false);
	});

	test("returns false for empty object", () => {
		expect(isInertiaPage({})).toBe(false);
	});

	test("returns false when missing component", () => {
		expect(isInertiaPage({ props: {}, url: "/", version: "1" })).toBe(false);
	});

	test("returns false when missing props", () => {
		expect(isInertiaPage({ component: "A", url: "/", version: "1" })).toBe(
			false,
		);
	});

	test("returns false when missing url", () => {
		expect(isInertiaPage({ component: "A", props: {}, version: "1" })).toBe(
			false,
		);
	});

	test("returns false when missing version", () => {
		expect(isInertiaPage({ component: "A", props: {}, url: "/" })).toBe(false);
	});

	test("returns false when component is not string", () => {
		expect(
			isInertiaPage({ component: 123, props: {}, url: "/", version: "1" }),
		).toBe(false);
	});

	test("returns false when props is not object", () => {
		expect(
			isInertiaPage({
				component: "A",
				props: "invalid",
				url: "/",
				version: "1",
			}),
		).toBe(false);
	});

	test("returns false when props is null", () => {
		expect(
			isInertiaPage({ component: "A", props: null, url: "/", version: "1" }),
		).toBe(false);
	});

	test("returns false when url is not string", () => {
		expect(
			isInertiaPage({ component: "A", props: {}, url: 123, version: "1" }),
		).toBe(false);
	});

	test("returns false when version is not string", () => {
		expect(
			isInertiaPage({ component: "A", props: {}, url: "/", version: 1 }),
		).toBe(false);
	});

	test("returns false for array", () => {
		expect(isInertiaPage([1, 2, 3])).toBe(false);
	});
});

describe("component()", () => {
	test("passes when component matches", async () => {
		const page = basePage({ component: "Users/Index" });
		await inertia(createJsonResponse(page)).component("Users/Index").assert();
	});

	test("fails when component does not match", async () => {
		const page = basePage({ component: "Users/Index" });
		await expect(
			inertia(createJsonResponse(page)).component("Posts/Index").assert(),
		).rejects.toThrow("Component mismatch");
	});
});

describe("url()", () => {
	test("passes when URL matches", async () => {
		const page = basePage({ url: "/users/123" });
		await inertia(createJsonResponse(page)).url("/users/123").assert();
	});

	test("fails when URL does not match", async () => {
		const page = basePage({ url: "/users/123" });
		await expect(
			inertia(createJsonResponse(page)).url("/posts").assert(),
		).rejects.toThrow("URL mismatch");
	});
});

describe("version()", () => {
	test("passes when version matches", async () => {
		const page = basePage({ version: "2.0.0" });
		await inertia(createJsonResponse(page)).version("2.0.0").assert();
	});

	test("fails when version does not match", async () => {
		const page = basePage({ version: "2.0.0" });
		await expect(
			inertia(createJsonResponse(page)).version("1.0.0").assert(),
		).rejects.toThrow("Version mismatch");
	});
});

describe("has()", () => {
	test("passes when property exists", async () => {
		const page = basePage({ props: { title: "Hello" } });
		await inertia(createJsonResponse(page)).has("title").assert();
	});

	test("fails when property does not exist", async () => {
		const page = basePage({ props: {} });
		await expect(
			inertia(createJsonResponse(page)).has("missing").assert(),
		).rejects.toThrow('Property "missing" does not exist');
	});

	test("supports dot notation for nested properties", async () => {
		const page = basePage({
			props: {
				user: { profile: { name: "John" } },
			},
		});
		await inertia(createJsonResponse(page)).has("user.profile.name").assert();
	});

	test("fails for missing nested property", async () => {
		const page = basePage({ props: { user: { name: "John" } } });
		await expect(
			inertia(createJsonResponse(page)).has("user.email").assert(),
		).rejects.toThrow('Property "user.email" does not exist');
	});
});

describe("has() with exact value", () => {
	test("passes when value matches exactly", async () => {
		const page = basePage({ props: { status: "active" } });
		await inertia(createJsonResponse(page)).has("status", "active").assert();
	});

	test("fails when value does not match", async () => {
		const page = basePage({ props: { status: "inactive" } });
		await expect(
			inertia(createJsonResponse(page)).has("status", "active").assert(),
		).rejects.toThrow("does not match expected value");
	});

	test("compares arrays deeply", async () => {
		const page = basePage({ props: { tags: ["a", "b", "c"] } });
		await inertia(createJsonResponse(page))
			.has("tags", ["a", "b", "c"])
			.assert();

		await expect(
			inertia(createJsonResponse(page)).has("tags", ["a", "b"]).assert(),
		).rejects.toThrow("does not match expected value");
	});

	test("compares objects deeply", async () => {
		const page = basePage({
			props: { config: { nested: { value: 42 } } },
		});
		await inertia(createJsonResponse(page))
			.has("config", { nested: { value: 42 } })
			.assert();
	});

	test("supports dot notation", async () => {
		const page = basePage({
			props: { user: { profile: { age: 30 } } },
		});
		await inertia(createJsonResponse(page))
			.has("user.profile.age", 30)
			.assert();
	});

	test("fails for non-existent property", async () => {
		const page = basePage({ props: {} });
		await expect(
			inertia(createJsonResponse(page)).has("missing", "value").assert(),
		).rejects.toThrow("does not exist");
	});
});

describe("has() with callback", () => {
	test("passes when callback returns true", async () => {
		const page = basePage({ props: { count: 10 } });
		await inertia(createJsonResponse(page))
			.has("count", (v) => (v as number) > 5)
			.assert();
	});

	test("fails when callback returns false", async () => {
		const page = basePage({ props: { count: 3 } });
		await expect(
			inertia(createJsonResponse(page))
				.has("count", (v) => (v as number) > 5)
				.assert(),
		).rejects.toThrow("failed callback assertion");
	});

	test("supports complex object validation", async () => {
		const page = basePage({
			props: {
				users: [
					{ id: 1, name: "Alice" },
					{ id: 2, name: "Bob" },
				],
			},
		});

		await inertia(createJsonResponse(page))
			.has("users.0", (v) => (v as { name: string }).name === "Alice")
			.assert();
	});
});

describe("missing()", () => {
	test("passes when property does not exist", async () => {
		const page = basePage({ props: { title: "Test" } });
		await inertia(createJsonResponse(page)).missing("secret").assert();
	});

	test("fails when property exists", async () => {
		const page = basePage({ props: { secret: "password123" } });
		await expect(
			inertia(createJsonResponse(page)).missing("secret").assert(),
		).rejects.toThrow("exists but should not");
	});

	test("supports dot notation", async () => {
		const page = basePage({ props: { user: { name: "John" } } });
		await inertia(createJsonResponse(page)).missing("user.email").assert();
	});
});

describe("tap()", () => {
	test("allows direct access to page object", async () => {
		const page = basePage({
			component: "Users/Show",
			props: { user: { id: 42 } },
		});

		let capturedPage: InertiaPage | undefined;
		await inertia(createJsonResponse(page))
			.tap((p) => {
				capturedPage = p;
			})
			.assert();

		expect(capturedPage).toBeDefined();
		expect(capturedPage?.component).toBe("Users/Show");
		expect(capturedPage?.props.user).toEqual({ id: 42 });
	});

	test("can run custom assertions in tap", async () => {
		const page = basePage({ props: { count: 10 } });

		await inertia(createJsonResponse(page))
			.tap((p) => {
				expect(p.props.count).toBeGreaterThan(5);
			})
			.assert();
	});

	test("tap throws propagate to assert", async () => {
		const page = basePage({ props: { count: 3 } });

		await expect(
			inertia(createJsonResponse(page))
				.tap((p) => {
					expect(p.props.count).toBeGreaterThan(5);
				})
				.assert(),
		).rejects.toThrow();
	});
});

describe("props()", () => {
	test("returns all props when called without argument", async () => {
		const page = basePage({ props: { a: 1, b: 2, c: 3 } });
		const props = await inertia(createJsonResponse(page)).props();
		expect(props).toEqual({ a: 1, b: 2, c: 3 });
	});

	test("returns specific prop with key argument", async () => {
		const page = basePage({ props: { user: { id: 42 } } });
		const user = await inertia(createJsonResponse(page)).props<{
			id: number;
		}>("user");
		expect(user).toEqual({ id: 42 });
	});

	test("returns nested prop with dot notation", async () => {
		const page = basePage({ props: { user: { profile: { name: "Test" } } } });
		const name = await inertia(createJsonResponse(page)).props<string>(
			"user.profile.name",
		);
		expect(name).toBe("Test");
	});

	test("returns undefined for missing prop", async () => {
		const page = basePage({ props: {} });
		const missing = await inertia(createJsonResponse(page)).props("missing");
		expect(missing).toBeUndefined();
	});
});

describe("flash assertions via has/missing", () => {
	test("has() works for flash key", async () => {
		const page = basePage({
			props: { flash: { message: "Success!" } },
		});
		await inertia(createJsonResponse(page)).has("flash.message").assert();
	});

	test("has() works for flash key with value", async () => {
		const page = basePage({
			props: { flash: { message: "Saved!" } },
		});
		await inertia(createJsonResponse(page))
			.has("flash.message", "Saved!")
			.assert();
	});

	test("missing() works for flash key", async () => {
		const page = basePage({
			props: { flash: { message: "Hi" } },
		});
		await inertia(createJsonResponse(page)).missing("flash.error").assert();
	});

	test("missing() passes when no flash data at all", async () => {
		const page = basePage({ props: {} });
		await inertia(createJsonResponse(page)).missing("flash.anything").assert();
	});
});

describe("toPage()", () => {
	test("returns the raw InertiaPage object", async () => {
		const page = basePage({
			component: "Custom/Component",
			props: { data: "test" },
			url: "/custom",
		});
		const rawPage = await inertia(createJsonResponse(page)).toPage();

		expect(rawPage.component).toBe("Custom/Component");
		expect(rawPage.props.data).toBe("test");
		expect(rawPage.url).toBe("/custom");
	});
});

describe("chaining assertions", () => {
	test("allows chaining all assertion methods before assert()", async () => {
		const page = basePage({
			component: "Dashboard",
			url: "/dashboard",
			version: "1.0.0",
			props: {
				title: "Welcome",
				user: { id: 1, name: "Admin" },
				items: [{ id: 1 }, { id: 2 }],
				flash: { message: "Logged in" },
			},
		});

		await inertia(createJsonResponse(page))
			.component("Dashboard")
			.url("/dashboard")
			.version("1.0.0")
			.has("title")
			.has("title", "Welcome")
			.has("user.id", 1)
			.has("user.name", "Admin")
			.has("items", (v) => Array.isArray(v) && v.length === 2)
			.missing("secret")
			.has("flash.message", "Logged in")
			.missing("flash.error")
			.assert();
	});
});

describe("partial reloads with mock server", () => {
	let server: ReturnType<typeof Bun.serve>;
	let inertia: ReturnType<typeof createAppHelper>;
	const pageData: Record<string, unknown> = {
		users: [{ id: 1 }, { id: 2 }],
		roles: ["admin", "user"],
		permissions: ["read", "write"],
	};

	beforeAll(() => {
		server = Bun.serve({
			port: 0,
			fetch(request) {
				const isInertia = request.headers.get("X-Inertia") === "true";
				const partialData = request.headers.get("X-Inertia-Partial-Data");
				const partialExcept = request.headers.get("X-Inertia-Partial-Except");
				const component = request.headers.get("X-Inertia-Partial-Component");

				let props: Record<string, unknown> = { ...pageData };

				if (component === "Users/Index") {
					if (partialData) {
						const requested = partialData.split(",");
						props = {};
						for (const key of requested) {
							if (key in pageData) {
								props[key] = pageData[key];
							}
						}
					} else if (partialExcept) {
						const excluded = partialExcept.split(",");
						props = { ...pageData };
						for (const key of excluded) {
							delete props[key];
						}
					}
				}

				props.errors = {};
				props.flash = {};

				const page: InertiaPage = {
					component: "Users/Index",
					props,
					url: "/users",
					version: "1.0.0",
				};

				if (isInertia) {
					return new Response(JSON.stringify(page), {
						headers: {
							"Content-Type": "application/json",
							"X-Inertia": "true",
						},
					});
				}

				return new Response("Not an Inertia request", { status: 400 });
			},
		});
		inertia = createAppHelper(server);
	});

	afterAll(() => {
		server.stop();
	});

	test("reloadOnly() requests only specified props", async () => {
		const initialPage = basePage({
			component: "Users/Index",
			url: "/users",
			props: {
				users: pageData.users,
				roles: pageData.roles,
				permissions: pageData.permissions,
				errors: {},
				flash: {},
			},
		});

		await inertia(createJsonResponse(initialPage))
			.reloadOnly("users", (page) => {
				expect(page.props.users).toHaveLength(2);
				expect(page.props.roles).toBeUndefined();
				expect(page.props.permissions).toBeUndefined();
			})
			.assert();
	});

	test("reloadOnly() with array of props", async () => {
		const initialPage = basePage({
			component: "Users/Index",
			url: "/users",
			props: {
				users: pageData.users,
				roles: pageData.roles,
				permissions: pageData.permissions,
				errors: {},
				flash: {},
			},
		});

		await inertia(createJsonResponse(initialPage))
			.reloadOnly(["users", "roles"], (page) => {
				expect(page.props.users).toBeDefined();
				expect(page.props.roles).toBeDefined();
				expect(page.props.permissions).toBeUndefined();
			})
			.assert();
	});

	test("reloadExcept() excludes specified props", async () => {
		const initialPage = basePage({
			component: "Users/Index",
			url: "/users",
			props: {
				users: pageData.users,
				roles: pageData.roles,
				permissions: pageData.permissions,
				errors: {},
				flash: {},
			},
		});

		await inertia(createJsonResponse(initialPage))
			.reloadExcept("permissions", (page) => {
				expect(page.props.users).toBeDefined();
				expect(page.props.roles).toBeDefined();
				expect(page.props.permissions).toBeUndefined();
			})
			.assert();
	});

	test("createInertiaHelper() binds fetch option", async () => {
		const inertia = createAppHelper(server);

		const initialPage = basePage({
			component: "Users/Index",
			url: "/users",
			props: {
				users: pageData.users,
				roles: pageData.roles,
				permissions: pageData.permissions,
				errors: {},
				flash: {},
			},
		});

		await inertia(createJsonResponse(initialPage))
			.reloadOnly("users", (page) => {
				expect(page.props.users).toHaveLength(2);
				expect(page.props.roles).toBeUndefined();
			})
			.assert();
	});

	test("reloadOnly() without callback chains assertions against reloaded page", async () => {
		const initialPage = basePage({
			component: "Users/Index",
			url: "/users",
			props: {
				users: pageData.users,
				roles: pageData.roles,
				permissions: pageData.permissions,
				errors: {},
				flash: {},
			},
		});

		await inertia(createJsonResponse(initialPage))
			.has("users")
			.has("roles")
			.reloadOnly("users")
			.has("users")
			.missing("roles")
			.missing("permissions")
			.assert();
	});

	test("reloadExcept() without callback chains assertions against reloaded page", async () => {
		const initialPage = basePage({
			component: "Users/Index",
			url: "/users",
			props: {
				users: pageData.users,
				roles: pageData.roles,
				permissions: pageData.permissions,
				errors: {},
				flash: {},
			},
		});

		await inertia(createJsonResponse(initialPage))
			.has("permissions")
			.reloadExcept("permissions")
			.has("users")
			.has("roles")
			.missing("permissions")
			.assert();
	});
});

describe("deferred props with mock server", () => {
	let server: ReturnType<typeof Bun.serve>;
	let testInertia: ReturnType<typeof createAppHelper>;

	beforeAll(() => {
		server = Bun.serve({
			port: 0,
			fetch(request) {
				const partialData = request.headers.get("X-Inertia-Partial-Data");

				const props: Record<string, unknown> = {
					errors: {},
					flash: {},
				};

				if (partialData) {
					const requested = partialData.split(",");
					if (requested.includes("comments")) {
						props.comments = [{ id: 1, body: "Great!" }];
					}
					if (requested.includes("analytics")) {
						props.analytics = { views: 1000 };
					}
					if (requested.includes("related")) {
						props.related = [{ id: 99 }];
					}
				}

				const page: InertiaPage = {
					component: "Post/Show",
					props,
					url: "/posts/1",
					version: "1.0.0",
				};

				return new Response(JSON.stringify(page), {
					headers: {
						"Content-Type": "application/json",
						"X-Inertia": "true",
					},
				});
			},
		});
		testInertia = createAppHelper(server);
	});

	afterAll(() => {
		server.stop();
	});

	test("loadDeferredProps() loads all deferred props", async () => {
		const initialPage: InertiaPage = {
			component: "Post/Show",
			props: {
				title: "Hello World",
				errors: {},
				flash: {},
			},
			url: "/posts/1",
			version: "1.0.0",
			deferredProps: {
				default: ["comments", "analytics"],
			},
		};

		await testInertia(createJsonResponse(initialPage))
			.loadDeferredProps((page) => {
				expect(page.props.comments).toHaveLength(1);
				expect(page.props.analytics).toBeDefined();
			})
			.assert();
	});

	test("loadDeferredProps() loads specific group", async () => {
		const initialPage: InertiaPage = {
			component: "Post/Show",
			props: {
				title: "Hello",
				errors: {},
				flash: {},
			},
			url: "/posts/1",
			version: "1.0.0",
			deferredProps: {
				default: ["comments"],
				sidebar: ["related"],
			},
		};

		await testInertia(createJsonResponse(initialPage))
			.loadDeferredProps("sidebar", (page) => {
				expect(page.props.related).toBeDefined();
				expect(page.props.comments).toBeUndefined();
			})
			.assert();
	});

	test("loadDeferredProps() loads multiple groups", async () => {
		const initialPage: InertiaPage = {
			component: "Post/Show",
			props: {
				title: "Hello",
				errors: {},
				flash: {},
			},
			url: "/posts/1",
			version: "1.0.0",
			deferredProps: {
				default: ["comments"],
				sidebar: ["related"],
			},
		};

		await testInertia(createJsonResponse(initialPage))
			.loadDeferredProps(["default", "sidebar"], (page) => {
				expect(page.props.comments).toBeDefined();
				expect(page.props.related).toBeDefined();
			})
			.assert();
	});

	test("throws when no deferred props in response", async () => {
		const page = basePage({ props: { title: "No deferred" } });

		await expect(
			inertia(createJsonResponse(page), {
				fetch: () =>
					Promise.resolve(
						new Response("{}", {
							headers: { "Content-Type": "application/json" },
						}),
					),
			})
				.loadDeferredProps(() => {})
				.assert(),
		).rejects.toThrow("No deferred props");
	});

	test("loadDeferredProps() without callback chains assertions against loaded page", async () => {
		const initialPage: InertiaPage = {
			component: "Post/Show",
			props: {
				title: "Hello World",
				errors: {},
				flash: {},
			},
			url: "/posts/1",
			version: "1.0.0",
			deferredProps: {
				default: ["comments", "analytics"],
			},
		};

		await testInertia(createJsonResponse(initialPage))
			.has("title", "Hello World")
			.missing("comments")
			.loadDeferredProps()
			.has("comments")
			.has("analytics")
			.assert();
	});
});

describe("realistic Inertia protocol scenarios", () => {
	test("podcast show page with nested data", async () => {
		const page: InertiaPage = {
			component: "Podcasts/Show",
			props: {
				podcast: {
					id: 41,
					subject: "The Laravel Podcast",
					description: "Laravel and PHP development news.",
					seasons: {
						"1": { episodes: 10 },
						"2": { episodes: 12 },
						"3": { episodes: 8 },
						"4": { episodes: 21 },
					},
					host: {
						id: 1,
						name: "Matt Stauffer",
					},
					subscribers: [
						{ id: 2, name: "Claudio Dekker", platform: "Apple Podcasts" },
						{ id: 3, name: "John Doe", platform: "Spotify" },
					],
				},
				errors: {},
				flash: {},
			},
			url: "/podcasts/41",
			version: "abc123",
		};

		await inertia(createJsonResponse(page))
			.component("Podcasts/Show")
			.has("podcast.id", 41)
			.has("podcast.subject", "The Laravel Podcast")
			.has("podcast.seasons.4.episodes", 21)
			.has("podcast.host.id", 1)
			.has("podcast.host.name", "Matt Stauffer")
			.has("podcast.subscribers", (v) => Array.isArray(v) && v.length === 2)
			.has(
				"podcast.subscribers.0",
				(v) => (v as { name: string }).name === "Claudio Dekker",
			)
			.assert();
	});

	test("form page with validation errors", async () => {
		const page: InertiaPage = {
			component: "Users/Create",
			props: {
				roles: ["admin", "editor", "viewer"],
				errors: {
					default: {
						email: "The email field is required.",
						password: "The password must be at least 8 characters.",
					},
				},
				flash: {
					warning: "Please fix the errors below.",
				},
			},
			url: "/users/create",
			version: "1.0.0",
		};

		await inertia(createJsonResponse(page))
			.component("Users/Create")
			.tap(({ props }) => {
				expect(props.roles).toHaveLength(3);
			})
			.has("roles", (v) => Array.isArray(v) && v.length === 3)
			.has("errors.default.email")
			.has("errors.default.password")
			.has("flash.warning", "Please fix the errors below.")
			.missing("flash.success")
			.assert();
	});

	test("page with merge props metadata", async () => {
		const page: InertiaPage = {
			component: "Posts/Index",
			props: {
				posts: [
					{ id: 1, title: "First" },
					{ id: 2, title: "Second" },
				],
				errors: {},
				flash: {},
			},
			url: "/posts",
			version: "1.0.0",
			mergeProps: ["posts"],
			matchPropsOn: ["posts.id"],
		};

		const rawPage = await inertia(createJsonResponse(page)).toPage();

		expect(rawPage.mergeProps).toContain("posts");
		expect(rawPage.matchPropsOn).toContain("posts.id");

		await inertia(createJsonResponse(page))
			.has("posts", (v) => Array.isArray(v) && v.length === 2)
			.assert();
	});

	test("page with encrypted and cleared history", async () => {
		const page: InertiaPage = {
			component: "Checkout/Complete",
			props: {
				orderId: "ORD-123",
				errors: {},
				flash: { success: "Order placed!" },
			},
			url: "/checkout/complete",
			version: "1.0.0",
			encryptHistory: true,
			clearHistory: true,
		};

		const rawPage = await inertia(createJsonResponse(page)).toPage();

		expect(rawPage.encryptHistory).toBe(true);
		expect(rawPage.clearHistory).toBe(true);

		await inertia(createJsonResponse(page))
			.has("orderId")
			.has("flash.success", "Order placed!")
			.assert();
	});
});

describe("inertiaFromPage()", () => {
	test("creates assertion from page object directly", async () => {
		const page = basePage({
			component: "Test/Component",
			props: { title: "Direct" },
		});

		await inertiaFromPage(page).has("title", "Direct").assert();
	});
});
