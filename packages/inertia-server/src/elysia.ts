/**
 * Elysia Adapter for Inertia Server
 *
 * This module provides the Elysia-specific integration for Inertia.js.
 */

import { type Context, Elysia } from "elysia";
import type { CreateHelperFn } from "./types";

/**
 * Elysia adapter for Inertia.js.
 *
 * Creates an Elysia plugin that injects the `inertia` helper into the request context.
 * Optionally accepts a flash factory to inject flash functions bound to the context.
 *
 * @example
 * ```ts
 * import { createInertia, prop } from "inertia-server";
 * import { elysiaAdapter } from "inertia-server/elysia";
 *
 * const { definePage, createHelper } = createInertia({
 *   version: "1.0.0",
 *   render: (page) => renderToString(<Root page={page} />),
 * });
 *
 * const inertiaPlugin = elysiaAdapter(createHelper, (ctx) => ({
 *   getAll: () => ctx.session?.flash ?? {},
 *   set: (data) => { ctx.session.flash = data; },
 * }));
 *
 * app.use(inertiaPlugin).get("/", ({ inertia }) => {
 *   return inertia.render(homePage({ title: "Home" }));
 * });
 * ```
 */
export function elysiaAdapter(
	createHelper: CreateHelperFn,
	createFlashAdapter?: (ctx: Context) => {
		getAll(): Record<string, unknown> | Promise<Record<string, unknown>>;
		set(data: Record<string, unknown>): void | Promise<void>;
	},
) {
	return new Elysia({ name: "inertia" })
		.derive(async (ctx) => {
			const inertia = await createHelper({
				request: ctx.request,
				flash: createFlashAdapter?.(ctx),
			});
			return { inertia };
		})
		.as("global");
}
