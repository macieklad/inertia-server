/**
 * Inertia protocol defines a set of headers that are used to communicate with the client.
 * This module captures those constants and provides parsing utilities for simplicity.
 */
import type { InertiaRequestOptions, MergeIntent } from "./types";

export const HEADER_INERTIA = "x-inertia";
export const HEADER_VERSION = "x-inertia-version";
export const HEADER_PARTIAL_COMPONENT = "x-inertia-partial-component";
export const HEADER_PARTIAL_DATA = "x-inertia-partial-data";
export const HEADER_PARTIAL_EXCEPT = "x-inertia-partial-except";
export const HEADER_RESET = "x-inertia-reset";
export const HEADER_ERROR_BAG = "x-inertia-error-bag";
export const HEADER_EXCEPT_ONCE_PROPS = "x-inertia-except-once-props";
export const HEADER_SCROLL_MERGE_INTENT =
	"x-inertia-infinite-scroll-merge-intent";
export const HEADER_PURPOSE = "purpose";

/**
 * Parses all Inertia request headers from a Request object.
 *
 * @param request - The incoming Request object
 * @returns Parsed header values
 *
 * @example
 * ```ts
 * const headers = parseInertiaHeaders(request);
 * if (headers.isInertia) {
 *   // Handle as Inertia request
 * }
 * ```
 */
export function parseInertiaHeaders(request: Request): InertiaRequestOptions {
	const headers = request.headers;

	return {
		isInertia: headers.get(HEADER_INERTIA) === "true",
		version: headers.get(HEADER_VERSION),
		partialComponent: headers.get(HEADER_PARTIAL_COMPONENT),
		partialData: parseCommaSeparated(headers.get(HEADER_PARTIAL_DATA)),
		partialExcept: parseCommaSeparated(headers.get(HEADER_PARTIAL_EXCEPT)),
		resetProps: parseCommaSeparated(headers.get(HEADER_RESET)),
		errorBag: headers.get(HEADER_ERROR_BAG),
		exceptOnceProps: parseCommaSeparated(headers.get(HEADER_EXCEPT_ONCE_PROPS)),
		scrollMergeIntent: parseMergeIntent(
			headers.get(HEADER_SCROLL_MERGE_INTENT),
		),
		isPrefetch: headers.get(HEADER_PURPOSE)?.toLowerCase() === "prefetch",
	};
}

function parseCommaSeparated(value: string | null): string[] {
	if (!value) return [];
	return value
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

function parseMergeIntent(value: string | null): MergeIntent | null {
	if (!value) return null;
	const normalized = value.toLowerCase().trim();
	if (normalized === "append" || normalized === "prepend") {
		return normalized;
	}
	return null;
}
