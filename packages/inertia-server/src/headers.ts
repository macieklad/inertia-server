/**
 * Inertia.js Request Header Parsing
 *
 * Parses all X-Inertia-* headers from incoming requests.
 */

import type { InertiaRequestOptions, MergeIntent } from "./types";

// =============================================================================
// Header Constants
// =============================================================================

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

// =============================================================================
// Main Parser
// =============================================================================

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
		isPrefetch: headers.get(HEADER_PURPOSE) === "prefetch",
	};
}

// =============================================================================
// Request Inspection Utilities
// =============================================================================

/**
 * Checks if the request is a partial reload request.
 */
export function isPartialReload(headers: InertiaRequestOptions): boolean {
	return headers.partialComponent !== null;
}

/**
 * Checks if the request is for a specific component (partial reload validation).
 */
export function isPartialReloadFor(
	headers: InertiaRequestOptions,
	component: string,
): boolean {
	return headers.partialComponent === component;
}

/**
 * Determines which props should be included based on partial reload headers.
 *
 * @param options - Parsed Inertia headers
 * @param availableProps - All available prop keys
 * @param component - The current page component name
 * @returns Array of prop keys to include
 */
export function getPropsToInclude(
	options: InertiaRequestOptions,
	availableProps: string[],
	component: string,
): string[] {
	if (!options.partialComponent || options.partialComponent !== component) {
		return availableProps;
	}

	let result = availableProps;

	if (options.partialExcept.length > 0) {
		result = result.filter((key) => !options.partialExcept.includes(key));
	} else if (options.partialData.length > 0) {
		result = result.filter((key) => options.partialData.includes(key));
	}

	// Always include 'errors' prop
	if (!result.includes("errors") && availableProps.includes("errors")) {
		result.push("errors");
	}

	return result;
}

/**
 * Checks if a once prop should be skipped (already loaded on client).
 */
export function shouldSkipOnceProp(
	headers: InertiaRequestOptions,
	propKey: string,
): boolean {
	return headers.exceptOnceProps.includes(propKey);
}

/**
 * Checks if a prop should be reset before merging.
 */
export function shouldResetProp(
	headers: InertiaRequestOptions,
	propKey: string,
): boolean {
	return headers.resetProps.includes(propKey);
}

// =============================================================================
// Internal Helpers
// =============================================================================

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
