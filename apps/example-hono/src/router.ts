import { Hono } from "hono";
import { honoAdapter } from "inertia-server/hono";
import { createHelper } from "./inertia";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { sessionStore } from "./session";

export const router = new Hono();

router.use("*", async (c, next) => {
	const sessionId = sessionStore.getSessionId(c.req.raw);
	c.set("sessionId", sessionId);
	await next();
	c.header("Set-Cookie", sessionStore.createCookieHeader(sessionId));
});

router.use(
	"*",
	honoAdapter(createHelper, (ctx) => {
		const sessionId = String(ctx.get("sessionId"));
		return {
			getAll: () => sessionStore.getFlash(sessionId),
			set: (data) => {
				sessionStore.setFlash(sessionId, data);
			},
		};
	}),
);

router.route("/", authRoutes);
router.route("/", dashboardRoutes);
