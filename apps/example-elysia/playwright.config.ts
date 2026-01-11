import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3000",
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
			url: "http://localhost:5173/@vite/client",
			name: "client",
			reuseExistingServer: !process.env.CI,
			timeout: 60 * 1000,
		},
		{
			command: "bun run dev:server",
			url: "http://localhost:3000",
			name: "server",
			reuseExistingServer: !process.env.CI,
			timeout: 60 * 1000,
		},
	],
});
