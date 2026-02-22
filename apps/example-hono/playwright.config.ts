import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3002",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: [
		{
			command: "bun run dev:client",
			url: "http://localhost:5174/@vite/client",
			name: "client",
			reuseExistingServer: !process.env.CI,
			timeout: 60 * 1000,
		},
		{
			command: "PORT=3002 bun run dev:server",
			url: "http://localhost:3002/login",
			name: "server",
			reuseExistingServer: !process.env.CI,
			timeout: 60 * 1000,
		},
	],
});
