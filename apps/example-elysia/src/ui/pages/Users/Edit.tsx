import { useForm, Link } from "@inertiajs/react";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { PageProps } from "inertia-server";
import type { usersEditPage } from "@/inertia";

export default function UsersEdit({ title, user, errors }: PageProps<typeof usersEditPage>) {
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
						type="text"
						value={data.name}
						onChange={(e) => setData("name", e.target.value)}
						className={cn(errors.name && "border-destructive")}
					/>
					{errors.name && (
						<p className="text-sm text-destructive">{errors.name}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						value={data.email}
						onChange={(e) => setData("email", e.target.value)}
						className={cn(errors.email && "border-destructive")}
					/>
					{errors.email && (
						<p className="text-sm text-destructive">{errors.email}</p>
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
						{processing ? "Saving..." : "Save Changes"}
					</Button>
					<Button variant="outline" asChild>
						<Link href="/users">Cancel</Link>
					</Button>
				</div>
			</form>
		</Layout>
	);
}
