import type { CreateHelperFn } from "./types";

type ElysiaContextLike = {
	request: Request;
	[key: string]: unknown;
};

type ElysiaPluginLike = {
	derive(
		handler: (ctx: ElysiaContextLike) => Promise<Record<string, unknown>>,
	): { as(scope: string): unknown };
};

export function elysiaAdapter(
	createHelper: CreateHelperFn,
	createFlashAdapter?: (ctx: ElysiaContextLike) => {
		getAll(): Record<string, unknown> | Promise<Record<string, unknown>>;
		set(data: Record<string, unknown>): void | Promise<void>;
	},
) {
	return ((app: ElysiaPluginLike) =>
		app
			.derive(async (ctx) => {
				const inertia = await createHelper({
					request: ctx.request,
					flash: createFlashAdapter?.(ctx),
				});
				return { inertia };
			})
			.as("global")) as unknown;
}
