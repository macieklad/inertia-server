import { Deferred } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { deferredPage } from "@/inertia";
import { Layout } from "../components/Layout";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function DeferredDemo({
	title,
	quickData,
	slowData,
	sidebarData,
}: PageProps<typeof deferredPage>) {
	return (
		<Layout title={title}>
			<p className="mb-8 text-muted-foreground">
				This page demonstrates deferred props. Some data loads instantly, while
				heavy data loads in the background.
			</p>

			<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
				<div className="space-y-4">
					<Card className="border-success/20 bg-success/10">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">
								Quick Data (Immediate)
							</CardTitle>
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
							<Deferred
								data="slowData"
								fallback={<LoadingSpinner data-testid="slow-data-loading" />}
							>
								<p data-testid="slow-data-content">{slowData}</p>
							</Deferred>
						</CardContent>
					</Card>
				</div>

				<Card className="bg-muted/50">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">
							Sidebar (Deferred Group)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Deferred
							data="sidebarData"
							fallback={<LoadingSpinner data-testid="sidebar-loading" />}
						>
							<ul className="space-y-2 pl-4" data-testid="sidebar-content">
								{sidebarData?.map((item) => (
									<li key={item} className="text-sm">
										- {item}
									</li>
								))}
							</ul>
						</Deferred>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}

function LoadingSpinner({ "data-testid": testId }: { "data-testid"?: string }) {
	return (
		<div
			className="flex items-center gap-2 text-muted-foreground"
			data-testid={testId}
		>
			<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
			<span className="text-sm">Loading...</span>
		</div>
	);
}
