import { useForm } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { dashboardPage } from "@/inertia";
import { FlashMessages } from "../components/FlashMessages";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function Dashboard({
	title,
	user,
	loginCount,
}: PageProps<typeof dashboardPage>) {
	const { post, processing } = useForm({});

	return (
		<Layout title={title}>
			<FlashMessages />
			<Card className="max-w-xl">
				<CardHeader>
					<CardTitle>Authenticated area</CardTitle>
					<CardDescription>
						Same UI style as the Elysia demo, using Hono backend integration.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-sm border bg-muted/30 p-3">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							User
						</p>
						<p className="font-medium">{user.name}</p>
						<p className="text-sm text-muted-foreground">{user.email}</p>
					</div>
					<div className="rounded-sm border bg-muted/30 p-3">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Login Count
						</p>
						<p className="text-xl font-semibold" data-testid="login-count">
							{loginCount}
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={() => post("/logout")}
						disabled={processing}
					>
						{processing ? "Signing out..." : "Sign out"}
					</Button>
				</CardContent>
			</Card>
		</Layout>
	);
}
