import { usePage } from "@inertiajs/react";
import { Badge } from "./ui/badge";

export function FlashMessages() {
	const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

	if (!flash.success && !flash.error) {
		return null;
	}

	return (
		<div className="mb-4 space-y-2">
			{flash.success && (
				<div className="flex items-center gap-2 rounded-sm border border-success/20 bg-success/10 px-4 py-3">
					<Badge variant="success" className="shrink-0">
						Success
					</Badge>
					<span className="text-sm">{flash.success}</span>
				</div>
			)}
			{flash.error && (
				<div className="flex items-center gap-2 rounded-sm border border-destructive/20 bg-destructive/10 px-4 py-3">
					<Badge variant="destructive" className="shrink-0">
						Error
					</Badge>
					<span className="text-sm">{flash.error}</span>
				</div>
			)}
		</div>
	);
}
