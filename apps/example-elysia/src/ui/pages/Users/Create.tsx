import { useForm, Link } from "@inertiajs/react";
import { Layout } from "../../components/Layout";

interface Props {
	title: string;
	errors: { createUser?: { name?: string; email?: string; password?: string } };
}

export default function UsersCreate({ title, errors }: Props) {
	const { data, setData, post, processing } = useForm({
		name: "",
		email: "",
		password: "",
	});

	const formErrors = errors.createUser ?? {};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/users");
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
							border: formErrors.name ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{formErrors.name && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{formErrors.name}</span>
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
							border: formErrors.email ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{formErrors.email && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{formErrors.email}</span>
					)}
				</div>

				<div style={{ marginBottom: "1rem" }}>
					<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
						Password
					</label>
					<input
						type="password"
						value={data.password}
						onChange={(e) => setData("password", e.target.value)}
						style={{
							width: "100%",
							padding: "0.5rem",
							border: formErrors.password ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{formErrors.password && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{formErrors.password}</span>
					)}
				</div>

				<div style={{ display: "flex", gap: "1rem" }}>
					<button
						type="submit"
						disabled={processing}
						style={{
							background: "#28a745",
							color: "#fff",
							padding: "0.75rem 1.5rem",
							border: "none",
							borderRadius: "4px",
							cursor: processing ? "not-allowed" : "pointer",
							opacity: processing ? 0.7 : 1,
						}}
					>
						{processing ? "Creating..." : "Create User"}
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
