import { router } from "@inertiajs/react";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { PageProps } from "inertia-server";
import type { securePage } from "@/inertia";

export default function SecurePage({ title, sensitiveData }: PageProps<typeof securePage>) {
	const handleLogout = () => {
		router.post("/logout");
	};

	return (
		<Layout title={title}>
			<div className="space-y-4">
				<Card className="border-warning/20 bg-warning/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">History Encryption Enabled</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">
							This page has <code className="rounded-sm bg-muted px-1">encryptHistory</code> enabled. 
							The page state in browser history is encrypted to protect sensitive information.
						</p>
					</CardContent>
				</Card>

				<Card className="border-destructive/20 bg-destructive/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Sensitive Data</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-mono text-sm">{sensitiveData}</p>
					</CardContent>
				</Card>

				<Card className="border-info/20 bg-info/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Clear History on Logout</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm">
							Clicking logout will clear all encrypted history entries, ensuring sensitive data 
							cannot be accessed via browser back button.
						</p>
						<Button variant="destructive" onClick={handleLogout}>
							Logout & Clear History
						</Button>
					</CardContent>
				</Card>

				<div className="text-sm text-muted-foreground">
					<p className="mb-2 font-medium text-foreground">How it works:</p>
					<ul className="space-y-1 pl-4">
						<li>- Page state is encrypted before being stored in browser history</li>
						<li>- Encryption key is stored in sessionStorage</li>
						<li>- Clearing history removes all encrypted entries</li>
						<li>- Useful for pages with sensitive user data (account info, financial data, etc.)</li>
					</ul>
				</div>
			</div>
		</Layout>
	);
}
