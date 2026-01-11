import { flashPage, homePage } from "../inertia";
import { router } from "../router";

export const homeRoutes = router
	.get("/", ({ inertia }) => {
		return inertia.render(
			homePage({
				title: "Inertia Server Demo",
				description:
					"Interactive examples demonstrating inertia-server features with Elysia and React.",
			}),
		);
	})
	.get("/flash", ({ inertia }) => {
		return inertia.render(
			flashPage({
				title: "Flash Messages",
			}),
		);
	})
	.post("/flash", ({ inertia, body }) => {
		const { name, email, message } = body as {
			name?: string;
			email?: string;
			message?: string;
		};

		const errors: Record<string, string> = {};

		if (!name || name.trim().length < 2) {
			errors.name = "Name must be at least 2 characters";
		}
		if (!email || !email.includes("@")) {
			errors.email = "Please enter a valid email address";
		}
		if (!message || message.trim().length < 10) {
			errors.message = "Message must be at least 10 characters";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors, "flash");
			return inertia.redirect("/flash");
		}

		inertia.flash("success", "Message sent successfully!");
		return inertia.redirect("/flash");
	});
