import { Deferred } from "@inertiajs/react";
import { Layout } from "../components/Layout";

interface Props {
	title: string;
	quickData: string;
	slowData?: string;
	sidebarData?: string[];
}

export default function DeferredDemo({ title, quickData, slowData, sidebarData }: Props) {
	return (
		<Layout title={title}>
			<p style={{ marginBottom: "2rem", color: "#666" }}>
				This page demonstrates deferred props. Some data loads instantly, while heavy data loads in the background.
			</p>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>
				<div>
					<div style={{ padding: "1.5rem", background: "#d4edda", borderRadius: "8px", marginBottom: "1rem" }}>
						<h3 style={{ margin: "0 0 0.5rem" }}>Quick Data (Immediate)</h3>
						<p style={{ margin: 0 }}>{quickData}</p>
					</div>

					<div style={{ padding: "1.5rem", background: "#f8f9fa", borderRadius: "8px" }}>
						<h3 style={{ margin: "0 0 0.5rem" }}>Slow Data (Deferred)</h3>
						<Deferred data="slowData" fallback={<LoadingSpinner />}>
							<p style={{ margin: 0 }}>{slowData}</p>
						</Deferred>
					</div>
				</div>

				<aside style={{ padding: "1.5rem", background: "#e9ecef", borderRadius: "8px" }}>
					<h3 style={{ margin: "0 0 1rem" }}>Sidebar (Deferred Group)</h3>
					<Deferred data="sidebarData" fallback={<LoadingSpinner />}>
						<ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
							{sidebarData?.map((item, i) => (
								<li key={i} style={{ marginBottom: "0.5rem" }}>
									{item}
								</li>
							))}
						</ul>
					</Deferred>
				</aside>
			</div>
		</Layout>
	);
}

function LoadingSpinner() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666" }}>
			<div
				style={{
					width: "20px",
					height: "20px",
					border: "2px solid #ddd",
					borderTopColor: "#1a1a2e",
					borderRadius: "50%",
					animation: "spin 1s linear infinite",
				}}
			/>
			Loading...
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
		</div>
	);
}
