import { Elysia } from "elysia";
import { elysiaAdapter } from "inertia-server/elysia";
import { createHelper } from "./inertia";
import { sessionStore } from "./session";

const inertiaPlugin = elysiaAdapter(createHelper, (ctx) => {
	const sessionId = sessionStore.getSessionId(ctx.request);
	const resolvedSessionId = sessionStore.getOrCreateSessionId(sessionId);

	if (!sessionId) {
		ctx.set.headers["Set-Cookie"] = sessionStore.createCookieHeader(resolvedSessionId);
	}

	return {
		getAll: () => sessionStore.getFlash(resolvedSessionId),
		set: (data) => {
			sessionStore.setFlash(resolvedSessionId, data);
			ctx.set.headers["Set-Cookie"] = sessionStore.createCookieHeader(resolvedSessionId);
		},
	};
});

export const router = new Elysia({ name: "router" })
	.use(inertiaPlugin)
	.as("global");
