import { Link } from "@inertiajs/react";
import { Layout } from "../components/Layout";
import { FlashMessages } from "../components/FlashMessages";

interface Props {
	title: string;
	description: string;
}

export default function Home({ title, description }: Props) {
	return (
		<Layout title={title}>
			<FlashMessages />
			<p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "2rem" }}>
				{description}
			</p>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
				<FeatureCard
					title="CRUD Operations"
					description="Full user management with create, read, update, delete"
					href="/users"
				/>
				<FeatureCard
					title="Infinite Scroll"
					description="Posts with merged props and pagination"
					href="/posts"
				/>
				<FeatureCard
					title="Deferred Props"
					description="Lazy-load heavy data after initial render"
					href="/deferred"
				/>
				<FeatureCard
					title="Once Props"
					description="Cache data that rarely changes"
					href="/once-props"
				/>
				<FeatureCard
					title="Form Validation"
					description="Server-side validation with error handling"
					href="/contact"
				/>
				<FeatureCard
					title="Error Bags"
					description="Multiple forms with separate error bags"
					href="/error-bags"
				/>
			</div>
		</Layout>
	);
}

function FeatureCard({ title, description, href }: { title: string; description: string; href: string }) {
	return (
		<Link
			href={href}
			style={{
				display: "block",
				padding: "1.5rem",
				background: "#f8f9fa",
				borderRadius: "8px",
				textDecoration: "none",
				color: "inherit",
				border: "1px solid #e9ecef",
			}}
		>
			<h3 style={{ margin: "0 0 0.5rem", color: "#1a1a2e" }}>{title}</h3>
			<p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>{description}</p>
		</Link>
	);
}
