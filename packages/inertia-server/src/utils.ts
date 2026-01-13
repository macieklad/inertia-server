import type { InertiaPage } from "./types";

export function isInertiaPage(value: unknown): value is InertiaPage {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const page = value as Record<string, unknown>;

	return (
		typeof page.component === "string" &&
		typeof page.props === "object" &&
		page.props !== null &&
		typeof page.url === "string" &&
		typeof page.version === "string"
	);
}

export function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;

	if (typeof a !== typeof b) return false;
	if (a === null || b === null) return a === b;

	if (typeof a !== "object") return false;

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((item, index) => deepEqual(item, b[index]));
	}

	if (Array.isArray(a) || Array.isArray(b)) return false;

	const aKeys = Object.keys(a as object);
	const bKeys = Object.keys(b as object);

	if (aKeys.length !== bKeys.length) return false;

	return aKeys.every((key) =>
		deepEqual(
			(a as Record<string, unknown>)[key],
			(b as Record<string, unknown>)[key],
		),
	);
}
