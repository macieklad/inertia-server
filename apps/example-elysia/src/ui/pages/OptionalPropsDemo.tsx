import { router } from "@inertiajs/react";
import { useState } from "react";
import { Layout } from "../components/Layout";

interface Props {
	title: string;
	basicData: string;
	heavyData?: { items: string[] };
}

export default function OptionalPropsDemo({ title, basicData, heavyData }: Props) {
	const [loading, setLoading] = useState(false);

	const loadHeavyData = () => {
		setLoading(true);
		router.reload({
			only: ["heavyData"],
			onFinish: () => setLoading(false),
		});
	};

	return (
		<Layout title={title}>
			<p style={{ marginBottom: "2rem", color: "#666" }}>
				Optional props are never included in standard visits. They must be explicitly requested via partial reloads.
			</p>

			<div style={{ padding: "1.5rem", background: "#d4edda", borderRadius: "8px", marginBottom: "1.5rem" }}>
				<h3 style={{ margin: "0 0 0.5rem" }}>Basic Data (Always Loaded)</h3>
				<p style={{ margin: 0 }}>{basicData}</p>
			</div>

			<div style={{ padding: "1.5rem", background: "#f8f9fa", borderRadius: "8px" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
					<h3 style={{ margin: 0 }}>Heavy Data (Optional)</h3>
					<button
						onClick={loadHeavyData}
						disabled={loading || !!heavyData}
						style={{
							background: heavyData ? "#6c757d" : "#007bff",
							color: "#fff",
							padding: "0.5rem 1rem",
							border: "none",
							borderRadius: "4px",
							cursor: loading || heavyData ? "not-allowed" : "pointer",
							opacity: loading ? 0.7 : 1,
						}}
					>
						{loading ? "Loading..." : heavyData ? "Loaded" : "Load Heavy Data"}
					</button>
				</div>

				{heavyData ? (
					<div style={{ maxHeight: "300px", overflow: "auto" }}>
						<p style={{ margin: "0 0 0.5rem", color: "#666" }}>
							Showing {heavyData.items.length} items:
						</p>
						<ul style={{ margin: 0, paddingLeft: "1.25rem", columns: 3 }}>
							{heavyData.items.slice(0, 30).map((item, i) => (
								<li key={i} style={{ fontSize: "0.875rem" }}>
									{item}
								</li>
							))}
						</ul>
						{heavyData.items.length > 30 && (
							<p style={{ margin: "0.5rem 0 0", color: "#666", fontSize: "0.875rem" }}>
								...and {heavyData.items.length - 30} more
							</p>
						)}
					</div>
				) : (
					<p style={{ margin: 0, color: "#999" }}>
						Click the button above to load this optional data.
					</p>
				)}
			</div>
		</Layout>
	);
}
