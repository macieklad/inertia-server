import { type Context, Elysia } from "elysia";
import type { CreateHelperFn, FlashAdapter } from "./types";

export function elysiaAdapter(
	createHelper: CreateHelperFn,
	createFlashAdapter?: (ctx: Context) => FlashAdapter,
) {
	return new Elysia()
		.derive(async (ctx) => {
			const inertia = await createHelper({
				request: ctx.request,
				flash: createFlashAdapter?.(ctx),
			});
			return { inertia };
		})
		.as("global");
}
