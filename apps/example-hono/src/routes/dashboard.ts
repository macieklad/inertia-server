import { Hono } from "hono";
import { users } from "../db";
import { dashboardPage } from "../inertia";
import { sessionStore } from "../session";

export const dashboardRoutes = new Hono()
	.get("/dashboard", (c) => {
		const inertia = c.get("inertia");
		const sessionId = c.get("sessionId");
		const userId = sessionStore.getUserId(sessionId);

		if (!userId) {
			inertia.flash("error", "Sign in to continue.");
			return inertia.redirect("/login");
		}

		const user = users.getById(userId);
		if (!user) {
			sessionStore.clearUser(sessionId);
			inertia.flash("error", "Session expired. Sign in again.");
			return inertia.redirect("/login");
		}

		return inertia.render(
			dashboardPage({
				title: "Dashboard",
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
				},
				loginCount: users.countLogins(user.id),
			}),
		);
	})
	.post("/logout", (c) => {
		const inertia = c.get("inertia");
		sessionStore.clearUser(c.get("sessionId"));
		inertia.flash("success", "Signed out.");
		return inertia.redirect("/login");
	});
