import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/vite/" : "/assets/",
  server: {
    hmr: {
      clientPort: 24678,
    },
  },
  build: {
    outDir: "dist/client",
    manifest: true,
    emptyOutDir: true,
    rollupOptions: {
      input: "src/ui/main.tsx",
    },
  },
  plugins: [react(), tsconfigPaths(), tailwindcss()],
}));
