import { Elysia } from "elysia";
import { homeRoutes } from "./routes/home";
import { usersRoutes } from "./routes/users";
import { propsRoutes } from "./routes/props";
import { listsRoutes } from "./routes/lists";
import { advancedRoutes } from "./routes/advanced";

const IS_PROD = process.env.NODE_ENV === "production";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Elysia();

if (IS_PROD) {
	const { staticPlugin } = await import("@elysiajs/static");
	app.use(
		staticPlugin({
			assets: "dist/client",
			prefix: "/assets",
		}),
	);
} else {
	const { createViteExtension } = await import("./vite");
	app.use(createViteExtension({ enabled: true }));
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
