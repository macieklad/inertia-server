import { aboutPage, contactPage, homePage } from "../inertia";
import { router } from "../router";

export const homeRoutes = router
	.get("/", ({ inertia }) => {
		return inertia.render(
			homePage({
				title: "Welcome to Inertia Server",
				description:
					"A modern server-side rendering solution for React with Elysia",
			}),
		);
	})
	.get("/about", ({ inertia }) => {
		return inertia.render(
			aboutPage({
				title: "About Us",
				content:
					"Inertia Server brings the best of both worlds: server-side routing with client-side rendering.",
			}),
		);
	})
	.get("/contact", ({ inertia }) => {
		return inertia.render(
			contactPage({
				title: "Contact Us",
			}),
		);
	})
	.post("/contact", ({ inertia, body }) => {
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
			inertia.errors(errors, "contact");
			return inertia.redirect("/contact");
		}

		inertia.flash("success", "Message sent successfully!");
		return inertia.redirect("/contact");
	});
