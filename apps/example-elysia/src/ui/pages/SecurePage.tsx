import { router, usePage } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import { useEffect, useState } from "react";
import type { securePage } from "@/inertia";
import { CodeBlock } from "../components/CodeBlock";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";

export default function SecurePage({
	title,
	sensitiveData,
}: PageProps<typeof securePage>) {
	const page = usePage();
	const [historyLength, setHistoryLength] = useState(0);
	const [historyState, setHistoryState] = useState<string>("");

	useEffect(() => {
		setHistoryLength(window.history.length);
		try {
			const state = window.history.state;
			setHistoryState(JSON.stringify(state, null, 2));
		} catch {
			setHistoryState("Unable to read history state");
		}
	}, []);

	const handleLogout = () => {
		router.post("/logout");
	};

	return (
		<Layout title={title}>
			<div className="space-y-4">
				<Card className="border-warning/20 bg-warning/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">
							History Encryption Enabled
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">
							This page has{" "}
							<code className="rounded-sm bg-muted px-1">encryptHistory</code>{" "}
							enabled. The page state in browser history is encrypted to protect
							sensitive information.
						</p>
					</CardContent>
				</Card>

				<Card className="border-destructive/20 bg-destructive/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Sensitive Data</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-mono text-sm" data-testid="sensitive-data">
							{sensitiveData}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Browser History State</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center gap-4 text-sm">
							<span className="text-muted-foreground">History length:</span>
							<code className="rounded-sm bg-muted px-2 py-0.5">
								{historyLength}
							</code>
						</div>
						<div className="flex items-center gap-4 text-sm">
							<span className="text-muted-foreground">encryptHistory:</span>
							<code className="rounded-sm bg-muted px-2 py-0.5">
								{String(
									(page.props as Record<string, unknown>).encryptHistory ??
										page.encryptHistory ??
										"undefined",
								)}
							</code>
						</div>
						<div>
							<p className="mb-2 text-sm text-muted-foreground">
								History state (encrypted data not visible):
							</p>
							<pre className="max-h-48 overflow-auto rounded-sm bg-muted p-3 text-xs">
								{historyState}
							</pre>
						</div>
					</CardContent>
				</Card>

				<Card className="border-info/20 bg-info/10">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Clear History on Logout</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm">
							Clicking logout will clear all encrypted history entries, ensuring
							sensitive data cannot be accessed via browser back button.
						</p>
						<Button variant="destructive" onClick={handleLogout}>
							Logout & Clear History
						</Button>
					</CardContent>
				</Card>

				<div className="text-sm text-muted-foreground">
					<p className="mb-2 font-medium text-foreground">How it works:</p>
					<ul className="space-y-1 pl-4">
						<li>
							- Page state is encrypted before being stored in browser history
						</li>
						<li>- Encryption key is stored in sessionStorage</li>
						<li>- Clearing history removes all encrypted entries</li>
						<li>
							- Useful for pages with sensitive user data (account info,
							financial data, etc.)
						</li>
					</ul>
				</div>

				<CodeBlock
					tabs={[
						{
							label: "Server",
							language: "typescript",
							code: `// In route handler
return inertia.render(
  securePage({
    title: "Secure Demo",
    sensitiveData: "secret-123",
  }),
  {
    encryptHistory: true,
    clearHistory: true,
  }
);`,
						},
						{
							label: "Client",
							language: "tsx",
							code: `// Browser history state is encrypted
// Back/forward navigation works normally
// But history.state shows encrypted data, not props

// Check history state
console.log(history.state);  // { __inertia_encrypted: "..." }`,
						},
					]}
				/>
			</div>
		</Layout>
	);
}
