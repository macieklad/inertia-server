import { Link, usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import logoSrc from "../assets/logo.svg";
import { cn } from "../lib/utils";

interface LayoutProps {
	children: ReactNode;
	title?: string;
}

const navGroups = [
	{
		label: "Authentication",
		links: [
			{ href: "/login", label: "Login" },
			{ href: "/dashboard", label: "Dashboard" },
		],
	},
];

export function Layout({ children, title }: LayoutProps) {
	const { url } = usePage();

	return (
		<div className="flex min-h-screen bg-background">
			<aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r bg-muted/30">
				<div className="border-b p-4">
					<Link href="/login" className="block no-underline">
						<img src={logoSrc} alt="inertia >> server" className="h-6" />
					</Link>
				</div>
				<nav className="flex-1 overflow-auto p-4">
					{navGroups.map((group) => (
						<div key={group.label} className="mb-6">
							<div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
								{group.label}
							</div>
							<div className="space-y-1">
								{group.links.map((link) => (
									<NavLink
										key={link.href}
										href={link.href}
										active={
											url === link.href ||
											(link.href !== "/" && url.startsWith(link.href))
										}
									>
										{link.label}
									</NavLink>
								))}
							</div>
						</div>
					))}
				</nav>
				<div className="border-t p-4">
					<div className="text-xs text-muted-foreground">Demo Application</div>
				</div>
			</aside>
			<main className="flex-1 overflow-auto">
				<div className="mx-auto max-w-4xl p-8">
					{title && <h1 className="mb-6 text-2xl font-bold">{title}</h1>}
					{children}
				</div>
			</main>
		</div>
	);
}

function NavLink({
	href,
	children,
	active,
}: {
	href: string;
	children: ReactNode;
	active?: boolean;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"block rounded-sm px-3 py-1.5 text-sm no-underline transition-colors",
				active
					? "bg-brand/10 font-medium text-brand"
					: "text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			{children}
		</Link>
	);
}
