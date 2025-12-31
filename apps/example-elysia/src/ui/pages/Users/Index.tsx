import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Layout } from "../../components/Layout";
import { FlashMessages } from "../../components/FlashMessages";

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	createdAt: string;
}

interface Props {
	title: string;
	users: User[];
	search: string;
	page: number;
	totalPages: number;
}

export default function UsersIndex({ title, users, search, page, totalPages }: Props) {
	const [searchValue, setSearchValue] = useState(search);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		router.get("/users", { search: searchValue, page: 1 }, { preserveState: true });
	};

	return (
		<Layout title={title}>
			<FlashMessages />

			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
				<form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
					<input
						type="text"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						placeholder="Search users..."
						style={{ padding: "0.5rem", border: "1px solid #ced4da", borderRadius: "4px" }}
					/>
					<button
						type="submit"
						style={{
							background: "#1a1a2e",
							color: "#fff",
							padding: "0.5rem 1rem",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Search
					</button>
				</form>

				<Link
					href="/users/create"
					style={{
						background: "#28a745",
						color: "#fff",
						padding: "0.5rem 1rem",
						borderRadius: "4px",
						textDecoration: "none",
					}}
				>
					Create User
				</Link>
			</div>

			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ background: "#f8f9fa" }}>
						<th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Name</th>
						<th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Email</th>
						<th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Role</th>
						<th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Created</th>
						<th style={{ padding: "0.75rem", textAlign: "right", borderBottom: "2px solid #dee2e6" }}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id}>
							<td style={{ padding: "0.75rem", borderBottom: "1px solid #dee2e6" }}>{user.name}</td>
							<td style={{ padding: "0.75rem", borderBottom: "1px solid #dee2e6" }}>{user.email}</td>
							<td style={{ padding: "0.75rem", borderBottom: "1px solid #dee2e6" }}>{user.role}</td>
							<td style={{ padding: "0.75rem", borderBottom: "1px solid #dee2e6" }}>{user.createdAt}</td>
							<td style={{ padding: "0.75rem", borderBottom: "1px solid #dee2e6", textAlign: "right" }}>
								<Link
									href={`/users/${user.id}/edit`}
									style={{ color: "#007bff", marginRight: "1rem" }}
								>
									Edit
								</Link>
								<Link
									href={`/users/${user.id}`}
									method="delete"
									as="button"
									style={{
										color: "#dc3545",
										background: "none",
										border: "none",
										cursor: "pointer",
									}}
								>
									Delete
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{totalPages > 1 && (
				<div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
					{page > 1 && (
						<Link
							href={`/users?page=${page - 1}&search=${search}`}
							style={{ padding: "0.5rem 1rem", border: "1px solid #dee2e6", borderRadius: "4px", textDecoration: "none", color: "#1a1a2e" }}
						>
							Previous
						</Link>
					)}
					<span style={{ padding: "0.5rem 1rem" }}>
						Page {page} of {totalPages}
					</span>
					{page < totalPages && (
						<Link
							href={`/users?page=${page + 1}&search=${search}`}
							style={{ padding: "0.5rem 1rem", border: "1px solid #dee2e6", borderRadius: "4px", textDecoration: "none", color: "#1a1a2e" }}
						>
							Next
						</Link>
					)}
				</div>
			)}
		</Layout>
	);
}
