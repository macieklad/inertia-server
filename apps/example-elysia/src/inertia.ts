import {
	always,
	createInertia,
	deepMerged,
	deferred,
	type ModifierTree,
	merged,
	once,
	optional,
} from "inertia-server";
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
			user?: { id: number; name: string; email: string } | null;
			demoUser?: string;
		};
	}
}

declare global {
	namespace InertiaServer {
		interface ErrorBags {
			flash: { name?: string; email?: string; message?: string };
			createUser: { name?: string; email?: string; password?: string };
			login: { email?: string; password?: string };
			editUser: { name?: string; email?: string };
		}
	}
}

const manifest = loadManifest();

export const { definePage, createHelper } = createInertia({
	version: "1.0.0",
	render: (page) => renderToHtml(page, manifest),
});

export const homePage = definePage<{
	title: string;
	description: string;
}>({
	component: "Home",
});

export const flashPage = definePage<{
	title: string;
}>({
	component: "Flash",
});

export type User = {
	id: number;
	name: string;
	email: string;
	role: string;
	createdAt: string;
};

export const usersIndexPage = definePage<{
	title: string;
	users: User[];
	search: string;
	page: number;
	totalPages: number;
}>({
	component: "Users/Index",
});

export const usersCreatePage = definePage<{
	title: string;
}>({
	component: "Users/Create",
});

export const usersEditPage = definePage<{
	title: string;
	user: User;
}>({
	component: "Users/Edit",
});

type DeferredPageData = {
	title: string;
	quickData: string;
	slowData: string;
	sidebarData: string[];
};

const deferredPageModifiers = {
	slowData: deferred(),
	sidebarData: deferred("sidebar"),
} satisfies ModifierTree<DeferredPageData>;

export const deferredPage = definePage<
	DeferredPageData,
	typeof deferredPageModifiers
>({
	component: "DeferredDemo",
	modifiers: deferredPageModifiers,
});

type OncePageData = {
	title: string;
	timestamp: number;
	config: { theme: string; locale: string };
	plans: { id: number; name: string; price: number }[];
};

const oncePageModifiers = {
	config: once(),
	plans: once({ expiresAt: Date.now() + 60000 }),
} satisfies ModifierTree<OncePageData>;

export const oncePage = definePage<OncePageData, typeof oncePageModifiers>({
	component: "OncePropsDemo",
	modifiers: oncePageModifiers,
});

type OptionalPageData = {
	title: string;
	basicData: string;
	heavyData: { items: string[] };
};

const optionalPageModifiers = {
	heavyData: optional(),
} satisfies ModifierTree<OptionalPageData>;

export const optionalPage = definePage<
	OptionalPageData,
	typeof optionalPageModifiers
>({
	component: "OptionalPropsDemo",
	modifiers: optionalPageModifiers,
});

type AlwaysPageData = {
	title: string;
	regularData: string;
	authData: {
		isAuthenticated: boolean;
		permissions: string[];
		lastChecked: string;
	};
};

const alwaysPageModifiers = {
	authData: always(),
} satisfies ModifierTree<AlwaysPageData>;

export const alwaysPage = definePage<
	AlwaysPageData,
	typeof alwaysPageModifiers
>({
	component: "AlwaysPropsDemo",
	modifiers: alwaysPageModifiers,
});

export type Post = {
	id: number;
	title: string;
	excerpt: string;
	author: string;
	createdAt: string;
};

type PostsPageData = {
	title: string;
	posts: Post[];
};

const postsPageModifiers = {
	posts: merged<Post[]>({ matchOn: "id" }).scroll({ pageName: "page" }),
} satisfies ModifierTree<PostsPageData>;

export const postsPage = definePage<PostsPageData, typeof postsPageModifiers>({
	component: "Posts",
	modifiers: postsPageModifiers,
});

export type Notification = {
	id: number;
	message: string;
	type: "info" | "success" | "warning" | "error";
	createdAt: string;
};

type NotificationsPageData = {
	title: string;
	notifications: Notification[];
};

const notificationsPageModifiers = {
	notifications: merged<Notification[]>({ matchOn: "id" }).prepend(),
} satisfies ModifierTree<NotificationsPageData>;

export const notificationsPage = definePage<
	NotificationsPageData,
	typeof notificationsPageModifiers
>({
	component: "Notifications",
	modifiers: notificationsPageModifiers,
});

export type Conversation = {
	id: number;
	title: string;
	participants: string[];
	messages: { id: number; text: string; sender: string }[];
	lastActivity: string;
};

type ConversationsPageData = {
	title: string;
	conversations: Conversation[];
};

const conversationsPageModifiers = {
	conversations: deepMerged<Conversation[]>({ matchOn: "id" }),
} satisfies ModifierTree<ConversationsPageData>;

export const conversationsPage = definePage<
	ConversationsPageData,
	typeof conversationsPageModifiers
>({
	component: "Conversations",
	modifiers: conversationsPageModifiers,
});

type NestedPropsPageData = {
	title: string;
	identity: {
		name: string;
		email: string;
		team: string;
	};
	analyticsPanel: {
		analytics: {
			summary: string;
			chart: string[];
		};
	};
	sidebar: {
		stats: {
			unread: number;
		};
		notes: string[];
	};
};

const nestedPropsPageModifiers = {
	analyticsPanel: {
		analytics: deferred(),
	},
	sidebar: deferred(),
} satisfies ModifierTree<NestedPropsPageData>;

export const nestedPropsPage = definePage<
	NestedPropsPageData,
	typeof nestedPropsPageModifiers
>({
	component: "NestedPropsDemo",
	modifiers: nestedPropsPageModifiers,
});

export const historyStartPage = definePage<{
	title: string;
}>({
	component: "History/Start",
});

export const historyFormPage = definePage<{
	title: string;
}>({
	component: "History/Form",
});

export const historyResultPage = definePage<{
	title: string;
	userName: string;
	message: string;
}>({
	component: "History/Result",
});

export const errorBagsPage = definePage<{
	title: string;
}>({
	component: "ErrorBagsDemo",
});
