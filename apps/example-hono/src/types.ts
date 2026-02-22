import type { InertiaHelper } from "inertia-server";

declare module "hono" {
	interface ContextVariableMap {
		inertia: InertiaHelper;
		sessionId: string;
	}
}
