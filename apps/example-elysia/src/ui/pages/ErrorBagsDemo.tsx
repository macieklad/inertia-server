import { useForm } from "@inertiajs/react";
import { Layout } from "../components/Layout";

interface Props {
	title: string;
	errors: {
		login?: { email?: string; password?: string };
		createUser?: { name?: string; email?: string; password?: string };
	};
}

export default function ErrorBagsDemo({ title, errors }: Props) {
	return (
		<Layout title={title}>
			<p style={{ marginBottom: "2rem", color: "#666" }}>
				This page demonstrates error bags. Each form has its own error bag, 
				so validation errors from one form don't affect the other.
			</p>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
				<LoginForm errors={errors.login} />
				<CreateUserForm errors={errors.createUser} />
			</div>
		</Layout>
	);
}

function LoginForm({ errors }: { errors?: { email?: string; password?: string } }) {
	const { data, setData, post, processing } = useForm({
		email: "",
		password: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/error-bags/form1");
	};

	return (
		<div style={{ padding: "1.5rem", background: "#f8f9fa", borderRadius: "8px" }}>
			<h3 style={{ margin: "0 0 1rem" }}>Login Form (error bag: login)</h3>
			<form onSubmit={handleSubmit}>
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
							border: errors?.email ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{errors?.email && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{errors.email}</span>
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
							border: errors?.password ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{errors?.password && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{errors.password}</span>
					)}
				</div>

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
					{processing ? "Logging in..." : "Login"}
				</button>
			</form>
		</div>
	);
}

function CreateUserForm({ errors }: { errors?: { name?: string; email?: string; password?: string } }) {
	const { data, setData, post, processing } = useForm({
		name: "",
		email: "",
		password: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/error-bags/form2");
	};

	return (
		<div style={{ padding: "1.5rem", background: "#e9ecef", borderRadius: "8px" }}>
			<h3 style={{ margin: "0 0 1rem" }}>Create User Form (error bag: createUser)</h3>
			<form onSubmit={handleSubmit}>
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
							border: errors?.name ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{errors?.name && (
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
							border: errors?.email ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{errors?.email && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{errors.email}</span>
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
							border: errors?.password ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{errors?.password && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>{errors.password}</span>
					)}
				</div>

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
			</form>
		</div>
	);
}
