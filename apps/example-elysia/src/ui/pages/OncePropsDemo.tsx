import { Link } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { oncePage } from "@/inertia";
import { CodeBlock } from "../components/CodeBlock";
import { Layout } from "../components/Layout";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function OncePropsDemo({
	title,
	timestamp,
	config,
	plans,
}: PageProps<typeof oncePage>) {
	return (
		<Layout title={title}>
			<p className="mb-8 text-muted-foreground">
				Once props are cached and reused across navigation. Navigate away and
				back to see the difference.
			</p>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card className="border-warning/20 bg-warning/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">
							Regular Prop (Changes Each Visit)
						</CardTitle>
					</CardHeader>
					<CardContent className="font-mono text-sm">
						<p data-testid="timestamp">Timestamp: {timestamp}</p>
						<p className="text-xs text-muted-foreground">
							Generated: {new Date(timestamp).toLocaleTimeString()}
						</p>
					</CardContent>
				</Card>

				<Card className="border-info/20 bg-info/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">
							Config (Once Prop - Cached)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{config ? (
							<pre className="whitespace-pre-wrap font-mono text-sm">
								<span data-testid="config-theme">{config.theme}</span>
								{" / "}
								<span data-testid="config-locale">{config.locale}</span>
							</pre>
						) : (
							<p className="text-sm text-muted-foreground">
								(Using cached value from initial load)
							</p>
						)}
					</CardContent>
				</Card>

				<Card className="border-success/20 bg-success/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">
							Plans (Once with Expiration)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{plans ? (
							<ul className="space-y-1 text-sm">
								{plans.map((plan) => (
									<li key={plan.id}>
										{plan.name}: ${plan.price}/mo
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">
								(Using cached value - expires after 60s)
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<p className="mt-8 text-sm text-muted-foreground">
				Try navigating to{" "}
				<Link href="/about" className="underline hover:text-foreground">
					About
				</Link>{" "}
				and back to see how once props behave.
			</p>

			<CodeBlock
				tabs={[
					{
						label: "Server",
						language: "typescript",
						code: `export const oncePage = definePage({
  component: "OncePropsDemo",
  props: {
    title: prop<string>(),
    timestamp: prop<number>(),
    config: prop<{ theme: string; locale: string }>().once(),
    plans: prop<{ id: number; name: string; price: number }[]>().once({
      expiresAt: Date.now() + 60000,
    }),
  },
});`,
					},
					{
						label: "Client",
						language: "tsx",
						code: `// Props received normally, caching handled by server
// On first visit: server sends config + plans
// On subsequent visits: cached values reused
<p>Config: {config.theme} / {config.locale}</p>`,
					},
				]}
			/>
		</Layout>
	);
}
