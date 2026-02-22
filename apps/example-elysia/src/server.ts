import { Elysia } from "elysia";
import { router } from "./router";
import "./routes/advanced";
import "./routes/home";
import "./routes/lists";
import "./routes/props";
import "./routes/users";

const IS_PROD = process.env.NODE_ENV === "production";
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

const app = new Elysia();

if (IS_PROD) {
	const { staticPlugin } = await import("@elysiajs/static");
	app.use(
		staticPlugin({
			assets: "dist/client",
			prefix: "/assets",
		}),
	);
}

app.use(router).listen(PORT);

console.log(
	`Server running at http://localhost:${PORT} (${IS_PROD ? "production" : "development"})`,
);
