import { Layout } from "../components/Layout";
import { PageProps } from "inertia-server";
import type { aboutPage } from "@/inertia";

export default function About({ title, content }: PageProps<typeof aboutPage>) {
	return (
		<Layout title={title}>
			<p className="text-lg leading-relaxed text-muted-foreground">
				{content}
			</p>

			<h2 className="mb-4 mt-8 text-xl font-semibold">Key Features</h2>
			<ul className="space-y-2 text-muted-foreground">
				<li className="flex items-start gap-2">
					<span className="text-foreground">-</span>
					Server-side routing with client-side rendering
				</li>
				<li className="flex items-start gap-2">
					<span className="text-foreground">-</span>
					Type-safe page definitions with TypeScript
				</li>
				<li className="flex items-start gap-2">
					<span className="text-foreground">-</span>
					Prop builders for deferred, once, optional, and always props
				</li>
				<li className="flex items-start gap-2">
					<span className="text-foreground">-</span>
					Merged props for infinite scroll and real-time updates
				</li>
				<li className="flex items-start gap-2">
					<span className="text-foreground">-</span>
					Form handling with validation and error bags
				</li>
				<li className="flex items-start gap-2">
					<span className="text-foreground">-</span>
					History encryption for sensitive data
				</li>
			</ul>
		</Layout>
	);
}
