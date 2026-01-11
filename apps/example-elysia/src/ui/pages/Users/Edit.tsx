import { Link, useForm } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { usersEditPage } from "@/inertia";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";

export default function UsersEdit({
	title,
	user,
	errors,
}: PageProps<typeof usersEditPage>) {
	const { data, setData, put, processing } = useForm({
		name: user.name,
		email: user.email,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		put(`/users/${user.id}`);
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
						className={cn(errors.name && "border-destructive")}
					/>
					{errors.name && (
						<p className="text-sm text-destructive" data-error="name">
							{errors.name}
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
						className={cn(errors.email && "border-destructive")}
					/>
					{errors.email && (
						<p className="text-sm text-destructive" data-error="email">
							{errors.email}
						</p>
					)}
				</div>

				<Card className="bg-muted/50">
					<CardContent className="py-3">
						<p className="text-sm text-muted-foreground">
							Role: {user.role} | Created: {user.createdAt}
						</p>
					</CardContent>
				</Card>

				<div className="flex gap-3">
					<Button type="submit" disabled={processing}>
						{processing ? "Saving..." : "Update User"}
					</Button>
					<Button variant="outline" asChild>
						<Link href="/users">Cancel</Link>
					</Button>
				</div>
			</form>
		</Layout>
	);
}
