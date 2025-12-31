import { router } from "@inertiajs/react";
import { Layout } from "../components/Layout";

interface Props {
	title: string;
	sensitiveData: string;
}

export default function SecurePage({ title, sensitiveData }: Props) {
	const handleLogout = () => {
		router.post("/logout");
	};

	return (
		<Layout title={title}>
			<div style={{ padding: "1.5rem", background: "#fff3cd", borderRadius: "8px", marginBottom: "1.5rem" }}>
				<h3 style={{ margin: "0 0 0.5rem" }}>History Encryption Enabled</h3>
				<p style={{ margin: 0, fontSize: "0.875rem" }}>
					This page has <code>encryptHistory</code> enabled. The page state in browser history 
					is encrypted to protect sensitive information.
				</p>
			</div>

			<div style={{ padding: "1.5rem", background: "#f8d7da", borderRadius: "8px", marginBottom: "1.5rem" }}>
				<h3 style={{ margin: "0 0 0.5rem" }}>Sensitive Data</h3>
				<p style={{ margin: 0, fontFamily: "monospace" }}>{sensitiveData}</p>
			</div>

			<div style={{ padding: "1.5rem", background: "#d1ecf1", borderRadius: "8px", marginBottom: "1.5rem" }}>
				<h3 style={{ margin: "0 0 0.5rem" }}>Clear History on Logout</h3>
				<p style={{ margin: "0 0 1rem", fontSize: "0.875rem" }}>
					Clicking logout will clear all encrypted history entries, ensuring sensitive data 
					cannot be accessed via browser back button.
				</p>
				<button
					onClick={handleLogout}
					style={{
						background: "#dc3545",
						color: "#fff",
						padding: "0.75rem 1.5rem",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					Logout & Clear History
				</button>
			</div>

			<div style={{ color: "#666", fontSize: "0.875rem" }}>
				<p>
					<strong>How it works:</strong>
				</p>
				<ul style={{ paddingLeft: "1.25rem" }}>
					<li>Page state is encrypted before being stored in browser history</li>
					<li>Encryption key is stored in sessionStorage</li>
					<li>Clearing history removes all encrypted entries</li>
					<li>Useful for pages with sensitive user data (account info, financial data, etc.)</li>
				</ul>
			</div>
		</Layout>
	);
}
