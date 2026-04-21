import { router } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import { useState } from "react";
import type { nestedPropsPage } from "@/inertia";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function NestedPropsDemo({
	title,
	identity,
	analyticsPanel,
	sidebar,
}: PageProps<typeof nestedPropsPage>) {
	const [loadingKey, setLoadingKey] = useState<"analytics" | "sidebar" | null>(
		null,
	);

	const loadAnalytics = () => {
		setLoadingKey("analytics");
		router.reload({
			only: ["analyticsPanel.analytics"],
			onFinish: () => setLoadingKey(null),
		});
	};

	const loadSidebarStats = () => {
		setLoadingKey("sidebar");
		router.reload({
			only: ["sidebar.stats"],
			onFinish: () => setLoadingKey(null),
		});
	};

	return (
		<Layout title={title}>
			<p className="mb-8 text-muted-foreground">
				This page demonstrates nested partial reloads with the new modifiers
				API. One button loads a nested child prop, the other loads only part of
				a parent-deferred object.
			</p>

			<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="space-y-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Identity</CardTitle>
						</CardHeader>
						<CardContent className="space-y-1 text-sm">
							<p data-testid="nested-name">{identity.name}</p>
							<p data-testid="nested-email">{identity.email}</p>
							<p data-testid="nested-team">{identity.team}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
							<CardTitle className="text-base">Analytics</CardTitle>
							<Button
								onClick={loadAnalytics}
								disabled={loadingKey !== null || !!analyticsPanel.analytics}
								size="sm"
							>
								{loadingKey === "analytics"
									? "Loading..."
									: analyticsPanel.analytics
										? "Loaded"
										: "Load Analytics"}
							</Button>
						</CardHeader>
						<CardContent>
							{analyticsPanel.analytics ? (
								<div className="space-y-3" data-testid="analytics-content">
									<p data-testid="analytics-summary">
										{analyticsPanel.analytics.summary}
									</p>
									<ul className="space-y-1 text-sm text-muted-foreground">
										{analyticsPanel.analytics.chart.map((point) => (
											<li key={point}>{point}</li>
										))}
									</ul>
								</div>
							) : (
								<p
									className="text-sm text-muted-foreground"
									data-testid="analytics-placeholder"
								>
									This nested child prop is deferred until requested.
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				<Card className="h-fit">
					<CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
						<CardTitle className="text-base">Sidebar</CardTitle>
						<Button
							onClick={loadSidebarStats}
							disabled={loadingKey !== null || !!sidebar?.stats}
							size="sm"
							variant={sidebar?.stats ? "secondary" : "default"}
						>
							{loadingKey === "sidebar"
								? "Loading..."
								: sidebar?.stats
									? "Loaded"
									: "Load Sidebar Stats"}
						</Button>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						{sidebar?.stats ? (
							<p data-testid="sidebar-unread">
								Unread items: {sidebar.stats.unread}
							</p>
						) : (
							<p
								className="text-muted-foreground"
								data-testid="sidebar-placeholder"
							>
								This whole object is deferred. The request only asks for
								`sidebar.stats`.
							</p>
						)}

						{sidebar?.notes?.length ? (
							<ul className="space-y-1 text-muted-foreground">
								{sidebar.notes.map((note) => (
									<li key={note}>{note}</li>
								))}
							</ul>
						) : (
							<p
								className="text-muted-foreground"
								data-testid="sidebar-notes-missing"
							>
								Notes stay absent because the reload only requested the nested
								stats path.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
