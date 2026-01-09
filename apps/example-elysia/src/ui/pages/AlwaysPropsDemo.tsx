import { router } from "@inertiajs/react";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { PageProps } from "inertia-server";
import type { alwaysPage } from "@/inertia";

export default function AlwaysPropsDemo({ title, regularData, authData }: PageProps<typeof alwaysPage>) {
	const reloadRegularOnly = () => {
		router.reload({ only: ["regularData"] });
	};

	return (
		<Layout title={title}>
			<p className="mb-8 text-muted-foreground">
				Always props are included even in partial reloads that don't request them. 
				Try the partial reload button - auth data will still be included.
			</p>

			<div className="mb-6 grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Regular Data</CardTitle>
					</CardHeader>
					<CardContent>
						<p>{regularData}</p>
					</CardContent>
				</Card>

				<Card className="border-info/20 bg-info/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Auth Data (Always Prop)</CardTitle>
					</CardHeader>
					<CardContent className="space-y-1 text-sm">
						<p>
							<span className="font-medium">Authenticated:</span>{" "}
							{authData.isAuthenticated ? "Yes" : "No"}
						</p>
						<p>
							<span className="font-medium">Permissions:</span>{" "}
							{authData.permissions.join(", ")}
						</p>
					</CardContent>
				</Card>
			</div>

			<Button onClick={reloadRegularOnly}>
				Partial Reload (only regularData)
			</Button>

			<p className="mt-4 text-sm text-muted-foreground">
				Note: Even though we only request "regularData", the authData will still be included 
				because it's marked as "always".
			</p>
		</Layout>
	);
}
