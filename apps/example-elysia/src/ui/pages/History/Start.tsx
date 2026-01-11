import { router } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import { useEffect, useState } from "react";
import type { historyStartPage } from "@/inertia";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const DEMO_USER_KEY = "inertia-demo-user";
const DEMO_ENCRYPT_KEY = "inertia-demo-encrypt";

export default function HistoryStart({
	title,
}: PageProps<typeof historyStartPage>) {
	const [name, setName] = useState("");
	const [encrypt, setEncrypt] = useState(false);
	const [historyState, setHistoryState] = useState<string>("");

	useEffect(() => {
		const updateHistoryState = () => {
			try {
				const state = window.history.state;
				setHistoryState(JSON.stringify(state, null, 2));
			} catch {
				setHistoryState("Unable to read history state");
			}
		};
		updateHistoryState();
		window.addEventListener("popstate", updateHistoryState);
		return () => window.removeEventListener("popstate", updateHistoryState);
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		localStorage.setItem(DEMO_USER_KEY, name);
		if (encrypt) {
			localStorage.setItem(DEMO_ENCRYPT_KEY, "true");
		} else {
			localStorage.removeItem(DEMO_ENCRYPT_KEY);
		}
		router.post("/history-demo/start", {
			name,
			encrypt: encrypt ? "on" : "",
		});
	};

	return (
		<Layout title={title}>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Step 1: Enter Your Name</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Your Name</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Enter your name"
									required
									data-testid="name-input"
								/>
							</div>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="encrypt"
									checked={encrypt}
									onChange={(e) => setEncrypt(e.target.checked)}
									className="h-4 w-4 rounded border-border"
									data-testid="encrypt-checkbox"
								/>
								<Label htmlFor="encrypt" className="cursor-pointer">
									Enable history encryption & clear history
								</Label>
							</div>
							<Button type="submit" disabled={!name.trim()}>
								Continue to Form
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card className="border-info/20 bg-info/5">
					<CardHeader>
						<CardTitle className="text-base">How This Demo Works</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<p>
							This demo shows how <code>useRemember</code> preserves form state
							in browser history, and how that can leak data after logout.
						</p>
						<ol className="list-decimal space-y-2 pl-4">
							<li>Enter your name and continue to the form page</li>
							<li>
								Type a message (uses <code>useRemember</code> to persist)
							</li>
							<li>Submit and see the result</li>
							<li>
								Click <strong>Logout</strong> to clear your session
							</li>
							<li>
								Click <strong>Go Back</strong> to return to the form
							</li>
							<li>
								<strong className="text-destructive">Problem:</strong> You see
								"Guest mode" but the message field still has the previous value!
							</li>
						</ol>
						<p className="font-medium">
							To fix this, enable the checkbox above. It calls{" "}
							<code>clearHistory</code> to reset the remembered state.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Current History State</CardTitle>
					</CardHeader>
					<CardContent>
						<pre
							data-testid="history-state"
							className="overflow-auto rounded bg-muted p-3 text-xs"
						>
							{historyState}
						</pre>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
