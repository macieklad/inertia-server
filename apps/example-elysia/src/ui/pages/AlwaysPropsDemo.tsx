import { router } from "@inertiajs/react";
import { Layout } from "../components/Layout";

interface Props {
	title: string;
	regularData: string;
	authData: { isAuthenticated: boolean; permissions: string[] };
}

export default function AlwaysPropsDemo({ title, regularData, authData }: Props) {
	const reloadRegularOnly = () => {
		router.reload({ only: ["regularData"] });
	};

	return (
		<Layout title={title}>
			<p style={{ marginBottom: "2rem", color: "#666" }}>
				Always props are included even in partial reloads that don't request them. 
				Try the partial reload button - auth data will still be included.
			</p>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
				<div style={{ padding: "1.5rem", background: "#f8f9fa", borderRadius: "8px" }}>
					<h3 style={{ margin: "0 0 0.5rem" }}>Regular Data</h3>
					<p style={{ margin: 0 }}>{regularData}</p>
				</div>

				<div style={{ padding: "1.5rem", background: "#d1ecf1", borderRadius: "8px" }}>
					<h3 style={{ margin: "0 0 0.5rem" }}>Auth Data (Always Prop)</h3>
					<p style={{ margin: "0 0 0.5rem" }}>
						<strong>Authenticated:</strong> {authData.isAuthenticated ? "Yes" : "No"}
					</p>
					<p style={{ margin: 0 }}>
						<strong>Permissions:</strong> {authData.permissions.join(", ")}
					</p>
				</div>
			</div>

			<button
				onClick={reloadRegularOnly}
				style={{
					background: "#1a1a2e",
					color: "#fff",
					padding: "0.75rem 1.5rem",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
				}}
			>
				Partial Reload (only regularData)
			</button>

			<p style={{ marginTop: "1rem", color: "#666", fontSize: "0.875rem" }}>
				Note: Even though we only request "regularData", the authData will still be included 
				because it's marked as "always".
			</p>
		</Layout>
	);
}
