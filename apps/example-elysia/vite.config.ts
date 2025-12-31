import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	build: {
		outDir: "dist/client",
		manifest: true,
		emptyOutDir: true,
		rollupOptions: {
			input: "src/ui/main.tsx",
		},
	},
	plugins: [react(), tsconfigPaths()],
});
