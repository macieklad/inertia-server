import type { Context, MiddlewareHandler } from "hono";
import type { CreateHelperFn, FlashAdapter, InertiaHelper } from "./types";

declare module "hono" {
	interface ContextVariableMap {
		inertia: InertiaHelper;
	}
}

export function honoAdapter(
	createHelper: CreateHelperFn,
	createFlashAdapter?: (ctx: Context) => FlashAdapter,
): MiddlewareHandler {
	return async function inertiaMiddleware(ctx, next) {
		const inertia = await createHelper({
			request: ctx.req.raw,
			flash: createFlashAdapter?.(ctx),
		});

		ctx.set("inertia", inertia);
		return next();
	};
}
