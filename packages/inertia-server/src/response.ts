/**
 * Inertia.js Response Builders
 *
 * Handles building HTML and JSON responses for Inertia requests.
 */

import type { InertiaPage } from "./types";

export const RESPONSE_HEADER_INERTIA = "X-Inertia";
export const RESPONSE_HEADER_LOCATION = "X-Inertia-Location";
export const RESPONSE_HEADER_VARY = "Vary";

/**
 * Creates an Inertia JSON response.
 *
 * @param page - The page object to send
 * @returns Response with JSON body and Inertia headers
 */
export function createJsonResponse(page: InertiaPage): Response {
	return new Response(JSON.stringify(page), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			[RESPONSE_HEADER_INERTIA]: "true",
			[RESPONSE_HEADER_VARY]: "X-Inertia",
		},
	});
}

export function createHtmlResponse(html: string): Response {
	return new Response(html, {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			[RESPONSE_HEADER_VARY]: "X-Inertia",
		},
	});
}

export function createRedirectResponse(
	url: string,
	status: 302 | 303 = 302,
): Response {
	return new Response(null, {
		status,
		headers: {
			Location: url,
			[RESPONSE_HEADER_VARY]: "X-Inertia",
		},
	});
}

export function createExternalRedirectResponse(url: string): Response {
	return new Response(null, {
		status: 409,
		headers: {
			[RESPONSE_HEADER_LOCATION]: url,
		},
	});
}

export function createVersionConflictResponse(url: string): Response {
	return new Response(null, {
		status: 409,
		headers: {
			[RESPONSE_HEADER_LOCATION]: url,
		},
	});
}

export function getRedirectStatus(
	method: string,
	preferredStatus: 302 | 303 = 302,
): 302 | 303 {
	if (["PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
		return 303;
	}
	return preferredStatus;
}

export function checkVersionMatch(
	clientVersion: string | null,
	serverVersion: string,
): boolean {
	if (!clientVersion) {
		return true;
	}
	return clientVersion === serverVersion;
}

export function createDataPageAttribute(page: InertiaPage): string {
	return JSON.stringify(page);
}
