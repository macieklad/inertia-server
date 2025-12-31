import { usePage } from "@inertiajs/react";

export function FlashMessages() {
	const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

	if (!flash.success && !flash.error) {
		return null;
	}

	return (
		<div style={{ marginBottom: "1rem" }}>
			{flash.success && (
				<div
					style={{
						background: "#d4edda",
						color: "#155724",
						padding: "0.75rem 1rem",
						borderRadius: "4px",
						marginBottom: "0.5rem",
					}}
				>
					{flash.success}
				</div>
			)}
			{flash.error && (
				<div
					style={{
						background: "#f8d7da",
						color: "#721c24",
						padding: "0.75rem 1rem",
						borderRadius: "4px",
					}}
				>
					{flash.error}
				</div>
			)}
		</div>
	);
}
