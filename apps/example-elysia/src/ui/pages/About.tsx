import { Layout } from "../components/Layout";

interface Props {
	title: string;
	content: string;
}

export default function About({ title, content }: Props) {
	return (
		<Layout title={title}>
			<p style={{ fontSize: "1.125rem", lineHeight: 1.7, color: "#444" }}>
				{content}
			</p>

			<h2 style={{ marginTop: "2rem" }}>Key Features</h2>
			<ul style={{ lineHeight: 1.8 }}>
				<li>Server-side routing with client-side rendering</li>
				<li>Type-safe page definitions with TypeScript</li>
				<li>Prop builders for deferred, once, optional, and always props</li>
				<li>Merged props for infinite scroll and real-time updates</li>
				<li>Form handling with validation and error bags</li>
				<li>History encryption for sensitive data</li>
			</ul>
		</Layout>
	);
}
