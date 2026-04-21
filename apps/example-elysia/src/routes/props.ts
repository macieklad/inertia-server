import {
	alwaysPage,
	deferredPage,
	nestedPropsPage,
	oncePage,
	optionalPage,
} from "../inertia";
import { router } from "../router";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const propsRoutes = router
	.get("/deferred", ({ inertia }) => {
		return inertia.render(
			deferredPage({
				title: "Deferred Props Demo",
				quickData: "This loads instantly!",
				slowData: async () => {
					await sleep(2000);
					return "This data took 2 seconds to load";
				},
				sidebarData: async () => {
					await sleep(1500);
					return ["Sidebar Item 1", "Sidebar Item 2", "Sidebar Item 3"];
				},
			}),
		);
	})
	.get("/once-props", ({ inertia }) => {
		return inertia.render(
			oncePage({
				title: "Once Props Demo",
				timestamp: Date.now(),
				config: { theme: "dark", locale: "en-US" },
				plans: [
					{ id: 1, name: "Basic", price: 9 },
					{ id: 2, name: "Pro", price: 29 },
					{ id: 3, name: "Enterprise", price: 99 },
				],
			}),
		);
	})
	.get("/optional-props", ({ inertia }) => {
		return inertia.render(
			optionalPage({
				title: "Optional Props Demo",
				basicData: "This always loads",
				heavyData: () => ({
					items: Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`),
				}),
			}),
		);
	})
	.get("/always-props", ({ inertia }) => {
		return inertia.render(
			alwaysPage({
				title: "Always Props Demo",
				regularData: `Regular data fetched at ${new Date().toLocaleTimeString()}`,
				authData: () => ({
					isAuthenticated: true,
					permissions: ["read", "write", "delete"],
					lastChecked: new Date().toLocaleTimeString(),
				}),
			}),
		);
	})
	.get("/nested-props", ({ inertia }) => {
		return inertia.render(
			nestedPropsPage({
				title: "Nested Props Demo",
				identity: {
					name: "Ada Lovelace",
					email: "ada@example.com",
					team: "Protocol",
				},
				analyticsPanel: {
					analytics: async () => {
						await sleep(900);
						return {
							summary: "Engagement up 24% this week",
							chart: ["Mon 12", "Tue 18", "Wed 24"],
						};
					},
				},
				sidebar: {
					stats: async () => {
						await sleep(700);
						return { unread: 3 };
					},
					notes: async () => {
						await sleep(700);
						return ["Review the protocol diff", "Ship regression tests"];
					},
				},
			}),
		);
	});
