import { Elysia } from "elysia";
import { inertiaPlugin } from "./inertia";

/**
 * Base router with inertia plugin.
 * All routes should extend from this to get proper typing for the `inertia` helper.
 */
export const router = new Elysia({ name: "router" })
	.use(inertiaPlugin)
	.as("global");
