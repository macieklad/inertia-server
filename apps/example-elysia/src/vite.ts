import { Elysia, status } from "elysia";
import type { ViteDevServer } from "vite";

let viteServer: ViteDevServer | null = null;
let viteInitPromise: Promise<ViteDevServer | null> | null = null;

const IS_PROD = process.env.NODE_ENV === "production";

// Initialize Vite server early in development
if (!IS_PROD) {
	getViteServer();
}

export function createViteExtension<const Path extends string = "/vite/*">({
	basePath = "/vite/*" as Path,
	enabled = true,
}: {
	basePath?: Path;
	enabled?: boolean;
} = {}) {
	return new Elysia({ name: "vite" }).all(basePath, async ({ request }) => {
		if (!enabled) {
			return status(404, "Not Found");
		}

		const response = await handleViteRequest(request);
		if (response) {
			return response;
		}
		return status(404, "Not Found");
	});
}

async function getViteServer(): Promise<ViteDevServer | null> {
	if (viteServer) {
		return viteServer;
	}

	if (!viteInitPromise) {
		viteInitPromise = createViteServer();
	}

	return viteInitPromise;
}

async function createViteServer(): Promise<ViteDevServer | null> {
	if (IS_PROD) {
		return null;
	}

	const { createServer } = await import("vite");
	viteServer = await createServer({
		server: {
			middlewareMode: true,
		},
		appType: "spa",
	});

	return viteServer;
}

async function handleViteRequest(request: Request): Promise<Response | null> {
	const vite = await getViteServer();

	if (!vite) {
		return status(500, {
			message: "Failed to create Vite server",
		});
	}

	const { toReqRes, toFetchResponse } = await import("fetch-to-node");

	const { req, res } = toReqRes(request);

	const handled = await new Promise<boolean>((resolve) => {
		vite.middlewares(req, res, () => {
			// next() was called - vite didn't handle the request
			resolve(false);
		});

		res.on("finish", () => {
			resolve(true);
		});
	});

	if (handled && res.writableEnded) {
		return toFetchResponse(res);
	}

	return null;
}

export function getViteDevServerUrl(): string {
	return "/vite";
}
