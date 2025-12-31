import { router } from "@inertiajs/react";
import { Layout } from "../components/Layout";

interface Notification {
	id: number;
	message: string;
	type: "info" | "success" | "warning" | "error";
	createdAt: string;
}

interface Props {
	title: string;
	notifications: Notification[];
}

const typeColors = {
	info: { bg: "#d1ecf1", border: "#bee5eb", text: "#0c5460" },
	success: { bg: "#d4edda", border: "#c3e6cb", text: "#155724" },
	warning: { bg: "#fff3cd", border: "#ffeeba", text: "#856404" },
	error: { bg: "#f8d7da", border: "#f5c6cb", text: "#721c24" },
};

export default function Notifications({ title, notifications }: Props) {
	const addNotification = () => {
		router.post("/notifications");
	};

	return (
		<Layout title={title}>
			<p style={{ marginBottom: "1.5rem", color: "#666" }}>
				New notifications are prepended to the list using merged props with prepend direction.
			</p>

			<button
				onClick={addNotification}
				style={{
					background: "#28a745",
					color: "#fff",
					padding: "0.75rem 1.5rem",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
					marginBottom: "1.5rem",
				}}
			>
				Add Random Notification
			</button>

			<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
				{notifications.map((notification) => {
					const colors = typeColors[notification.type];
					return (
						<div
							key={notification.id}
							style={{
								padding: "1rem",
								background: colors.bg,
								border: `1px solid ${colors.border}`,
								borderRadius: "4px",
								color: colors.text,
							}}
						>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<span>{notification.message}</span>
								<span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
									{new Date(notification.createdAt).toLocaleTimeString()}
								</span>
							</div>
						</div>
					);
				})}

				{notifications.length === 0 && (
					<p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>
						No notifications yet. Click the button above to add some!
					</p>
				)}
			</div>
		</Layout>
	);
}
