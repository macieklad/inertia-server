import { router } from "../router";
import {
	usersIndexPage,
	usersCreatePage,
	usersEditPage,
	type User,
} from "../inertia";

const mockUsers: User[] = [
	{ id: 1, name: "John Doe", email: "john@example.com", role: "Admin", createdAt: "2024-01-15" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", createdAt: "2024-02-20" },
	{ id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", createdAt: "2024-03-10" },
	{ id: 4, name: "Alice Brown", email: "alice@example.com", role: "Editor", createdAt: "2024-03-25" },
	{ id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "User", createdAt: "2024-04-05" },
	{ id: 6, name: "Diana Miller", email: "diana@example.com", role: "Admin", createdAt: "2024-04-15" },
	{ id: 7, name: "Edward Davis", email: "edward@example.com", role: "User", createdAt: "2024-05-01" },
	{ id: 8, name: "Fiona Garcia", email: "fiona@example.com", role: "Editor", createdAt: "2024-05-10" },
];

const ITEMS_PER_PAGE = 5;

export const usersRoutes = router
	.get("/users", ({ inertia, query }) => {
		const search = (query.search as string) || "";
		const page = parseInt(query.page as string) || 1;

		let filteredUsers = mockUsers;
		if (search) {
			filteredUsers = mockUsers.filter(
				(u) =>
					u.name.toLowerCase().includes(search.toLowerCase()) ||
					u.email.toLowerCase().includes(search.toLowerCase()),
			);
		}

		const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
		const startIndex = (page - 1) * ITEMS_PER_PAGE;
		const paginatedUsers = filteredUsers.slice(
			startIndex,
			startIndex + ITEMS_PER_PAGE,
		);

		return inertia.render(
			usersIndexPage({
				title: "Users",
				users: paginatedUsers,
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

		if (!name || name.trim().length < 2) {
			errors.name = "Name must be at least 2 characters";
		}
		if (!email || !email.includes("@")) {
			errors.email = "Please enter a valid email address";
		}
		if (!password || password.length < 8) {
			errors.password = "Password must be at least 8 characters";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors, "createUser");
			return inertia.redirect("/users/create");
		}

		return inertia.redirect("/users");
	})
	.get("/users/:id/edit", ({ inertia, params }) => {
		const user = mockUsers.find((u) => u.id === parseInt(params.id));
		if (!user) {
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
		const { name, email } = body as { name?: string; email?: string };

		const errors: Record<string, string> = {};

		if (!name || name.trim().length < 2) {
			errors.name = "Name must be at least 2 characters";
		}
		if (!email || !email.includes("@")) {
			errors.email = "Please enter a valid email address";
		}

		if (Object.keys(errors).length > 0) {
			inertia.errors(errors);
			return inertia.redirect(`/users/${params.id}/edit`);
		}

		return inertia.redirect("/users");
	})
	.delete("/users/:id", ({ inertia }) => {
		return inertia.redirect("/users");
	});
