import { Deferred } from "@inertiajs/react";
import { Layout } from "../components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { CodeBlock } from "../components/CodeBlock";
import { PageProps } from "inertia-server";
import type { deferredPage } from "@/inertia";

export default function DeferredDemo({ title, quickData, slowData, sidebarData }: PageProps<typeof deferredPage>) {
	return (
		<Layout title={title}>
			<p className="mb-8 text-muted-foreground">
				This page demonstrates deferred props. Some data loads instantly, while heavy data loads in the background.
			</p>

			<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
				<div className="space-y-4">
					<Card className="border-success/20 bg-success/10">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Quick Data (Immediate)</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{quickData}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Slow Data (Deferred)</CardTitle>
						</CardHeader>
						<CardContent>
							<Deferred data="slowData" fallback={<LoadingSpinner />}>
								<p>{slowData}</p>
							</Deferred>
						</CardContent>
					</Card>
				</div>

				<Card className="bg-muted/50">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Sidebar (Deferred Group)</CardTitle>
					</CardHeader>
					<CardContent>
						<Deferred data="sidebarData" fallback={<LoadingSpinner />}>
							<ul className="space-y-2 pl-4">
								{sidebarData?.map((item, i) => (
									<li key={i} className="text-sm">
										- {item}
									</li>
								))}
							</ul>
						</Deferred>
					</CardContent>
				</Card>
			</div>

			<CodeBlock
				tabs={[
					{
						label: "Server",
						language: "typescript",
						code: `export const deferredPage = definePage({
  component: "DeferredDemo",
  props: {
    title: prop<string>(),
    quickData: prop<string>(),
    slowData: prop<string>().deferred(),
    sidebarData: prop<string[]>().deferred("sidebar"),
  },
});`,
					},
					{
						label: "Client",
						language: "tsx",
						code: `import { Deferred } from "@inertiajs/react";

<Deferred data="slowData" fallback={<Spinner />}>
  <SlowContent data={slowData} />
</Deferred>`,
					},
				]}
			/>
		</Layout>
	);
}

function LoadingSpinner() {
	return (
		<div className="flex items-center gap-2 text-muted-foreground">
			<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
			<span className="text-sm">Loading...</span>
		</div>
	);
}
