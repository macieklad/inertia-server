import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
	base: command === "build" ? "/assets/" : "/",
	build: {
		outDir: "dist/client",
		manifest: true,
		emptyOutDir: true,
		rollupOptions: {
			input: "src/ui/main.tsx",
		},
	},
	server: {
		origin: "http://localhost:5173",
	},
	plugins: [react(), tsconfigPaths(), tailwindcss()],
}));
