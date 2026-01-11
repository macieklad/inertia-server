import { Link } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { homePage } from "@/inertia";
import { FlashMessages } from "../components/FlashMessages";
import { Layout } from "../components/Layout";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function Home({
	title,
	description,
}: PageProps<typeof homePage>) {
	return (
		<Layout title={title}>
			<FlashMessages />
			<p className="mb-8 text-lg text-muted-foreground">{description}</p>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FeatureCard
					title="Users"
					description="CRUD operations with forms and validation"
					href="/users"
				/>
				<FeatureCard
					title="Infinite Scroll"
					description="Merged props for paginated lists"
					href="/posts"
				/>
				<FeatureCard
					title="Deferred Props"
					description="Lazy-load data after initial render"
					href="/deferred"
				/>
				<FeatureCard
					title="Once Props"
					description="Cache props across navigations"
					href="/once-props"
				/>
				<FeatureCard
					title="Flash Messages"
					description="One-time messages across redirects"
					href="/flash"
				/>
				<FeatureCard
					title="Error Bags"
					description="Isolated validation per form"
					href="/error-bags"
				/>
			</div>
		</Layout>
	);
}

function FeatureCard({
	title,
	description,
	href,
}: {
	title: string;
	description: string;
	href: string;
}) {
	return (
		<Link href={href} className="block no-underline">
			<Card className="h-full transition-colors hover:bg-muted/50">
				<CardHeader>
					<CardTitle className="text-base">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);
}
