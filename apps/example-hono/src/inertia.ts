import { createInertia, prop } from "inertia-server";
import { loadManifest } from "./manifest";
import { renderToHtml } from "./ui/index";

declare module "@inertiajs/core" {
	export interface InertiaConfig {
		flashDataType: {
			success?: string;
			error?: string;
		};
		sharedPageProps: {
			appName: string;
		};
	}
}

declare global {
	namespace InertiaServer {
		interface ErrorBags {
			login: { email?: string; password?: string };
		}
	}
}

export type DashboardUser = {
	id: number;
	name: string;
	email: string;
};

const manifest = loadManifest();

export const { definePage, createHelper } = createInertia({
	version: "1.0.0",
	render: (page) => renderToHtml(page, manifest),
});

export const loginPage = definePage({
	component: "Auth/Login",
	props: {
		title: prop<string>(),
		demoCredentials: prop<{ email: string; password: string }>(),
	},
});

export const dashboardPage = definePage({
	component: "Dashboard",
	props: {
		title: prop<string>(),
		user: prop<DashboardUser>(),
		loginCount: prop<number>(),
	},
});
