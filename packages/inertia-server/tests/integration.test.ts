import { describe, expect, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { Elysia } from "elysia";
import { elysiaAdapter } from "../src/elysia";
import { createInertia, mergedProp, prop } from "../src/index";
import { inertia } from "../src/testing";
import type { FlashAdapter, InertiaPage } from "../src/types";

const renderPage = (page: InertiaPage) => {
	return `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<div id="app" data-page='${JSON.stringify(page)}'></div>
</body>
</html>`;
};

const defaultInertia = createInertia({ version: "1.0.0", render: renderPage });
const defaultPlugin = elysiaAdapter(defaultInertia.createHelper);
const { definePage } = defaultInertia;

const encryptedInertia = createInertia({
	version: "1.0.0",
	render: renderPage,
	encryptHistory: true,
});
const encryptedPlugin = elysiaAdapter(encryptedInertia.createHelper);

const pages = {
	home: definePage({
		component: "Home",
		props: { title: prop<string>(), appName: prop<string>() },
	}),
	users: definePage({
		component: "Users/Index",
		props: {
			users: prop<string[]>(),
			companies: prop<string[]>(),
			roles: prop<string[]>(),
		},
	}),
	post: definePage({
		component: "Post/Show",
		props: { title: prop<string>(), comments: prop<string[]>().deferred() },
	}),
	plans: definePage({
		component: "Plans/Index",
		props: { title: prop<string>(), plans: prop<string[]>().once() },
	}),
	dashboard: definePage({
		component: "Dashboard",
		props: {
			title: prop<string>(),
			heavyData: prop<string[]>().optional(),
			auth: prop<{ user: string }>().always(),
			data: prop<string[]>(),
		},
	}),
	testTitle: definePage({
		component: "Test",
		props: { title: prop<string>() },
	}),
	testExpensive: definePage({
		component: "Test",
		props: { title: prop<string>(), expensive: prop<string>() },
	}),
	testData: definePage({
		component: "Test",
		props: { data: prop<string>() },
	}),
	testConfig: definePage({
		component: "Test",
		props: { config: prop<string[]>().once() },
	}),
	testItems: definePage({
		component: "Test",
		props: { items: mergedProp<{ id: number }[]>({ matchOn: "id" }) },
	}),
	form: definePage({
		component: "Form",
		props: { title: prop<string>() },
	}),
	posts: definePage({
		component: "Posts/Index",
		props: { posts: mergedProp<{ id: number }[]>({ matchOn: "id" }) },
	}),
	scrollPosts: definePage({
		component: "ScrollPosts",
		props: {
			posts: mergedProp<{ id: number }[]>().scroll(),
		},
	}),
	scrollPostsCustomPage: definePage({
		component: "ScrollPostsCustom",
		props: {
			posts: mergedProp<{ id: number }[]>().scroll({ pageName: "p" }),
		},
	}),
	plansWithExpiry: definePage({
		component: "Plans/Index",
		props: { plans: prop<string[]>().once({ expiresAt: 123456789 }) },
	}),
	postWithSidebar: definePage({
		component: "Post/Show",
		props: {
			title: prop<string>(),
			comments: prop<{ id: number }[]>().deferred("sidebar"),
		},
	}),
	about: definePage({
		component: "About/Team",
		props: { members: prop<string[]>() },
	}),
	postSimple: definePage({
		component: "Post/Show",
		props: { title: prop<string>() },
	}),
	secret: encryptedInertia.definePage({
		component: "Secret",
		props: { data: prop<string>() },
	}),
	logout: definePage({
		component: "Logout",
		props: { message: prop<string>() },
	}),
	testDeferred: definePage({
		component: "Test",
		props: { title: prop<string>(), comments: prop<string[]>().deferred() },
	}),
};

const app = new Elysia()
	.use(defaultPlugin)
	.get("/", ({ inertia }) =>
		inertia.render(pages.home({ title: "Welcome", appName: "Test App" })),
	)
	.get("/users", ({ inertia }) =>
		inertia.render(
			pages.users({
				users: ["Alice", "Bob"],
				companies: ["Acme", "Corp"],
				roles: ["admin", "user"],
			}),
		),
	)
	.post("/users", ({ inertia }) => inertia.redirect("/users"))
	.get("/external", ({ inertia }) => inertia.location("https://example.com"))
	.get("/redirect", ({ inertia }) => inertia.redirect("/target"))
	.put("/update", ({ inertia }) => inertia.redirect("/target"))
	.get("/posts", ({ inertia }) =>
		inertia.render(pages.posts({ posts: [{ id: 1 }, { id: 2 }] })),
	)
	.get("/plans", ({ inertia }) =>
		inertia.render(pages.plansWithExpiry({ plans: () => ["basic", "pro"] })),
	)
	.get("/post", ({ inertia }) =>
		inertia.render(
			pages.postWithSidebar({ title: "Hello", comments: () => [{ id: 1 }] }),
		),
	)
	.get("/about-team", ({ inertia }) =>
		inertia.render(pages.about({ members: ["Alice", "Bob"] })),
	)
	.get("/posts/:id", ({ inertia, params }) =>
		inertia.render(
			pages.postSimple(
				{ title: "Custom Post" },
				{ url: `/posts/${params.id}` },
			),
		),
	)
	.get("/logout", ({ inertia }) => {
		inertia.clearHistory();
		return inertia.render(pages.logout({ message: "Logged out" }));
	})
	.get("/dashboard", ({ inertia }) =>
		inertia.render(
			pages.dashboard({
				title: "Dashboard",
				heavyData: ["lots", "of", "data"],
				auth: { user: "john" },
				data: ["item1", "item2"],
			}),
		),
	)
	.get("/test", ({ inertia }) =>
		inertia.render(pages.testTitle({ title: "Literal Value" })),
	)
	.get("/test/resolver", ({ inertia }) =>
		inertia.render(pages.testTitle({ title: () => "Resolved Value" })),
	)
	.get("/test/merged", ({ inertia }) =>
		inertia.render(pages.testItems({ items: () => [{ id: 1 }, { id: 2 }] })),
	)
	.get("/test/once", ({ inertia }) =>
		inertia.render(pages.testConfig({ config: ["a", "b", "c"] })),
	)
	.get("/test/deferred", ({ inertia }) =>
		inertia.render(
			pages.testDeferred({
				title: "Hello",
				comments: ["comment1", "comment2"],
			}),
		),
	)
	.get("/test/async", ({ inertia }) =>
		inertia.render(
			pages.testData({
				data: async () => {
					await new Promise((resolve) => setTimeout(resolve, 10));
					return "Async Value";
				},
			}),
		),
	)
	.get("/scroll-posts", ({ inertia, query }) => {
		const page = parseInt((query.page as string) ?? "1", 10);
		const hasMore = page < 3;
		return inertia.render(
			pages.scrollPosts({
				posts: [{ id: page * 10 + 1 }, { id: page * 10 + 2 }],
				$hasMore: { posts: hasMore },
			}),
		);
	})
	.group("/encrypted", (app) =>
		app
			.use(encryptedPlugin)
			.get("/secret", ({ inertia }) =>
				inertia.render(pages.secret({ data: "sensitive" })),
			),
	);

const api = treaty(app);

const inertiaHeaders = (
	options: {
		version?: string;
		partialComponent?: string;
		partialData?: string;
		partialExcept?: string;
		exceptOnceProps?: string;
	} = {},
) => {
	const headers: Record<string, string> = {
		"X-Inertia": "true",
		"X-Inertia-Version": options.version ?? "1.0.0",
	};
	if (options.partialComponent)
		headers["X-Inertia-Partial-Component"] = options.partialComponent;
	if (options.partialData)
		headers["X-Inertia-Partial-Data"] = options.partialData;
	if (options.partialExcept)
		headers["X-Inertia-Partial-Except"] = options.partialExcept;
	if (options.exceptOnceProps)
		headers["X-Inertia-Except-Once-Props"] = options.exceptOnceProps;
	return { headers };
};

describe("Initial HTML visit", () => {
	test("returns HTML response with page data", async () => {
		const { data, response } = await api.get();

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toContain("text/html");

		await inertia(data)
			.component("Home")
			.has("title", "Welcome")
			.has("appName", "Test App")
			.version("1.0.0")
			.assert();
	});
});

describe("Inertia XHR request", () => {
	test("returns JSON response for Inertia requests", async () => {
		const { data, response } = await api.users.get(inertiaHeaders());

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("application/json");
		expect(response.headers.get("X-Inertia")).toBe("true");
		expect(response.headers.get("Vary")).toBe("X-Inertia");

		await inertia(data)
			.component("Users/Index")
			.has("users", ["Alice", "Bob"])
			.assert();
	});

	test("returns 409 on version mismatch", async () => {
		const { response } = await api.users.get(
			inertiaHeaders({ version: "old-version" }),
		);

		expect(response.status).toBe(409);
		expect(response.headers.get("X-Inertia-Location")).toBe("/users");
	});
});

describe("Redirects", () => {
	test("redirect returns 302 for GET-like requests", async () => {
		const { response } = await api.redirect.get();

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/target");
	});

	test("redirect returns 303 for PUT requests", async () => {
		const { response } = await api.update.put();

		expect(response.status).toBe(303);
	});

	test("external redirect returns 409", async () => {
		const { response } = await api.external.get();

		expect(response.status).toBe(409);
		expect(response.headers.get("X-Inertia-Location")).toBe(
			"https://example.com",
		);
	});
});

describe("definePage integration", () => {
	test("mergedProp props are included in page object", async () => {
		const { data } = await api.posts.get(inertiaHeaders());

		await inertia(data)
			.tap((page) => {
				expect(page.mergeProps).toContain("posts");
				expect(page.matchPropsOn).toContain("posts.id");
			})
			.assert();
	});

	test("once props configuration is included", async () => {
		const { data } = await api.plans.get(inertiaHeaders());

		await inertia(data)
			.has("plans", ["basic", "pro"])
			.tap((page) => {
				expect(page.onceProps?.plans).toEqual({
					prop: "plans",
					expiresAt: 123456789,
				});
			})
			.assert();
	});

	test("deferred props are tracked", async () => {
		const { data } = await api.post.get(inertiaHeaders());

		await inertia(data)
			.has("title", "Hello")
			.tap((page) => {
				expect(page.deferredProps).toEqual({ sidebar: ["comments"] });
			})
			.assert();
	});

	test("url is injected from request when not provided", async () => {
		const { data } = await api["about-team"].get(inertiaHeaders());

		await inertia(data).url("/about-team").assert();
	});

	test("custom url can be provided at render time", async () => {
		const { data } = await api.posts({ id: "42" }).get(inertiaHeaders());

		await inertia(data).url("/posts/42").assert();
	});

	test("global encryptHistory config works", async () => {
		const { definePage, createHelper } = createInertia({
			version: "1.0.0",
			render: renderPage,
			encryptHistory: true,
		});
		const plugin = elysiaAdapter(createHelper);
		const secretPage = definePage({
			component: "Secret",
			props: { data: prop<string>() },
		});

		const testApp = new Elysia()
			.use(plugin)
			.get("/secret", ({ inertia }) =>
				inertia.render(secretPage({ data: "sensitive" })),
			);

		const response = await testApp.handle(
			new Request("http://localhost/secret", {
				headers: { "X-Inertia": "true", "X-Inertia-Version": "1.0.0" },
			}),
		);

		await inertia(response)
			.tap((page) => expect(page.encryptHistory).toBe(true))
			.assert();
	});

	test("encryptHistory helper overrides global config", async () => {
		const { definePage, createHelper } = createInertia({
			version: "1.0.0",
			render: renderPage,
			encryptHistory: false,
		});
		const plugin = elysiaAdapter(createHelper);
		const secretPage = definePage({
			component: "Secret",
			props: { data: prop<string>() },
		});

		const testApp = new Elysia().use(plugin).get("/secret", ({ inertia }) => {
			inertia.encryptHistory();
			return inertia.render(secretPage({ data: "sensitive" }));
		});

		const response = await testApp.handle(
			new Request("http://localhost/secret", {
				headers: { "X-Inertia": "true", "X-Inertia-Version": "1.0.0" },
			}),
		);

		await inertia(response)
			.tap((page) => expect(page.encryptHistory).toBe(true))
			.assert();
	});

	test("clearHistory helper works", async () => {
		const { data } = await api.logout.get(inertiaHeaders());

		await inertia(data)
			.tap((page) => expect(page.clearHistory).toBe(true))
			.assert();
	});
});

describe("Partial reloads", () => {
	test("returns only requested props via X-Inertia-Partial-Data", async () => {
		const { data } = await api.users.get(
			inertiaHeaders({ partialComponent: "Users/Index", partialData: "users" }),
		);

		await inertia(data)
			.has("users", ["Alice", "Bob"])
			.has("errors", {})
			.missing("companies")
			.missing("roles")
			.assert();
	});

	test("excludes props via X-Inertia-Partial-Except", async () => {
		const { data } = await api.users.get(
			inertiaHeaders({
				partialComponent: "Users/Index",
				partialExcept: "companies",
			}),
		);

		await inertia(data)
			.has("users", ["Alice", "Bob"])
			.has("roles", ["admin", "user"])
			.missing("companies")
			.assert();
	});

	test("except takes precedence over only", async () => {
		const { data } = await api.users.get(
			inertiaHeaders({
				partialComponent: "Users/Index",
				partialData: "users,companies",
				partialExcept: "companies",
			}),
		);

		await inertia(data)
			.has("users", ["Alice", "Bob"])
			.missing("companies")
			.assert();
	});

	test("partial reload for different component returns all props", async () => {
		const { data } = await api.users.get(
			inertiaHeaders({
				partialComponent: "DifferentComponent",
				partialData: "users",
			}),
		);

		await inertia(data)
			.has("users", ["Alice", "Bob"])
			.has("companies", ["Acme", "Corp"])
			.assert();
	});
});

describe("Deferred props", () => {
	test("deferred props are not resolved on initial visit", async () => {
		let commentsResolved = false;

		const testApp = new Elysia()
			.use(defaultPlugin)
			.get("/post", ({ inertia }) =>
				inertia.render(
					pages.post({
						title: "Hello",
						comments: () => {
							commentsResolved = true;
							return ["comment1", "comment2"];
						},
					}),
				),
			);

		const response = await testApp.handle(
			new Request("http://localhost/post", {
				headers: { "X-Inertia": "true", "X-Inertia-Version": "1.0.0" },
			}),
		);

		await inertia(response)
			.has("title", "Hello")
			.missing("comments")
			.tap((page) => {
				expect(page.deferredProps).toEqual({ default: ["comments"] });
			})
			.assert();
		expect(commentsResolved).toBe(false);
	});

	test("deferred props are resolved when requested via partial reload", async () => {
		const testApp = new Elysia()
			.use(defaultPlugin)
			.get("/post", ({ inertia }) =>
				inertia.render(
					pages.post({
						title: "Hello",
						comments: () => ["comment1", "comment2"],
					}),
				),
			);

		const response = await testApp.handle(
			new Request("http://localhost/post", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Post/Show",
					"X-Inertia-Partial-Data": "comments",
				},
			}),
		);

		await inertia(response)
			.has("comments", ["comment1", "comment2"])
			.missing("title")
			.assert();
	});
});

