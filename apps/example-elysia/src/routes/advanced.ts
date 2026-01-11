import { errorBagsPage, securePage } from "../inertia";
import { router } from "../router";

export const advancedRoutes = router
	.get("/secure", ({ inertia }) => {
		inertia.encryptHistory();
		return inertia.render(
			securePage({
				title: "Secure Page",
				sensitiveData:
					"This is sensitive information that should be encrypted in history",
			}),
		);
	})
	.post("/logout", ({ inertia }) => {
		inertia.clearHistory();
		return inertia.redirect("/");
	})
	.get("/error-bags", ({ inertia }) => {
		return inertia.render(
			errorBagsPage({
				title: "Error Bags Demo",
			}),
		);
	})
	.post("/error-bags/form1", ({ inertia, body }) => {
		const { email, password } = body as { email?: string; password?: string };

		const errors: Record<string, string> = {};

		if (!email || !email.includes("@")) {
			errors.email = "Please enter a valid email";
		}
		if (!password || password.length < 6) {
			errors.password = "Password must be at least 6 characters";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors, "login");
			return inertia.redirect("/error-bags");
		}

		inertia.flash("success", "Login successful!");
		return inertia.redirect("/error-bags");
	})
	.post("/error-bags/form2", ({ inertia, body }) => {
		const { name, email, password } = body as {
			name?: string;
			email?: string;
			password?: string;
		};

		const errors: Record<string, string> = {};

		if (!name || name.length < 2) {
			errors.name = "Name must be at least 2 characters";
		}
		if (!email || !email.includes("@")) {
			errors.email = "Please enter a valid email";
		}
		if (!password || password.length < 8) {
			errors.password = "Password must be at least 8 characters";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors, "createUser");
			return inertia.redirect("/error-bags");
		}

		inertia.flash("success", "User created!");
		return inertia.redirect("/error-bags");
	});
