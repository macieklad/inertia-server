import { Elysia } from "elysia";
import { advancedRoutes } from "./routes/advanced";
import { homeRoutes } from "./routes/home";
import { listsRoutes } from "./routes/lists";
import { propsRoutes } from "./routes/props";
import { usersRoutes } from "./routes/users";

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

app
	.use(homeRoutes)
	.use(usersRoutes)
	.use(propsRoutes)
	.use(listsRoutes)
	.use(advancedRoutes)
	.listen(PORT);

console.log(
	`Server running at http://localhost:${PORT} (${IS_PROD ? "production" : "development"})`,
);
