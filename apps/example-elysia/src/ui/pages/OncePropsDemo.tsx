import { Link } from "@inertiajs/react";
import { Layout } from "../components/Layout";

interface Props {
	title: string;
	timestamp: number;
	config?: { theme: string; locale: string };
	plans?: { id: number; name: string; price: number }[];
}

export default function OncePropsDemo({ title, timestamp, config, plans }: Props) {
	return (
		<Layout title={title}>
			<p style={{ marginBottom: "2rem", color: "#666" }}>
				Once props are cached and reused across navigation. Navigate away and back to see the difference.
			</p>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
				<div style={{ padding: "1.5rem", background: "#fff3cd", borderRadius: "8px" }}>
					<h3 style={{ margin: "0 0 0.5rem" }}>Regular Prop (Changes Each Visit)</h3>
					<p style={{ margin: 0, fontFamily: "monospace" }}>
						Timestamp: {timestamp}
						<br />
						<small>Generated: {new Date(timestamp).toLocaleTimeString()}</small>
					</p>
				</div>

				<div style={{ padding: "1.5rem", background: "#d1ecf1", borderRadius: "8px" }}>
					<h3 style={{ margin: "0 0 0.5rem" }}>Config (Once Prop - Cached)</h3>
					{config ? (
						<pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
							{JSON.stringify(config, null, 2)}
						</pre>
					) : (
						<p style={{ margin: 0, color: "#666" }}>
							(Using cached value from initial load)
						</p>
					)}
				</div>

				<div style={{ padding: "1.5rem", background: "#d4edda", borderRadius: "8px" }}>
					<h3 style={{ margin: "0 0 0.5rem" }}>Plans (Once with Expiration)</h3>
					{plans ? (
						<ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
							{plans.map((plan) => (
								<li key={plan.id}>
									{plan.name}: ${plan.price}/mo
								</li>
							))}
						</ul>
					) : (
						<p style={{ margin: 0, color: "#666" }}>
							(Using cached value - expires after 60s)
						</p>
					)}
				</div>
			</div>

			<div style={{ marginTop: "2rem" }}>
				<p style={{ color: "#666" }}>
					Try navigating to <Link href="/about">About</Link> and back to see how once props behave.
				</p>
			</div>
		</Layout>
	);
}
