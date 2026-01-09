import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface LayoutProps {
	children: ReactNode;
	title?: string;
}

export function Layout({ children, title }: LayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<nav className="flex items-center gap-6 bg-primary px-6 py-3">
				<Link
					href="/"
					className="text-lg font-bold text-primary-foreground no-underline"
				>
					Inertia Server
				</Link>
				<div className="flex flex-wrap gap-4">
					<NavLink href="/">Home</NavLink>
					<NavLink href="/about">About</NavLink>
					<NavLink href="/contact">Contact</NavLink>
					<NavLink href="/users">Users</NavLink>
					<NavLink href="/posts">Posts</NavLink>
					<NavLink href="/deferred">Deferred</NavLink>
					<NavLink href="/once-props">Once</NavLink>
					<NavLink href="/optional-props">Optional</NavLink>
					<NavLink href="/always-props">Always</NavLink>
					<NavLink href="/notifications">Notifications</NavLink>
					<NavLink href="/conversations">Conversations</NavLink>
					<NavLink href="/secure">Secure</NavLink>
					<NavLink href="/error-bags">Error Bags</NavLink>
				</div>
			</nav>
			<main className="mx-auto max-w-5xl p-6">
				{title && <h1 className="mb-6 text-2xl font-bold">{title}</h1>}
				{children}
			</main>
		</div>
	);
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link
			href={href}
			className="text-sm text-primary-foreground/70 no-underline transition-colors hover:text-primary-foreground"
		>
			{children}
		</Link>
	);
}
