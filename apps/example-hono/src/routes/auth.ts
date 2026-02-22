import { type Context, Hono } from "hono";
import { users } from "../db";
import { loginPage } from "../inertia";
import { sessionStore } from "../session";

type LoginFormBody = {
	email: string;
	password: string;
};

function getTextValue(value: unknown): string {
	if (typeof value === "string") {
		return value.trim();
	}

	if (Array.isArray(value)) {
		const firstValue = value[0];
		return typeof firstValue === "string" ? firstValue.trim() : "";
	}

	return "";
}

async function parseLoginBody(c: Context) {
	const contentType = c.req.header("content-type") ?? "";
	if (contentType.includes("application/json")) {
		const body = (await c.req.json().catch(() => ({}))) as Record<
			string,
			unknown
		>;
		return {
			email: getTextValue(body.email),
			password: getTextValue(body.password),
		} satisfies LoginFormBody;
	}

	const body = await c.req.parseBody();
	return {
		email: getTextValue(body.email),
		password: getTextValue(body.password),
	} satisfies LoginFormBody;
}

export const authRoutes = new Hono()
	.get("/", (c) => {
		const inertia = c.get("inertia");
		const userId = sessionStore.getUserId(c.get("sessionId"));

		return userId ? inertia.redirect("/dashboard") : inertia.redirect("/login");
	})
	.get("/login", (c) => {
		const inertia = c.get("inertia");
		const userId = sessionStore.getUserId(c.get("sessionId"));
		if (userId) {
			return inertia.redirect("/dashboard");
		}

		return inertia.render(
			loginPage({
				title: "Sign in",
				demoCredentials: users.getDemoCredentials(),
			}),
		);
	})
	.post("/login", async (c) => {
		const inertia = c.get("inertia");
		const sessionId = c.get("sessionId");
		const form = await parseLoginBody(c);

		const errors: Record<string, string> = {};

		if (!form.email.includes("@")) {
			errors.email = "Provide a valid email.";
		}
		if (form.password.length < 6) {
			errors.password = "Password must be at least 6 characters.";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors, "login");
			inertia.flash("error", "Fix form errors and try again.");
			return inertia.redirect("/login");
		}

		const user = users.verifyCredentials(form.email, form.password);
		if (!user) {
			inertia.errors({ email: "Invalid email or password." }, "login");
			inertia.flash("error", "Invalid credentials.");
			return inertia.redirect("/login");
		}

		sessionStore.setUserId(sessionId, user.id);
		users.recordLogin(user.id);
		inertia.flash("success", `Welcome back, ${user.name}.`);
		return inertia.redirect("/dashboard");
	});