describe("Once props", () => {
	test("once props are skipped when in X-Inertia-Except-Once-Props", async () => {
		let plansResolved = false;

		const testApp = new Elysia()
			.use(defaultPlugin)
			.get("/plans", ({ inertia }) =>
				inertia.render(
					pages.plans({
						title: "Pricing",
						plans: () => {
							plansResolved = true;
							return ["basic", "pro"];
						},
					}),
				),
			);

		const response = await testApp.handle(
			new Request("http://localhost/plans", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Except-Once-Props": "plans",
				},
			}),
		);

		await inertia(response).has("title", "Pricing").missing("plans").assert();
		expect(plansResolved).toBe(false);
	});

	test("once props are included when not in except list", async () => {
		const testApp = new Elysia()
			.use(defaultPlugin)
			.get("/plans", ({ inertia }) =>
				inertia.render(
					pages.plans({ title: "Pricing", plans: () => ["basic", "pro"] }),
				),
			);

		const response = await testApp.handle(
			new Request("http://localhost/plans", {
				headers: { "X-Inertia": "true", "X-Inertia-Version": "1.0.0" },
			}),
		);

		await inertia(response)
			.has("title", "Pricing")
			.has("plans", ["basic", "pro"])
			.assert();
	});
});

describe("Optional and Always props", () => {
	test("optional props are not included on standard visits", async () => {
		const { data } = await api.dashboard.get(inertiaHeaders());

		await inertia(data).has("title", "Dashboard").missing("heavyData").assert();
	});

	test("optional props are included when explicitly requested", async () => {
		const { data } = await api.dashboard.get(
			inertiaHeaders({
				partialComponent: "Dashboard",
				partialData: "heavyData",
			}),
		);

		await inertia(data).has("heavyData", ["lots", "of", "data"]).assert();
	});

	test("always props are included even in partial reloads that dont request them", async () => {
		const { data } = await api.dashboard.get(
			inertiaHeaders({ partialComponent: "Dashboard", partialData: "data" }),
		);

		await inertia(data)
			.has("data", ["item1", "item2"])
			.has("auth", { user: "john" })
			.missing("title")
			.assert();
	});
});

