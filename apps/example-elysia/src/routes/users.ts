import { users } from "../db";
import { usersCreatePage, usersEditPage, usersIndexPage } from "../inertia";
import { router } from "../router";

const ITEMS_PER_PAGE = 5;

export const usersRoutes = router
	.get("/users", ({ inertia, query }) => {
		const search = (query.search as string) || "";
		const page = parseInt(query.page as string, 10) || 1;

		const result = users.getAll(search || undefined, page, ITEMS_PER_PAGE);
		const totalPages = Math.ceil(result.total / ITEMS_PER_PAGE);

		return inertia.render(
			usersIndexPage({
				title: "Users",
				users: result.users,
				search,
				page,
				totalPages,
			}),
		);
	})
	.get("/users/create", ({ inertia }) => {
		return inertia.render(
			usersCreatePage({
				title: "Create User",
			}),
		);
	})
	.post("/users", ({ inertia, body }) => {
		const { name, email, password } = body as {
			name?: string;
			email?: string;
			password?: string;
		};

		const errors: Record<string, string> = {};

		const trimmedName = name?.trim() ?? "";
		if (trimmedName.length < 2) {
			errors.name = "Name must be at least 2 characters";
		}
		if (!email || !email.includes("@")) {
			errors.email = "Please enter a valid email address";
		} else if (users.emailExists(email)) {
			errors.email = "This email is already taken";
		}
		if (!password || password.length < 8) {
			errors.password = "Password must be at least 8 characters";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors, "createUser");
			return inertia.redirect("/users/create");
		}

		users.create(trimmedName, email as string, "User");
		inertia.flash("success", "User created successfully!");
		return inertia.redirect("/users");
	})
	.get("/users/:id/edit", ({ inertia, params }) => {
		const user = users.getById(parseInt(params.id, 10));
		if (!user) {
			inertia.flash("error", "User not found");
			return inertia.redirect("/users");
		}

		return inertia.render(
			usersEditPage({
				title: `Edit ${user.name}`,
				user,
			}),
		);
	})
	.put("/users/:id", ({ inertia, params, body }) => {
		const id = parseInt(params.id, 10);
		const { name, email } = body as { name?: string; email?: string };

		const errors: Record<string, string> = {};

		const trimmedName = name?.trim() ?? "";
		if (trimmedName.length < 2) {
			errors.name = "Name must be at least 2 characters";
		}
		if (!email || !email.includes("@")) {
			errors.email = "Please enter a valid email address";
		} else if (users.emailExists(email, id)) {
			errors.email = "This email is already taken";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors, "editUser");
			return inertia.redirect(`/users/${id}/edit`);
		}

		users.update(id, trimmedName, email as string);
		inertia.flash("success", "User updated successfully!");
		return inertia.redirect("/users");
	})
	.delete("/users/:id", ({ inertia, params }) => {
		const id = parseInt(params.id, 10);
		const user = users.getById(id);

		if (user) {
			users.delete(id);
			inertia.flash("success", `User "${user.name}" deleted`);
		}

		return inertia.redirect("/users");
	});
