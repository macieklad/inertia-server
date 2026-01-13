import { describe, expect, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { Elysia } from "elysia";
import { elysiaAdapter } from "../src/elysia";
import { createInertia, mergedProp, prop } from "../src/index";
import { inertia } from "../src/testing";
import type { FlashAdapter, InertiaPage } from "../src/types";

// Simple HTML renderer for testing
const renderPage = (page: InertiaPage) => {
	return `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<div id="app" data-page='${JSON.stringify(page)}'></div>
</body>
</html>`;
};

// Helper to create inertia with the new API
function createInertiaWithAdapter(config: {
	version: string;
	render: (page: InertiaPage) => string;
	encryptHistory?: boolean;
}) {
	const { definePage, createHelper } = createInertia(config);
	const plugin = elysiaAdapter(createHelper);
	return { plugin, definePage, createHelper };
}

// Create test app with inertia using adapter API
function createTestApp() {
	const { definePage, createHelper } = createInertia({
		version: "1.0.0",
		render: renderPage,
	});
	const plugin = elysiaAdapter(createHelper);

	const homePage = definePage({
		component: "Home",
		props: {
			title: prop<string>(),
			appName: prop<string>(),
		},
	});

	const usersPage = definePage({
		component: "Users/Index",
		props: {
			users: prop<{ id: number; name: string }[]>(),
			appName: prop<string>(),
		},
	});

	return new Elysia()
		.use(plugin)
		.get("/", ({ inertia }) => {
			return inertia.render(
				homePage({ title: "Welcome", appName: "Test App" }),
			);
		})
		.get("/users", ({ inertia }) => {
			return inertia.render(
				usersPage({
					users: [{ id: 1, name: "John" }],
					appName: "Test App",
				}),
			);
		})
		.post("/users", ({ inertia }) => {
			return inertia.redirect("/users");
		})
		.get("/external", ({ inertia }) => {
			return inertia.location("https://example.com");
		});
}

describe("Initial HTML visit", () => {
	test("returns HTML response with data-page attribute", async () => {
		const app = createTestApp();
		const api = treaty(app);
		const { response, data } = await api.get();

		expect(response.status).toBe(200);

		await inertia(data)
			.has("title", "Welcome")
			.has("appName", "Test App")
			.component("Home")
			.assert();
	});

	test("includes props in page object", async () => {
		const app = createTestApp();
		const response = await app.handle(new Request("http://localhost/"));
		const html = await response.text();

		// Parse the data-page attribute
		const match = html.match(/data-page='([^']+)'/);
		expect(match).toBeTruthy();
		if (!match) throw new Error("Expected match");

		const page = JSON.parse(match[1]);
		expect(page.props.appName).toBe("Test App");
	});

	test("includes version in page object", async () => {
		const app = createTestApp();
		const response = await app.handle(new Request("http://localhost/"));
		const html = await response.text();

		const match = html.match(/data-page='([^']+)'/);
		if (!match) throw new Error("Expected match");
		const page = JSON.parse(match[1]);
		expect(page.version).toBe("1.0.0");
	});
});

describe("Inertia XHR request", () => {
	test("returns JSON response for Inertia requests", async () => {
		const app = createTestApp();
		const response = await app.handle(
			new Request("http://localhost/users", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("application/json");
		expect(response.headers.get("X-Inertia")).toBe("true");
		expect(response.headers.get("Vary")).toBe("X-Inertia");

		const page = await response.json();
		expect(page.component).toBe("Users/Index");
		expect(page.props.users).toEqual([{ id: 1, name: "John" }]);
	});

	test("returns 409 on version mismatch", async () => {
		const app = createTestApp();
		const response = await app.handle(
			new Request("http://localhost/users", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "old-version",
				},
			}),
		);

		expect(response.status).toBe(409);
		expect(response.headers.get("X-Inertia-Location")).toBe("/users");
	});
});

describe("Redirects", () => {
	test("redirect returns 302 for GET-like requests", async () => {
		const { plugin } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const app = new Elysia()
			.use(plugin)
			.get("/redirect", ({ inertia }) => inertia.redirect("/target"));

		const response = await app.handle(new Request("http://localhost/redirect"));
		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/target");
	});

	test("redirect returns 303 for PUT requests", async () => {
		const { plugin } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const app = new Elysia()
			.use(plugin)
			.put("/update", ({ inertia }) => inertia.redirect("/target"));

		const response = await app.handle(
			new Request("http://localhost/update", { method: "PUT" }),
		);
		expect(response.status).toBe(303);
	});

	test("external redirect returns 409", async () => {
		const app = createTestApp();
		const response = await app.handle(new Request("http://localhost/external"));

		expect(response.status).toBe(409);
		expect(response.headers.get("X-Inertia-Location")).toBe(
			"https://example.com",
		);
	});
});