describe("Unified prop values API", () => {
	test("prop() accepts literal value", async () => {
		const { data } = await api.test.get(inertiaHeaders());

		await inertia(data).has("title", "Literal Value").assert();
	});

	test("prop() accepts resolver function", async () => {
		const { data } = await api.test.resolver.get(inertiaHeaders());

		await inertia(data).has("title", "Resolved Value").assert();
	});

	test("prop() resolver is only called when prop is included", async () => {
		let resolveCalled = false;

		const testApp = new Elysia()
			.use(defaultPlugin)
			.get("/test", ({ inertia }) =>
				inertia.render(
					pages.testExpensive({
						title: "Hello",
						expensive: () => {
							resolveCalled = true;
							return "Expensive";
						},
					}),
				),
			);

		const response = await testApp.handle(
			new Request("http://localhost/test", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Partial-Component": "Test",
					"X-Inertia-Partial-Data": "title",
				},
			}),
		);

		await inertia(response).has("title", "Hello").missing("expensive").assert();
		expect(resolveCalled).toBe(false);
	});

	test("mergedProp() accepts resolver function", async () => {
		const { data } = await api.test.merged.get(inertiaHeaders());

		await inertia(data)
			.has("items", [{ id: 1 }, { id: 2 }])
			.assert();
	});

	test("prop().once() accepts literal value", async () => {
		const { data } = await api.test.once.get(inertiaHeaders());

		await inertia(data).has("config", ["a", "b", "c"]).assert();
	});

	test("prop().deferred() accepts literal value", async () => {
		const { data } = await api.test.deferred.get(
			inertiaHeaders({ partialComponent: "Test", partialData: "comments" }),
		);

		await inertia(data).has("comments", ["comment1", "comment2"]).assert();
	});

	test("async resolver functions are awaited", async () => {
		const { data } = await api.test.async.get(inertiaHeaders());

		await inertia(data).has("data", "Async Value").assert();
	});
});

