/**
 * Inertia.js Response Builders
 *
 * Handles building HTML and JSON responses for Inertia requests.
 */

import type { InertiaPage, InertiaRequestOptions } from "./types";

// =============================================================================
// Response Headers
// =============================================================================

export const RESPONSE_HEADER_INERTIA = "X-Inertia";
export const RESPONSE_HEADER_LOCATION = "X-Inertia-Location";
export const RESPONSE_HEADER_VARY = "Vary";

// =============================================================================
// Response Builders
// =============================================================================

/**
 * Creates an Inertia JSON response.
 *
 * @param page - The page object to send
 * @returns Response with JSON body and Inertia headers
 */
export function createJsonResponse(
  page: InertiaPage,
  _requestOptions?: InertiaRequestOptions
): Response {
  return new Response(JSON.stringify(page), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      [RESPONSE_HEADER_INERTIA]: "true",
      [RESPONSE_HEADER_VARY]: "X-Inertia",
    },
  });
}

/**
 * Creates an Inertia HTML response.
 *
 * @param html - The rendered HTML content
 * @returns Response with HTML body
 */
export function createHtmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      [RESPONSE_HEADER_VARY]: "X-Inertia",
    },
  });
}

/**
 * Creates an internal redirect response.
 *
 * @param url - The URL to redirect to
 * @param status - 302 or 303 status code (303 for non-GET after form submission)
 * @returns Redirect response
 */
export function createRedirectResponse(
  url: string,
  status: 302 | 303 = 302
): Response {
  return new Response(null, {
    status,
    headers: {
      Location: url,
      [RESPONSE_HEADER_VARY]: "X-Inertia",
    },
  });
}

/**
 * Creates an external redirect response (409 Conflict).
 * This tells the client to do a full page navigation via window.location.
 *
 * @param url - The URL to redirect to
 * @returns 409 Conflict response with X-Inertia-Location header
 */
export function createExternalRedirectResponse(url: string): Response {
  return new Response(null, {
    status: 409,
    headers: {
      [RESPONSE_HEADER_LOCATION]: url,
    },
  });
}

/**
 * Creates a version conflict response (409 Conflict).
 * This tells the client to do a full page reload due to asset version mismatch.
 *
 * @param url - The current request URL
 * @returns 409 Conflict response with X-Inertia-Location header
 */
export function createVersionConflictResponse(url: string): Response {
  return new Response(null, {
    status: 409,
    headers: {
      [RESPONSE_HEADER_LOCATION]: url,
    },
  });
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Determines the appropriate redirect status code.
 * Converts 302 to 303 for non-GET requests to prevent form resubmission.
 *
 * @param method - The HTTP method of the original request
 * @param preferredStatus - The preferred status code
 * @returns The appropriate status code
 */
export function getRedirectStatus(
  method: string,
  preferredStatus: 302 | 303 = 302
): 302 | 303 {
  // For PUT, PATCH, DELETE requests, use 303 to force GET on redirect
  if (["PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
    return 303;
  }
  return preferredStatus;
}

/**
 * Checks if the asset version matches.
 *
 * @param clientVersion - Version from X-Inertia-Version header
 * @param serverVersion - Current server version
 * @returns True if versions match or client version is not provided
 */
export function checkVersionMatch(
  clientVersion: string | null,
  serverVersion: string
): boolean {
  // If no client version, it's an initial request - no conflict
  if (!clientVersion) {
    return true;
  }
  return clientVersion === serverVersion;
}

/**
 * Creates the data-page attribute value (JSON string).
 */
export function createDataPageAttribute(page: InertiaPage): string {
  return JSON.stringify(page);
}

/**
 * Encodes the page object for the data-page attribute with HTML entity escaping.
 */
export function encodePageForAttribute(page: InertiaPage): string {
  return JSON.stringify(page).replace(/'/g, "&#039;").replace(/"/g, "&quot;");
}
