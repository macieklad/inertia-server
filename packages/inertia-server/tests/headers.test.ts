import { describe, expect, test } from "bun:test";
import { parseInertiaHeaders } from "../src/headers";

describe("parseInertiaHeaders", () => {
	test("parses X-Inertia header", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia": "true" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.isInertia).toBe(true);
	});

	test("returns false for missing X-Inertia header", () => {
		const request = new Request("http://localhost/");
		const headers = parseInertiaHeaders(request);
		expect(headers.isInertia).toBe(false);
	});

	test("parses X-Inertia-Version header", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Version": "abc123" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.version).toBe("abc123");
	});

	test("parses X-Inertia-Partial-Component header", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Partial-Component": "Users/Index" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.partialComponent).toBe("Users/Index");
	});

	test("parses X-Inertia-Partial-Data as comma-separated list", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Partial-Data": "users, posts, comments" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.partialData).toEqual(["users", "posts", "comments"]);
	});

	test("parses X-Inertia-Partial-Except as comma-separated list", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Partial-Except": "auth,flash" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.partialExcept).toEqual(["auth", "flash"]);
	});

	test("parses X-Inertia-Reset as comma-separated list", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Reset": "results,filters" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.resetProps).toEqual(["results", "filters"]);
	});

	test("parses X-Inertia-Error-Bag header", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Error-Bag": "createUser" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.errorBag).toBe("createUser");
	});

	test("parses X-Inertia-Except-Once-Props header", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Except-Once-Props": "plans,config" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.exceptOnceProps).toEqual(["plans", "config"]);
	});

	test("parses X-Inertia-Infinite-Scroll-Merge-Intent with append", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Infinite-Scroll-Merge-Intent": "append" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.scrollMergeIntent).toBe("append");
	});

	test("returns null for invalid scroll merge intent", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Infinite-Scroll-Merge-Intent": "invalid" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.scrollMergeIntent).toBeNull();
	});

	test("parses Purpose: prefetch header", () => {
		const request = new Request("http://localhost/", {
			headers: { Purpose: "prefetch" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.isPrefetch).toBe(true);
	});

	test("returns false for missing Purpose header", () => {
		const request = new Request("http://localhost/");
		const headers = parseInertiaHeaders(request);
		expect(headers.isPrefetch).toBe(false);
	});

	test("handles empty comma-separated lists", () => {
		const request = new Request("http://localhost/", {
			headers: { "X-Inertia-Partial-Data": "" },
		});
		const headers = parseInertiaHeaders(request);
		expect(headers.partialData).toEqual([]);
	});
});
