import { useForm } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { errorBagsPage } from "@/inertia";
import { FlashMessages } from "../components/FlashMessages";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

export default function ErrorBagsDemo({
	title,
	errors,
}: PageProps<typeof errorBagsPage>) {
	return (
		<Layout title={title}>
			<FlashMessages />
			<p className="mb-8 text-muted-foreground">
				This page demonstrates error bags. Each form has its own error bag, so
				validation errors from one form don't affect the other.
			</p>

			<div className="grid gap-6 lg:grid-cols-2">
				<LoginForm errors={errors.login} />
				<CreateUserForm errors={errors.createUser} />
			</div>
		</Layout>
	);
}

function LoginForm({
	errors,
}: {
	errors?: { email?: string; password?: string };
}) {
	const { data, setData, post, processing } = useForm({
		email: "",
		password: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/error-bags/form1", { errorBag: "login" });
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">
					Login Form (error bag: login)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="login-email">Email</Label>
						<Input
							id="login-email"
							name="login-email"
							type="email"
							value={data.email}
							onChange={(e) => setData("email", e.target.value)}
							className={cn(errors?.email && "border-destructive")}
						/>
						{errors?.email && (
							<p className="text-sm text-destructive" data-error="login-email">
								{errors.email}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="login-password">Password</Label>
						<Input
							id="login-password"
							name="login-password"
							type="password"
							value={data.password}
							onChange={(e) => setData("password", e.target.value)}
							className={cn(errors?.password && "border-destructive")}
						/>
						{errors?.password && (
							<p
								className="text-sm text-destructive"
								data-error="login-password"
							>
								{errors.password}
							</p>
						)}
					</div>

					<Button type="submit" disabled={processing}>
						{processing ? "Logging in..." : "Login"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

function CreateUserForm({
	errors,
}: {
	errors?: { name?: string; email?: string; password?: string };
}) {
	const { data, setData, post, processing } = useForm({
		name: "",
		email: "",
		password: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/error-bags/form2", { errorBag: "createUser" });
	};

	return (
		<Card className="bg-muted/30">
			<CardHeader>
				<CardTitle className="text-base">
					Create User Form (error bag: createUser)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="create-name">Name</Label>
						<Input
							id="create-name"
							name="create-name"
							type="text"
							value={data.name}
							onChange={(e) => setData("name", e.target.value)}
							className={cn(errors?.name && "border-destructive")}
						/>
						{errors?.name && (
							<p className="text-sm text-destructive" data-error="create-name">
								{errors.name}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="create-email">Email</Label>
						<Input
							id="create-email"
							name="create-email"
							type="email"
							value={data.email}
							onChange={(e) => setData("email", e.target.value)}
							className={cn(errors?.email && "border-destructive")}
						/>
						{errors?.email && (
							<p className="text-sm text-destructive" data-error="create-email">
								{errors.email}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="create-password">Password</Label>
						<Input
							id="create-password"
							name="create-password"
							type="password"
							value={data.password}
							onChange={(e) => setData("password", e.target.value)}
							className={cn(errors?.password && "border-destructive")}
						/>
						{errors?.password && (
							<p
								className="text-sm text-destructive"
								data-error="create-password"
							>
								{errors.password}
							</p>
						)}
					</div>

					<Button type="submit" variant="success" disabled={processing}>
						{processing ? "Creating..." : "Create User"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
