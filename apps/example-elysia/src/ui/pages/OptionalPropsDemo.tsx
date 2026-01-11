import { router } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import { useState } from "react";
import type { optionalPage } from "@/inertia";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function OptionalPropsDemo({
	title,
	basicData,
	heavyData,
}: PageProps<typeof optionalPage>) {
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
			<p className="mb-8 text-muted-foreground">
				Optional props are never included in standard visits. They must be
				explicitly requested via partial reloads.
			</p>

			<div className="space-y-4">
				<Card className="border-success/20 bg-success/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">
							Basic Data (Always Loaded)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p>{basicData}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-base">Heavy Data (Optional)</CardTitle>
						<Button
							onClick={loadHeavyData}
							disabled={loading || !!heavyData}
							variant={heavyData ? "secondary" : "default"}
							size="sm"
						>
							{loading
								? "Loading..."
								: heavyData
									? "Loaded"
									: "Load Heavy Data"}
						</Button>
					</CardHeader>
					<CardContent>
						{heavyData ? (
							<div
								className="max-h-72 overflow-auto"
								data-testid="heavy-data-content"
							>
								<p className="mb-2 text-sm text-muted-foreground">
									{heavyData.items.length} items loaded
								</p>
								<ul className="columns-3 gap-4 text-sm">
									{heavyData.items.slice(0, 30).map((item, i) => (
										<li key={i} className="text-muted-foreground">
											{item}
										</li>
									))}
								</ul>
								{heavyData.items.length > 30 && (
									<p className="mt-2 text-sm text-muted-foreground">
										...and {heavyData.items.length - 30} more
									</p>
								)}
							</div>
						) : (
							<p
								className="text-muted-foreground"
								data-testid="heavy-data-placeholder"
							>
								Click the button above to load this optional data.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
