import { router } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import type { notificationsPage } from "@/inertia";
import { Layout } from "../components/Layout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { cn } from "../lib/utils";

const typeVariants = {
	info: "info",
	success: "success",
	warning: "warning",
	error: "destructive",
} as const;

const typeBorderClasses = {
	info: "border-l-info",
	success: "border-l-success",
	warning: "border-l-warning",
	error: "border-l-destructive",
} as const;

export default function Notifications({
	title,
	notifications,
}: PageProps<typeof notificationsPage>) {
	const addNotification = () => {
		router.post("/notifications");
	};

	return (
		<Layout title={title}>
			<p className="mb-6 text-muted-foreground">
				New notifications are prepended to the list using merged props with
				prepend direction.
			</p>

			<Button variant="success" onClick={addNotification} className="mb-6">
				Add Random Notification
			</Button>

			<div className="flex flex-col gap-3">
				{notifications.map((notification) => (
					<Card
						key={notification.id}
						className={cn("border-l-4", typeBorderClasses[notification.type])}
					>
						<CardContent className="flex items-center justify-between py-3">
							<div className="flex items-center gap-3">
								<Badge variant={typeVariants[notification.type]}>
									{notification.type}
								</Badge>
								<span className="text-sm">{notification.message}</span>
							</div>
							<span className="text-xs text-muted-foreground">
								{new Date(notification.createdAt).toLocaleTimeString()}
							</span>
						</CardContent>
					</Card>
				))}

				{notifications.length === 0 && (
					<p className="py-8 text-center text-muted-foreground">
						No notifications yet. Click the button above to add some!
					</p>
				)}
			</div>
		</Layout>
	);
}
