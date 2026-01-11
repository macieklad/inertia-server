import { useForm } from "@inertiajs/react";
import { Layout } from "../components/Layout";
import { FlashMessages } from "../components/FlashMessages";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";
import { PageProps } from "inertia-server";
import type { contactPage } from "@/inertia";

export default function Contact({ title, errors }: PageProps<typeof contactPage>) {
	const { data, setData, post, processing } = useForm({
		name: "",
		email: "",
		message: "",
	});

	const contactErrors = errors.contact ?? {};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/contact");
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
						className={cn(contactErrors.name && "border-destructive")}
					/>
					{contactErrors.name && (
						<p className="text-sm text-destructive" data-error="name">{contactErrors.name}</p>
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
						className={cn(contactErrors.email && "border-destructive")}
					/>
					{contactErrors.email && (
						<p className="text-sm text-destructive" data-error="email">{contactErrors.email}</p>
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
						className={cn(contactErrors.message && "border-destructive")}
					/>
					{contactErrors.message && (
						<p className="text-sm text-destructive" data-error="message">{contactErrors.message}</p>
					)}
				</div>

				<Button type="submit" disabled={processing}>
					{processing ? "Sending..." : "Send Message"}
				</Button>
			</form>
		</Layout>
	);
}
