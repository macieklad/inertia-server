import { useForm } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { flashPage } from "@/inertia";
import { FlashMessages } from "../components/FlashMessages";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";

export default function Flash({ title, errors }: PageProps<typeof flashPage>) {
	const { data, setData, post, processing } = useForm({
		name: "",
		email: "",
		message: "",
	});

	const flashErrors = errors.flash ?? {};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/flash");
	};

	return (
		<Layout title={title}>
			<FlashMessages />
			<form onSubmit={handleSubmit} className="max-w-md space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						value={data.name}
						onChange={(e) => setData("name", e.target.value)}
						className={cn(flashErrors.name && "border-destructive")}
					/>
					{flashErrors.name && (
						<p className="text-sm text-destructive" data-error="name">
							{flashErrors.name}
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
						className={cn(flashErrors.email && "border-destructive")}
					/>
					{flashErrors.email && (
						<p className="text-sm text-destructive" data-error="email">
							{flashErrors.email}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="message">Message</Label>
					<Textarea
						id="message"
						name="message"
						value={data.message}
						onChange={(e) => setData("message", e.target.value)}
						rows={5}
						className={cn(flashErrors.message && "border-destructive")}
					/>
					{flashErrors.message && (
						<p className="text-sm text-destructive" data-error="message">
							{flashErrors.message}
						</p>
					)}
				</div>

				<Button type="submit" disabled={processing}>
					{processing ? "Sending..." : "Send Message"}
				</Button>
			</form>
		</Layout>
	);
}
