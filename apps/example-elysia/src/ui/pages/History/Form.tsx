import { router, useRemember } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import { useEffect, useState } from "react";
import type { historyFormPage } from "@/inertia";
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

export default function HistoryForm({
	title,
}: PageProps<typeof historyFormPage>) {
	const [formTouched, setFormTouched] = useState(false);
	const [message, setMessage] = useRemember("", "form-message");
	const [currentUser, setCurrentUser] = useState<string | null>(null);
	const [encryptEnabled, setEncryptEnabled] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setCurrentUser(localStorage.getItem(DEMO_USER_KEY));
		setEncryptEnabled(localStorage.getItem(DEMO_ENCRYPT_KEY) === "true");
		setIsHydrated(true);
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		router.post("/history-demo/submit", {
			userName: currentUser ?? "Guest",
			message,
			encrypt: encryptEnabled ? "on" : "",
		});
	};

	const isGuest = isHydrated && !currentUser;
	const hasLeakedData = isGuest && (message.length > 0 || formTouched);

	return (
		<Layout title={title}>
			<div className="space-y-6">
				{hasLeakedData && (
					<Card className="border-destructive bg-destructive/10">
						<CardHeader className="pb-2">
							<CardTitle className="text-base text-destructive">
								Data Leak Detected!
							</CardTitle>
						</CardHeader>
						<CardContent className="text-sm">
							<p>
								You're in <strong>Guest mode</strong> (logged out), but the
								message field below still contains data from a previous session.
								This is the <code>useRemember</code> data leak.
							</p>
							<p className="mt-2 text-muted-foreground">
								To prevent this, enable "history encryption" when starting.
							</p>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Step 2: Enter a message</CardTitle>
					</CardHeader>
					<CardContent>
						{isHydrated && (
							<p
								className="mb-4 text-sm text-muted-foreground"
								data-testid="greeting"
							>
								{currentUser ? (
									<>
										Hello, <span className="font-medium">{currentUser}</span>!
										Enter a message below.
									</>
								) : (
									<>
										<strong>Guest mode</strong> - No user logged in
									</>
								)}
							</p>
						)}
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="message">Your Message</Label>
								<Input
									id="message"
									value={message}
									onChange={(e) => {
										setFormTouched(true);
										setMessage(e.target.value);
									}}
									placeholder="Type something..."
									required
									data-testid="message-input"
								/>
							</div>
							<Button type="submit" disabled={!message.trim()}>
								Submit
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card className="border-warning/20 bg-warning/5">
					<CardHeader>
						<CardTitle className="text-base">useRemember is Active</CardTitle>
					</CardHeader>
					<CardContent className="text-sm">
						<p>
							The message field above uses{" "}
							<code className="rounded bg-muted px-1">useRemember</code>. The
							value is stored in browser history and persists when you navigate
							back.
						</p>
						<p className="mt-2 text-muted-foreground">
							After logout, going back through history will still show this
							value - even though you're no longer logged in.
						</p>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
