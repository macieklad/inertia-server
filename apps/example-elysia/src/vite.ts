import { Elysia } from "elysia";
import type { ViteDevServer } from "vite";

let viteServer: ViteDevServer | null = null;

export async function startViteServer(): Promise<number> {
	const { createServer } = await import("vite");
	viteServer = await createServer({
		server: {
			port: 5173,
			strictPort: true,
		},
	});

	await viteServer.listen();
	return 5173;
}

export function createViteMiddleware() {
	return new Elysia({ name: "vite" });
}

export function getViteDevServerUrl(): string {
	return "http://localhost:5173";
}
