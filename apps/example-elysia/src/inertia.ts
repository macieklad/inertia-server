import {
  createInertia,
  prop,
  mergedProp,
  deepMergedProp,
} from "inertia-server";
import { elysiaAdapter } from "inertia-server/elysia";
import { renderToHtml } from "./ui/index";
import { loadManifest } from "./manifest";

declare global {
  namespace Inertia {
    interface Flashable {
      success?: string;
      error?: string;
    }
    interface Shared {
      appName: string;
      user?: { id: number; name: string; email: string } | null;
    }
    interface ErrorBags {
      contact: { name?: string; email?: string; message?: string };
      createUser: { name?: string; email?: string; password?: string };
      login: { email?: string; password?: string };
    }
  }
}

const manifest = loadManifest();

export const { definePage, createHelper } = createInertia({
  version: "1.0.0",
  render: (page) => renderToHtml(page, manifest),
});

export const inertiaPlugin = elysiaAdapter(createHelper);

export const homePage = definePage({
  component: "Home",
  props: {
    title: prop<string>(),
    description: prop<string>(),
  },
});

export const aboutPage = definePage({
  component: "About",
  props: {
    title: prop<string>(),
    content: prop<string>(),
  },
});

export const contactPage = definePage({
  component: "Contact",
  props: {
    title: prop<string>(),
  },
});

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export const usersIndexPage = definePage({
  component: "Users/Index",
  props: {
    title: prop<string>(),
    users: prop<User[]>(),
    search: prop<string>(),
    page: prop<number>(),
    totalPages: prop<number>(),
  },
});

export const usersCreatePage = definePage({
  component: "Users/Create",
  props: {
    title: prop<string>(),
  },
});

export const usersEditPage = definePage({
  component: "Users/Edit",
  props: {
    title: prop<string>(),
    user: prop<User>(),
  },
});

export const deferredPage = definePage({
  component: "DeferredDemo",
  props: {
    title: prop<string>(),
    quickData: prop<string>(),
    slowData: prop<string>().deferred(),
    sidebarData: prop<string[]>().deferred("sidebar"),
  },
});

export const oncePage = definePage({
  component: "OncePropsDemo",
  props: {
    title: prop<string>(),
    timestamp: prop<number>(),
    config: prop<{ theme: string; locale: string }>().once(),
    plans: prop<{ id: number; name: string; price: number }[]>().once({
      expiresAt: Date.now() + 60000,
    }),
  },
});

export const optionalPage = definePage({
  component: "OptionalPropsDemo",
  props: {
    title: prop<string>(),
    basicData: prop<string>(),
    heavyData: prop<{ items: string[] }>().optional(),
  },
});

export const alwaysPage = definePage({
  component: "AlwaysPropsDemo",
  props: {
    title: prop<string>(),
    regularData: prop<string>(),
    authData: prop<{
      isAuthenticated: boolean;
      permissions: string[];
    }>().always(),
  },
});

export type Post = {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  createdAt: string;
};

export const postsIndexPage = definePage({
  component: "Posts/Index",
  props: {
    title: prop<string>(),
    posts: mergedProp<Post[]>({ matchOn: "id" }).scroll({ pageName: "page" }),
    currentPage: prop<number>(),
    totalPages: prop<number>(),
    hasMore: prop<boolean>(),
  },
});

export type Notification = {
  id: number;
  message: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
};

export const notificationsPage = definePage({
  component: "Notifications",
  props: {
    title: prop<string>(),
    notifications: mergedProp<Notification[]>({ matchOn: "id" }).prepend(),
  },
});

export type Conversation = {
  id: number;
  title: string;
  participants: string[];
  messages: { id: number; text: string; sender: string }[];
  lastActivity: string;
};

export const conversationsPage = definePage({
  component: "Conversations",
  props: {
    title: prop<string>(),
    conversations: deepMergedProp<Conversation[]>({ matchOn: "id" }),
  },
});

export const securePage = definePage({
  component: "SecurePage",
  props: {
    title: prop<string>(),
    sensitiveData: prop<string>(),
  },
});

export const errorBagsPage = definePage({
  component: "ErrorBagsDemo",
  props: {
    title: prop<string>(),
  },
});
