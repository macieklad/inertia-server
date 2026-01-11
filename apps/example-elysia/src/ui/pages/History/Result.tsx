import type { PageProps } from "inertia-server";
import { useState } from "react";
import type { historyResultPage } from "@/inertia";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

const DEMO_USER_KEY = "inertia-demo-user";

export default function HistoryResult({
	title,
	userName,
	message,
}: PageProps<typeof historyResultPage>) {
	const [wasLoggedOut, setWasLoggedOut] = useState(false);
	const handleLogout = () => {
		setWasLoggedOut(true);
		localStorage.removeItem(DEMO_USER_KEY);
	};

	const handleGoBack = () => {
		window.history.back();
	};

	return (
		<Layout title={title}>
			<div className="space-y-6">
				<Card className="border-success/20 bg-success/5">
					<CardHeader>
						<CardTitle>Step 3: Submission Complete</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-sm bg-muted p-4">
							<p className="text-sm text-muted-foreground">User</p>
							<p className="font-medium" data-testid="result-user">
								{userName}
							</p>
						</div>
						<div className="rounded-sm bg-muted p-4">
							<p className="text-sm text-muted-foreground">Message</p>
							<p className="font-medium" data-testid="result-message">
								{message}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Test the Data Leak</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<ol className="list-decimal space-y-2 pl-4">
							<li>
								Click <strong>Logout</strong> to clear your session
							</li>
							<li>
								Click <strong>Go Back</strong> to return to the form
							</li>
							<li>
								Observe: You're in "Guest mode" but the message field still has
								your data!
							</li>
						</ol>
						<div className="flex gap-3 pt-2">
							<Button
								type="button"
								variant="destructive"
								onClick={handleLogout}
								data-testid="logout-button"
								disabled={wasLoggedOut}
							>
								{wasLoggedOut ? "Logged Out" : "Logout"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={handleGoBack}
								data-testid="go-back-button"
							>
								Go Back
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="border-info/20 bg-info/5">
					<CardHeader>
						<CardTitle className="text-base">Why This Happens</CardTitle>
					</CardHeader>
					<CardContent className="text-sm space-y-2">
						<p>
							<code>useRemember</code> stores form state in{" "}
							<code>history.state</code>. When you navigate back through browser
							history, this state is restored.
						</p>
						<p>
							Logging out clears your session, but it doesn't clear the browser
							history. The old form data is still there.
						</p>
						<p className="font-medium">
							Solution: Call <code>clearHistory()</code> on sensitive
							transitions (like login/logout) to wipe the remembered state.
						</p>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
