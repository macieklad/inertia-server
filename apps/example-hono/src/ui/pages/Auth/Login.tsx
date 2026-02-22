import { useForm } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { loginPage } from "@/inertia";
import { FlashMessages } from "../../components/FlashMessages";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";

export default function Login({
	title,
	demoCredentials,
	errors,
}: PageProps<typeof loginPage>) {
	const { data, setData, post, processing } = useForm({
		email: demoCredentials.email,
		password: demoCredentials.password,
	});

	const loginErrors = errors.login ?? {};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		post("/login", { errorBag: "login" });
	};

	return (
		<Layout title={title}>
			<FlashMessages />
			<Card className="max-w-xl">
				<CardHeader>
					<CardTitle>Login demo</CardTitle>
					<CardDescription>
						Seeded user in memory sqlite with flash + error bag behavior.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={data.email}
								onChange={(event) => setData("email", event.target.value)}
								className={cn(loginErrors.email && "border-destructive")}
							/>
							{loginErrors.email && (
								<p
									className="text-sm text-destructive"
									data-testid="login-email-error"
								>
									{loginErrors.email}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								value={data.password}
								onChange={(event) => setData("password", event.target.value)}
								className={cn(loginErrors.password && "border-destructive")}
							/>
							{loginErrors.password && (
								<p
									className="text-sm text-destructive"
									data-testid="login-password-error"
								>
									{loginErrors.password}
								</p>
							)}
						</div>

						<Button
							type="submit"
							disabled={processing}
							data-testid="login-submit"
						>
							{processing ? "Signing in..." : "Sign in"}
						</Button>
					</form>

					<div className="mt-6 space-y-2 border-t pt-4 text-sm text-muted-foreground">
						<p>Demo credentials</p>
						<code className="block rounded-sm bg-muted px-2 py-1 text-foreground">
							{demoCredentials.email}
						</code>
						<code className="block rounded-sm bg-muted px-2 py-1 text-foreground">
							{demoCredentials.password}
						</code>
					</div>
				</CardContent>
			</Card>
		</Layout>
	);
}
