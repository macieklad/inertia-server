import { Link, useForm } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { usersCreatePage } from "@/inertia";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";

export default function UsersCreate({
	title,
	errors,
}: PageProps<typeof usersCreatePage>) {
	const { data, setData, post, processing } = useForm({
		name: "",
		email: "",
		password: "",
	});

	const formErrors = errors.createUser ?? {};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/users");
	};

	return (
		<Layout title={title}>
			<form onSubmit={handleSubmit} className="max-w-md space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						value={data.name}
						onChange={(e) => setData("name", e.target.value)}
						className={cn(formErrors.name && "border-destructive")}
					/>
					{formErrors.name && (
						<p className="text-sm text-destructive" data-error="name">
							{formErrors.name}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						value={data.email}
						onChange={(e) => setData("email", e.target.value)}
						className={cn(formErrors.email && "border-destructive")}
					/>
					{formErrors.email && (
						<p className="text-sm text-destructive" data-error="email">
							{formErrors.email}
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
						onChange={(e) => setData("password", e.target.value)}
						className={cn(formErrors.password && "border-destructive")}
					/>
					{formErrors.password && (
						<p className="text-sm text-destructive" data-error="password">
							{formErrors.password}
						</p>
					)}
				</div>

				<div className="flex gap-3">
					<Button type="submit" variant="success" disabled={processing}>
						{processing ? "Creating..." : "Create User"}
					</Button>
					<Button variant="outline" asChild>
						<Link href="/users">Cancel</Link>
					</Button>
				</div>
			</form>
		</Layout>
	);
}
