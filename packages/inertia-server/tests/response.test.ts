import { describe, expect, test } from "bun:test";
import {
	checkVersionMatch,
	createDataPageAttribute,
	createExternalRedirectResponse,
	createHtmlResponse,
	createJsonResponse,
	createRedirectResponse,
	createVersionConflictResponse,
	getRedirectStatus,
} from "../src/response";
import type { InertiaPage } from "../src/types";

const samplePage: InertiaPage = {
	component: "Test/Page",
	props: { title: "Hello", errors: {}, flash: {} },
	url: "/test",
	version: "1.0.0",
	encryptHistory: false,
	clearHistory: false,
};

describe("createJsonResponse", () => {
	test("returns JSON response with correct content type", async () => {
		const response = createJsonResponse(samplePage);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("application/json");
	});

	test("sets X-Inertia header to true", () => {
		const response = createJsonResponse(samplePage);
		expect(response.headers.get("X-Inertia")).toBe("true");
	});

	test("sets Vary header to X-Inertia", () => {
		const response = createJsonResponse(samplePage);
		expect(response.headers.get("Vary")).toBe("X-Inertia");
	});

	test("body contains page object as JSON", async () => {
		const response = createJsonResponse(samplePage);
		const body = await response.json();

		expect(body.component).toBe("Test/Page");
		expect(body.props.title).toBe("Hello");
		expect(body.url).toBe("/test");
		expect(body.version).toBe("1.0.0");
	});
});

describe("createHtmlResponse", () => {
	test("returns HTML response with correct content type", () => {
		const response = createHtmlResponse("<html></html>");

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe(
			"text/html; charset=utf-8",
		);
	});

	test("sets Vary header to X-Inertia", () => {
		const response = createHtmlResponse("<html></html>");
		expect(response.headers.get("Vary")).toBe("X-Inertia");
	});

	test("body contains the HTML string", async () => {
		const html = "<html><body>Hello</body></html>";
		const response = createHtmlResponse(html);
		const body = await response.text();

		expect(body).toBe(html);
	});
});

describe("createRedirectResponse", () => {
	test("returns 302 redirect by default", () => {
		const response = createRedirectResponse("/new-location");

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/new-location");
	});

	test("returns 303 when specified", () => {
		const response = createRedirectResponse("/new-location", 303);

		expect(response.status).toBe(303);
		expect(response.headers.get("Location")).toBe("/new-location");
	});

	test("sets Vary header", () => {
		const response = createRedirectResponse("/new-location");
		expect(response.headers.get("Vary")).toBe("X-Inertia");
	});
});

describe("createExternalRedirectResponse", () => {
	test("returns 409 Conflict", () => {
		const response = createExternalRedirectResponse("https://example.com");
		expect(response.status).toBe(409);
	});

	test("sets X-Inertia-Location header", () => {
		const response = createExternalRedirectResponse("https://example.com");
		expect(response.headers.get("X-Inertia-Location")).toBe(
			"https://example.com",
		);
	});
});

describe("createVersionConflictResponse", () => {
	test("returns 409 Conflict", () => {
		const response = createVersionConflictResponse("/current-url");
		expect(response.status).toBe(409);
	});

	test("sets X-Inertia-Location header to current URL", () => {
		const response = createVersionConflictResponse("/current-url");
		expect(response.headers.get("X-Inertia-Location")).toBe("/current-url");
	});
});

describe("getRedirectStatus", () => {
	test("returns 302 for GET requests", () => {
		expect(getRedirectStatus("GET")).toBe(302);
		expect(getRedirectStatus("get")).toBe(302);
	});

	test("returns 302 for POST requests", () => {
		expect(getRedirectStatus("POST")).toBe(302);
	});

	test("returns 303 for PUT requests", () => {
		expect(getRedirectStatus("PUT")).toBe(303);
	});

	test("returns 303 for PATCH requests", () => {
		expect(getRedirectStatus("PATCH")).toBe(303);
	});

	test("returns 303 for DELETE requests", () => {
		expect(getRedirectStatus("DELETE")).toBe(303);
	});

	test("respects preferred status for non-special methods", () => {
		expect(getRedirectStatus("GET", 303)).toBe(303);
	});
});

describe("checkVersionMatch", () => {
	test("returns true when versions match", () => {
		expect(checkVersionMatch("1.0.0", "1.0.0")).toBe(true);
	});

	test("returns false when versions differ", () => {
		expect(checkVersionMatch("1.0.0", "2.0.0")).toBe(false);
	});

	test("returns true when client version is null (initial request)", () => {
		expect(checkVersionMatch(null, "1.0.0")).toBe(true);
	});
});

describe("createDataPageAttribute", () => {
	test("returns JSON string of page object", () => {
		const result = createDataPageAttribute(samplePage);
		const parsed = JSON.parse(result);

		expect(parsed.component).toBe("Test/Page");
		expect(parsed.props.title).toBe("Hello");
	});

	test("includes all page object properties", () => {
		const pageWithExtras: InertiaPage = {
			...samplePage,
			deferredProps: { default: ["comments"] },
			mergeProps: ["posts"],
		};

		const result = createDataPageAttribute(pageWithExtras);
		const parsed = JSON.parse(result);

		expect(parsed.deferredProps).toEqual({ default: ["comments"] });
		expect(parsed.mergeProps).toEqual(["posts"]);
	});
});

