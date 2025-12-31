import { useForm, Link } from "@inertiajs/react";
import { Layout } from "../../components/Layout";

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	createdAt: string;
}

interface Props {
	title: string;
	user: User;
	errors: { name?: string; email?: string };
}

export default function UsersEdit({ title, user, errors }: Props) {
	const { data, setData, put, processing } = useForm({
		name: user.name,
		email: user.email,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		put(`/users/${user.id}`);
	};

	return (
		<Layout title={title}>
			<form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
				<div style={{ marginBottom: "1rem" }}>
					<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
						Name
					</label>
					<input
						type="text"
						value={data.name}
						onChange={(e) => setData("name", e.target.value)}
						style={{
							width: "100%",
							padding: "0.5rem",
							border: errors.name ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{errors.name && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{errors.name}</span>
					)}
				</div>

				<div style={{ marginBottom: "1rem" }}>
					<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
						Email
					</label>
					<input
						type="email"
						value={data.email}
						onChange={(e) => setData("email", e.target.value)}
						style={{
							width: "100%",
							padding: "0.5rem",
							border: errors.email ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{errors.email && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{errors.email}</span>
					)}
				</div>

				<div style={{ marginBottom: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "4px" }}>
					<p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
						Role: {user.role} | Created: {user.createdAt}
					</p>
				</div>

				<div style={{ display: "flex", gap: "1rem" }}>
					<button
						type="submit"
						disabled={processing}
						style={{
							background: "#007bff",
							color: "#fff",
							padding: "0.75rem 1.5rem",
							border: "none",
							borderRadius: "4px",
							cursor: processing ? "not-allowed" : "pointer",
							opacity: processing ? 0.7 : 1,
						}}
					>
						{processing ? "Saving..." : "Save Changes"}
					</button>
					<Link
						href="/users"
						style={{
							padding: "0.75rem 1.5rem",
							border: "1px solid #ced4da",
							borderRadius: "4px",
							textDecoration: "none",
							color: "#1a1a2e",
						}}
					>
						Cancel
					</Link>
				</div>
			</form>
		</Layout>
	);
}
