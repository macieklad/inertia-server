import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { router } from "./router";

const IS_PROD = process.env.NODE_ENV === "production";
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3002;

const app = new Hono();

if (IS_PROD) {
	app.use(
		"/assets/*",
		serveStatic({
			root: "./dist/client",
		}),
	);
}

app.route("/", router);

const server = Bun.serve({
	port: PORT,
	fetch: app.fetch,
});

console.log(
	`Server running at http://localhost:${server.port} (${IS_PROD ? "production" : "development"})`,
);
