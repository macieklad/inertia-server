import { router } from "../router";
import {
	postsIndexPage,
	notificationsPage,
	conversationsPage,
	type Post,
	type Notification,
	type Conversation,
} from "../inertia";

const generatePosts = (page: number, perPage: number): Post[] => {
	const start = (page - 1) * perPage;
	return Array.from({ length: perPage }, (_, i) => ({
		id: start + i + 1,
		title: `Post #${start + i + 1}: ${["Amazing Discovery", "Breaking News", "Tips & Tricks", "Deep Dive", "Quick Update"][i % 5]}`,
		excerpt: `This is the excerpt for post ${start + i + 1}. It contains a brief summary of the content.`,
		author: ["Alice", "Bob", "Charlie", "Diana", "Edward"][i % 5],
		createdAt: new Date(Date.now() - (start + i) * 86400000).toISOString().split("T")[0],
	}));
};

const TOTAL_POSTS = 50;
const POSTS_PER_PAGE = 10;

let notificationId = 1;
const mockNotifications: Notification[] = [
	{ id: notificationId++, message: "Welcome to the app!", type: "info", createdAt: new Date().toISOString() },
	{ id: notificationId++, message: "Your profile was updated", type: "success", createdAt: new Date().toISOString() },
];

const mockConversations: Conversation[] = [
	{
		id: 1,
		title: "Project Discussion",
		participants: ["Alice", "Bob"],
		messages: [
			{ id: 1, text: "Hey, how's the project going?", sender: "Alice" },
			{ id: 2, text: "Great! Almost done with the MVP.", sender: "Bob" },
		],
		lastActivity: new Date().toISOString(),
	},
	{
		id: 2,
		title: "Team Standup",
		participants: ["Charlie", "Diana", "Edward"],
		messages: [
			{ id: 1, text: "Good morning team!", sender: "Charlie" },
		],
		lastActivity: new Date().toISOString(),
	},
];

export const listsRoutes = router
	.get("/posts", ({ inertia, query }) => {
		const page = parseInt(query.page as string) || 1;
		const totalPages = Math.ceil(TOTAL_POSTS / POSTS_PER_PAGE);
		const hasMore = page < totalPages;

		return inertia.render(
			postsIndexPage({
				title: "Posts - Infinite Scroll Demo",
				posts: generatePosts(page, POSTS_PER_PAGE),
				currentPage: page,
				totalPages,
				hasMore,
			}),
		);
	})
	.get("/notifications", ({ inertia }) => {
		return inertia.render(
			notificationsPage({
				title: "Notifications - Prepend Demo",
				notifications: [...mockNotifications],
			}),
		);
	})
	.post("/notifications", ({ inertia }) => {
		const types: Notification["type"][] = ["info", "success", "warning", "error"];
		const messages = [
			"New message received",
			"Task completed successfully",
			"Storage running low",
			"Payment failed",
		];

		const newNotification: Notification = {
			id: notificationId++,
			message: messages[Math.floor(Math.random() * messages.length)],
			type: types[Math.floor(Math.random() * types.length)],
			createdAt: new Date().toISOString(),
		};

		mockNotifications.unshift(newNotification);

		return inertia.redirect("/notifications");
	})
	.get("/conversations", ({ inertia }) => {
		return inertia.render(
			conversationsPage({
				title: "Conversations - Deep Merge Demo",
				conversations: [...mockConversations],
			}),
		);
	})
	.post("/conversations/:id/messages", ({ inertia, params, body }) => {
		const conversation = mockConversations.find(
			(c) => c.id === parseInt(params.id),
		);
		if (conversation) {
			const { text, sender } = body as { text: string; sender: string };
			const newMessage = {
				id: conversation.messages.length + 1,
				text,
				sender,
			};
			conversation.messages.push(newMessage);
			conversation.lastActivity = new Date().toISOString();
		}

		return inertia.redirect("/conversations");
	});