describe("scrollProps with $hasMore", () => {
	test("scrollProps.nextPage is set when $hasMore is true", async () => {
		const { data } = await api["scroll-posts"].get();

		await inertia(data)
			.has("posts", [{ id: 11 }, { id: 12 }])
			.tap((page) => {
				expect(page.scrollProps?.posts).toEqual({
					pageName: "page",
					previousPage: null,
					nextPage: 2,
					currentPage: 1,
				});
			})
			.assert();
	});

	test("scrollProps.nextPage is null when $hasMore is false", async () => {
		const { data } = await api["scroll-posts"].get({
			query: { page: "3" },
		});

		await inertia(data)
			.tap((page) => {
				expect(page.scrollProps).toBeDefined();
				expect(page.scrollProps?.posts).toEqual({
					pageName: "page",
					previousPage: 2,
					nextPage: null,
					currentPage: 3,
				});
			})
			.assert();
	});

	test("scrollProps.previousPage is set based on currentPage", async () => {
		const { data } = await api["scroll-posts"].get({
			query: { page: "2" },
		});

		await inertia(data)
			.tap((page) => {
				expect(page.scrollProps?.posts).toEqual({
					pageName: "page",
					previousPage: 1,
					nextPage: 3,
					currentPage: 2,
				});
			})
			.assert();
	});

	test("scrollOptions is accessible from page definition", () => {
		expect(pages.scrollPosts.scrollOptions).toEqual({
			posts: { pageName: "page" },
		});
	});

	test("scrollOptions is empty for pages without scroll props", () => {
		expect(pages.home.scrollOptions).toEqual({});
	});

	test("scroll() without args uses default pageName 'page'", () => {
		expect(pages.scrollPosts.scrollOptions.posts.pageName).toBe("page");
	});

	test("scroll() with custom pageName uses provided value", () => {
		expect(pages.scrollPostsCustomPage.scrollOptions.posts.pageName).toBe("p");
	});
});

