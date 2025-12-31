import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
	title?: string;
}

export function Layout({ children, title }: LayoutProps) {
	return (
		<div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
			<nav
				style={{
					background: "#1a1a2e",
					padding: "1rem 2rem",
					display: "flex",
					gap: "1.5rem",
					alignItems: "center",
				}}
			>
				<Link href="/" style={{ color: "#fff", fontWeight: "bold", fontSize: "1.25rem", textDecoration: "none" }}>
					Inertia Server
				</Link>
				<div style={{ display: "flex", gap: "1rem" }}>
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
			<main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
				{title && <h1 style={{ marginBottom: "1.5rem" }}>{title}</h1>}
				{children}
			</main>
		</div>
	);
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link
			href={href}
			style={{
				color: "#a0a0c0",
				textDecoration: "none",
				fontSize: "0.875rem",
			}}
		>
			{children}
		</Link>
	);
}