describe("definePage integration", () => {
	test("mergedProp props are included in page object", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const postsPage = definePage({
			component: "Posts/Index",
			props: {
				posts: mergedProp<{ id: number }[]>({ matchOn: "id" }),
			},
		});

		const app = new Elysia().use(plugin).get("/posts", ({ inertia }) => {
			return inertia.render(
				postsPage({
					posts: [{ id: 1 }, { id: 2 }],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/posts", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.mergeProps).toContain("posts");
		expect(page.matchPropsOn).toContain("posts.id");
	});

	test("once props configuration is included", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const plansPage = definePage({
			component: "Plans/Index",
			props: {
				plans: prop<string[]>().once({ expiresAt: 123456789 }),
			},
		});

		const app = new Elysia().use(plugin).get("/plans", ({ inertia }) => {
			return inertia.render(
				plansPage({
					plans: () => ["basic", "pro"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/plans", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.plans).toEqual(["basic", "pro"]);
		expect(page.onceProps?.plans).toEqual({
			prop: "plans",
			expiresAt: 123456789,
		});
	});

	test("deferred props are tracked", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const postPage = definePage({
			component: "Post/Show",
			props: {
				title: prop<string>(),
				comments: prop<{ id: number }[]>().deferred("sidebar"),
			},
		});

		const app = new Elysia().use(plugin).get("/post", ({ inertia }) => {
			return inertia.render(
				postPage({
					title: "Hello",
					comments: () => [{ id: 1 }],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/post", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.title).toBe("Hello");
		expect(page.deferredProps).toEqual({ sidebar: ["comments"] });
	});

	test("url is injected from request when not provided", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const aboutPage = definePage({
			component: "About/Team",
			props: {
				members: prop<string[]>(),
			},
		});

		const app = new Elysia().use(plugin).get("/about-team", ({ inertia }) => {
			return inertia.render(
				aboutPage({
					members: ["Alice", "Bob"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/about-team", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.url).toBe("/about-team");
	});

	test("custom url can be provided at render time", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const postPage = definePage({
			component: "Post/Show",
			props: {
				title: prop<string>(),
			},
		});

		const app = new Elysia()
			.use(plugin)
			.get("/posts/:id", ({ inertia, params }) => {
				return inertia.render(
					postPage({ title: "Custom Post" }, { url: `/posts/${params.id}` }),
				);
			});

		const response = await app.handle(
			new Request("http://localhost/posts/42", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.url).toBe("/posts/42");
	});

	test("global encryptHistory config works", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
			encryptHistory: true,
		});

		const secretPage = definePage({
			component: "Secret",
			props: {
				data: prop<string>(),
			},
		});

		const app = new Elysia().use(plugin).get("/secret", ({ inertia }) => {
			return inertia.render(secretPage({ data: "sensitive" }));
		});

		const response = await app.handle(
			new Request("http://localhost/secret", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.encryptHistory).toBe(true);
	});

	test("encryptHistory helper overrides global config", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
			encryptHistory: false,
		});

		const secretPage = definePage({
			component: "Secret",
			props: {
				data: prop<string>(),
			},
		});

		const app = new Elysia().use(plugin).get("/secret", ({ inertia }) => {
			inertia.encryptHistory();
			return inertia.render(secretPage({ data: "sensitive" }));
		});

		const response = await app.handle(
			new Request("http://localhost/secret", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.encryptHistory).toBe(true);
	});

	test("clearHistory helper works", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const logoutPage = definePage({
			component: "Logout",
			props: {
				message: prop<string>(),
			},
		});

		const app = new Elysia().use(plugin).get("/logout", ({ inertia }) => {
			inertia.clearHistory();
			return inertia.render(logoutPage({ message: "Logged out" }));
		});

		const response = await app.handle(
			new Request("http://localhost/logout", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.clearHistory).toBe(true);
	});
});

describe("Partial reloads", () => {
	test("returns only requested props via X-Inertia-Partial-Data", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const usersPage = definePage({
			component: "Users/Index",
			props: {
				users: prop<string[]>(),
				companies: prop<string[]>(),
				roles: prop<string[]>(),
			},
		});

		const app = new Elysia().use(plugin).get("/users", ({ inertia }) => {
			return inertia.render(
				usersPage({
					users: ["Alice", "Bob"],
					companies: ["Acme", "Corp"],
					roles: ["admin", "user"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/users", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Users/Index",
					"X-Inertia-Partial-Data": "users",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.users).toEqual(["Alice", "Bob"]);
		expect(page.props.companies).toBeUndefined();
		expect(page.props.roles).toBeUndefined();
		expect(page.props.errors).toEqual({});
	});

	test("excludes props via X-Inertia-Partial-Except", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const usersPage = definePage({
			component: "Users/Index",
			props: {
				users: prop<string[]>(),
				companies: prop<string[]>(),
				roles: prop<string[]>(),
			},
		});

		const app = new Elysia().use(plugin).get("/users", ({ inertia }) => {
			return inertia.render(
				usersPage({
					users: ["Alice", "Bob"],
					companies: ["Acme", "Corp"],
					roles: ["admin", "user"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/users", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Users/Index",
					"X-Inertia-Partial-Except": "companies",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.users).toEqual(["Alice", "Bob"]);
		expect(page.props.companies).toBeUndefined();
		expect(page.props.roles).toEqual(["admin", "user"]);
	});

	test("except takes precedence over only", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const usersPage = definePage({
			component: "Users/Index",
			props: {
				users: prop<string[]>(),
				companies: prop<string[]>(),
			},
		});

		const app = new Elysia().use(plugin).get("/users", ({ inertia }) => {
			return inertia.render(
				usersPage({
					users: ["Alice"],
					companies: ["Acme"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/users", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Users/Index",
					"X-Inertia-Partial-Data": "users,companies",
					"X-Inertia-Partial-Except": "companies",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.users).toEqual(["Alice"]);
		expect(page.props.companies).toBeUndefined();
	});

	test("partial reload for different component returns all props", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const usersPage = definePage({
			component: "Users/Index",
			props: {
				users: prop<string[]>(),
				companies: prop<string[]>(),
			},
		});

		const app = new Elysia().use(plugin).get("/users", ({ inertia }) => {
			return inertia.render(
				usersPage({
					users: ["Alice"],
					companies: ["Acme"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/users", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "DifferentComponent",
					"X-Inertia-Partial-Data": "users",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.users).toEqual(["Alice"]);
		expect(page.props.companies).toEqual(["Acme"]);
	});
});

describe("Deferred props", () => {
	test("deferred props are not resolved on initial visit", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		let commentsResolved = false;

		const postPage = definePage({
			component: "Post/Show",
			props: {
				title: prop<string>(),
				comments: prop<string[]>().deferred(),
			},
		});

		const app = new Elysia().use(plugin).get("/post", ({ inertia }) => {
			return inertia.render(
				postPage({
					title: "Hello",
					comments: () => {
						commentsResolved = true;
						return ["comment1", "comment2"];
					},
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/post", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.title).toBe("Hello");
		expect(page.props.comments).toBeUndefined();
		expect(page.deferredProps).toEqual({ default: ["comments"] });
		expect(commentsResolved).toBe(false);
	});

	test("deferred props are resolved when requested via partial reload", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const postPage = definePage({
			component: "Post/Show",
			props: {
				title: prop<string>(),
				comments: prop<string[]>().deferred(),
			},
		});

		const app = new Elysia().use(plugin).get("/post", ({ inertia }) => {
			return inertia.render(
				postPage({
					title: "Hello",
					comments: () => ["comment1", "comment2"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/post", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Post/Show",
					"X-Inertia-Partial-Data": "comments",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.comments).toEqual(["comment1", "comment2"]);
		expect(page.props.title).toBeUndefined();
	});
});

describe("Once props", () => {
	test("once props are skipped when in X-Inertia-Except-Once-Props", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		let plansResolved = false;

		const plansPage = definePage({
			component: "Plans/Index",
			props: {
				title: prop<string>(),
				plans: prop<string[]>().once(),
			},
		});

		const app = new Elysia().use(plugin).get("/plans", ({ inertia }) => {
			return inertia.render(
				plansPage({
					title: "Pricing",
					plans: () => {
						plansResolved = true;
						return ["basic", "pro"];
					},
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/plans", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Except-Once-Props": "plans",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.title).toBe("Pricing");
		expect(page.props.plans).toBeUndefined();
		expect(plansResolved).toBe(false);
	});

	test("once props are included when not in except list", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const plansPage = definePage({
			component: "Plans/Index",
			props: {
				title: prop<string>(),
				plans: prop<string[]>().once(),
			},
		});

		const app = new Elysia().use(plugin).get("/plans", ({ inertia }) => {
			return inertia.render(
				plansPage({
					title: "Pricing",
					plans: () => ["basic", "pro"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/plans", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.title).toBe("Pricing");
		expect(page.props.plans).toEqual(["basic", "pro"]);
	});
});

describe("Optional and Always props", () => {
	test("optional props are not included on standard visits", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const dashboardPage = definePage({
			component: "Dashboard",
			props: {
				title: prop<string>(),
				heavyData: prop<string[]>().optional(),
			},
		});

		const app = new Elysia().use(plugin).get("/dashboard", ({ inertia }) => {
			return inertia.render(
				dashboardPage({
					title: "Dashboard",
					heavyData: ["lots", "of", "data"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/dashboard", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.title).toBe("Dashboard");
		// Optional props should not be included on standard visits
		expect(page.props.heavyData).toBeUndefined();
	});

	test("optional props are included when explicitly requested", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const dashboardPage = definePage({
			component: "Dashboard",
			props: {
				title: prop<string>(),
				heavyData: prop<string[]>().optional(),
			},
		});

		const app = new Elysia().use(plugin).get("/dashboard", ({ inertia }) => {
			return inertia.render(
				dashboardPage({
					title: "Dashboard",
					heavyData: ["lots", "of", "data"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/dashboard", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Dashboard",
					"X-Inertia-Partial-Data": "heavyData",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.heavyData).toEqual(["lots", "of", "data"]);
	});

	test("always props are included even in partial reloads that dont request them", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const dashboardPage = definePage({
			component: "Dashboard",
			props: {
				title: prop<string>(),
				auth: prop<{ user: string }>().always(),
				data: prop<string[]>(),
			},
		});

		const app = new Elysia().use(plugin).get("/dashboard", ({ inertia }) => {
			return inertia.render(
				dashboardPage({
					title: "Dashboard",
					auth: { user: "john" },
					data: ["item1", "item2"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/dashboard", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Dashboard",
					"X-Inertia-Partial-Data": "data",
				},
			}),
		);

		const page = await response.json();
		expect(page.props.data).toEqual(["item1", "item2"]);
		expect(page.props.auth).toEqual({ user: "john" });
		expect(page.props.title).toBeUndefined();
	});
});

describe("Unified prop values API", () => {
	test("prop() accepts literal value", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const page = definePage({
			component: "Test",
			props: {
				title: prop<string>(),
			},
		});

		const app = new Elysia().use(plugin).get("/test", ({ inertia }) => {
			return inertia.render(
				page({
					title: "Literal Value",
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const result = await response.json();
		expect(result.props.title).toBe("Literal Value");
	});

	test("prop() accepts resolver function", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const page = definePage({
			component: "Test",
			props: {
				title: prop<string>(),
			},
		});

		const app = new Elysia().use(plugin).get("/test", ({ inertia }) => {
			return inertia.render(
				page({
					title: () => "Resolved Value",
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const result = await response.json();
		expect(result.props.title).toBe("Resolved Value");
	});

	test("prop() resolver is only called when prop is included", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		let resolveCalled = false;

		const page = definePage({
			component: "Test",
			props: {
				title: prop<string>(),
				expensive: prop<string>(),
			},
		});

		const app = new Elysia().use(plugin).get("/test", ({ inertia }) => {
			return inertia.render(
				page({
					title: "Hello",
					expensive: () => {
						resolveCalled = true;
						return "Expensive";
					},
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Test",
					"X-Inertia-Partial-Data": "title",
				},
			}),
		);

		const result = await response.json();
		expect(result.props.title).toBe("Hello");
		expect(result.props.expensive).toBeUndefined();
		expect(resolveCalled).toBe(false);
	});

	test("mergedProp() accepts resolver function", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const page = definePage({
			component: "Test",
			props: {
				items: mergedProp<{ id: number }[]>({ matchOn: "id" }),
			},
		});

		const app = new Elysia().use(plugin).get("/test", ({ inertia }) => {
			return inertia.render(
				page({
					items: () => [{ id: 1 }, { id: 2 }],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const result = await response.json();
		expect(result.props.items).toEqual([{ id: 1 }, { id: 2 }]);
	});

	test("prop().once() accepts literal value", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const page = definePage({
			component: "Test",
			props: {
				config: prop<string[]>().once(),
			},
		});

		const app = new Elysia().use(plugin).get("/test", ({ inertia }) => {
			return inertia.render(
				page({
					config: ["a", "b", "c"],
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const result = await response.json();
		expect(result.props.config).toEqual(["a", "b", "c"]);
	});

	test("prop().deferred() accepts literal value", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const page = definePage({
			component: "Test",
			props: {
				title: prop<string>(),
				comments: prop<string[]>().deferred(),
			},
		});

		const app = new Elysia().use(plugin).get("/test", ({ inertia }) => {
			return inertia.render(
				page({
					title: "Hello",
					comments: ["comment1", "comment2"],
				}),
			);
		});

		// Request the deferred prop via partial reload
		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Test",
					"X-Inertia-Partial-Data": "comments",
				},
			}),
		);

		const result = await response.json();
		expect(result.props.comments).toEqual(["comment1", "comment2"]);
	});

	test("async resolver functions are awaited", async () => {
		const { plugin, definePage } = createInertiaWithAdapter({
			version: "1.0.0",
			render: renderPage,
		});

		const page = definePage({
			component: "Test",
			props: {
				data: prop<string>(),
			},
		});

		const app = new Elysia().use(plugin).get("/test", ({ inertia }) => {
			return inertia.render(
				page({
					data: async () => {
						await new Promise((resolve) => setTimeout(resolve, 10));
						return "Async Value";
					},
				}),
			);
		});

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
		);

		const result = await response.json();
		expect(result.props.data).toBe("Async Value");
	});
});

describe("Error bags", () => {
	test("staged errors are included in page props", async () => {
		const { definePage, createHelper } = createInertia({
			version: "1.0.0",
			render: renderPage,
		});

		// Create a mock flash adapter
		let flashData: Record<string, unknown> = {};
		const mockFlashAdapter: FlashAdapter = {
			getAll: () => flashData,
			set: (data) => {
				flashData = data;
			},
		};

		const formPage = definePage({
			component: "Form",
			props: {
				title: prop<string>(),
			},
		});

		const inertia = await createHelper({
			request: new Request("http://localhost/form", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
			flash: mockFlashAdapter,
		});

		// Stage errors
		inertia.errors({ email: "Email is required" });

		// Redirect to flash the errors
		inertia.redirect("/form");

		// Now simulate the follow-up request that reads the flashed errors
		const inertia2 = await createHelper({
			request: new Request("http://localhost/form", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
			flash: mockFlashAdapter,
		});

		const response = await inertia2.render(formPage({ title: "Contact" }));
		const page = await response.json();

		expect(page.props.errors).toEqual({
			default: { email: "Email is required" },
		});
	});

	test("error bag header shapes errors under bag key", async () => {
		const { definePage, createHelper } = createInertia({
			version: "1.0.0",
			render: renderPage,
		});

		// Create a mock flash adapter with pre-flashed errors
		const mockFlashAdapter: FlashAdapter = {
			getAll: () => ({
				_inertia_errors: {
					createUser: { name: "Name is required" },
				},
			}),
			set: () => {},
		};

		const formPage = definePage({
			component: "Form",
			props: {
				title: prop<string>(),
			},
		});

		const inertia = await createHelper({
			request: new Request("http://localhost/form", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Error-Bag": "createUser",
				},
			}),
			flash: mockFlashAdapter,
		});

		const response = await inertia.render(formPage({ title: "Contact" }));
		const page = await response.json();

		expect(page.props.errors).toEqual({
			createUser: { name: "Name is required" },
		});
	});

	test("returns empty errors when no errors exist", async () => {
		const { definePage, createHelper } = createInertia({
			version: "1.0.0",
			render: renderPage,
		});

		const mockFlashAdapter: FlashAdapter = {
			getAll: () => ({}),
			set: () => {},
		};

		const formPage = definePage({
			component: "Form",
			props: {
				title: prop<string>(),
			},
		});

		const inertia = await createHelper({
			request: new Request("http://localhost/form", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
				},
			}),
			flash: mockFlashAdapter,
		});

		const response = await inertia.render(formPage({ title: "Contact" }));
		const page = await response.json();

		expect(page.props.errors).toEqual({});
	});
});