describe("Error bags", () => {
	test("staged errors are included in page props", async () => {
		let flashData: Record<string, unknown> = {};
		const mockFlashAdapter: FlashAdapter = {
			getAll: () => flashData,
			set: (data) => {
				flashData = data;
			},
		};

		const helper = await defaultInertia.createHelper({
			request: new Request("http://localhost/form", {
				headers: { "X-Inertia": "true", "X-Inertia-Version": "1.0.0" },
			}),
			flash: mockFlashAdapter,
		});

		helper.errors({ email: "Email is required" });
		helper.redirect("/form");

		const helper2 = await defaultInertia.createHelper({
			request: new Request("http://localhost/form", {
				headers: { "X-Inertia": "true", "X-Inertia-Version": "1.0.0" },
			}),
			flash: mockFlashAdapter,
		});

		const response = await helper2.render(pages.form({ title: "Contact" }));

		await inertia(response)
			.has("errors", { default: { email: "Email is required" } })
			.assert();
	});

	test("error bag header shapes errors under bag key", async () => {
		const mockFlashAdapter: FlashAdapter = {
			getAll: () => ({
				_inertia_errors: { createUser: { name: "Name is required" } },
			}),
			set: () => {},
		};

		const helper = await defaultInertia.createHelper({
			request: new Request("http://localhost/form", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Error-Bag": "createUser",
				},
			}),
			flash: mockFlashAdapter,
		});

		const response = await helper.render(pages.form({ title: "Contact" }));

		await inertia(response)
			.has("errors", { createUser: { name: "Name is required" } })
			.assert();
	});

	test("error bag header excludes other bags", async () => {
		const mockFlashAdapter: FlashAdapter = {
			getAll: () => ({
				_inertia_errors: {
					createUser: { name: "Name is required" },
					login: { email: "Email is invalid" },
				},
			}),
			set: () => {},
		};

		const helper = await defaultInertia.createHelper({
			request: new Request("http://localhost/form", {
				headers: {
					"X-Inertia": "true",
					"X-Inertia-Version": "1.0.0",
					"X-Inertia-Error-Bag": "createUser",
				},
			}),
			flash: mockFlashAdapter,
		});

		const response = await helper.render(pages.form({ title: "Contact" }));

		await inertia(response)
			.has("errors.createUser", { name: "Name is required" })
			.missing("errors.login")
			.assert();
	});

	test("returns empty errors when no errors exist", async () => {
		const mockFlashAdapter: FlashAdapter = {
			getAll: () => ({}),
			set: () => {},
		};

		const helper = await defaultInertia.createHelper({
			request: new Request("http://localhost/form", {
				headers: { "X-Inertia": "true", "X-Inertia-Version": "1.0.0" },
			}),
			flash: mockFlashAdapter,
		});

		const response = await helper.render(pages.form({ title: "Contact" }));

		await inertia(response).has("errors", {}).assert();
	});
});
