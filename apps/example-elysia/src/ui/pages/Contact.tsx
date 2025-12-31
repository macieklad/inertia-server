import { useForm } from "@inertiajs/react";
import { Layout } from "../components/Layout";
import { FlashMessages } from "../components/FlashMessages";

interface Props {
	title: string;
	errors: { contact?: { name?: string; email?: string; message?: string } };
}

export default function Contact({ title, errors }: Props) {
	const { data, setData, post, processing } = useForm({
		name: "",
		email: "",
		message: "",
	});

	const contactErrors = errors.contact ?? {};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/contact");
	};

	return (
		<Layout title={title}>
			<FlashMessages />
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
							border: contactErrors.name ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{contactErrors.name && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>
							{contactErrors.name}
						</span>
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
							border: contactErrors.email ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{contactErrors.email && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>
							{contactErrors.email}
						</span>
					)}
				</div>

				<div style={{ marginBottom: "1rem" }}>
					<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
						Message
					</label>
					<textarea
						value={data.message}
						onChange={(e) => setData("message", e.target.value)}
						rows={5}
						style={{
							width: "100%",
							padding: "0.5rem",
							border: contactErrors.message ? "1px solid #dc3545" : "1px solid #ced4da",
							borderRadius: "4px",
						}}
					/>
					{contactErrors.message && (
						<span style={{ color: "#dc3545", fontSize: "0.875rem" }}>
							{contactErrors.message}
						</span>
					)}
				</div>

				<button
					type="submit"
					disabled={processing}
					style={{
						background: "#1a1a2e",
						color: "#fff",
						padding: "0.75rem 1.5rem",
						border: "none",
						borderRadius: "4px",
						cursor: processing ? "not-allowed" : "pointer",
						opacity: processing ? 0.7 : 1,
					}}
				>
					{processing ? "Sending..." : "Send Message"}
				</button>
			</form>
		</Layout>
	);
}
