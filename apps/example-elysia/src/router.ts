import { type Context, Elysia } from "elysia";
import { elysiaAdapter } from "inertia-server/elysia";
import { createHelper } from "./inertia";
import { sessionStore } from "./session";

const inertiaPlugin = elysiaAdapter(createHelper, (ctx) => {
	const { sessionId } = ctx as unknown as Context & { sessionId: string };

	return {
		getAll: () => sessionStore.getFlash(sessionId),
		set: (data) => {
			sessionStore.setFlash(sessionId, data);
		},
	};
});

export const router = new Elysia({ name: "router" })
	.derive(async (ctx) => {
		return { sessionId: sessionStore.getSessionId(ctx.request) };
	})
	.use(inertiaPlugin)
	.onAfterHandle((ctx) => {
		ctx.set.headers["Set-Cookie"] = sessionStore.createCookieHeader(
			ctx.sessionId,
		);
	})
	.as("global");
