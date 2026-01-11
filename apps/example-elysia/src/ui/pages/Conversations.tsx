import { useForm } from "@inertiajs/react";
import type { PageProps } from "inertia-server";
import { useState } from "react";
import type { conversationsPage } from "@/inertia";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

export default function Conversations({
	title,
	conversations,
}: PageProps<typeof conversationsPage>) {
	const [selectedId, setSelectedId] = useState<number | null>(
		conversations[0]?.id ?? null,
	);
	const [isEditing, setIsEditing] = useState(false);

	const selectedConversation = conversations.find((c) => c.id === selectedId);

	return (
		<Layout title={title}>
			<p className="mb-6 text-muted-foreground">
				This demo uses deep merge props. Updates to conversation properties
				(like title) merge with existing data instead of replacing it. Try
				editing a conversation title or adding messages.
			</p>

			<div className="grid h-[500px] gap-4 lg:grid-cols-[280px_1fr]">
				<div className="overflow-auto rounded-sm border bg-muted/30">
					{conversations.map((conversation) => (
						<button
							type="button"
							key={conversation.id}
							onClick={() => {
								setSelectedId(conversation.id);
								setIsEditing(false);
							}}
							className={cn(
								"w-full border-b border-border p-4 text-left transition-colors hover:bg-muted/50",
								selectedId === conversation.id && "bg-muted",
							)}
						>
							<div className="font-medium">{conversation.title}</div>
							<div className="text-sm text-muted-foreground">
								{conversation.participants.join(", ")}
							</div>
							<div className="mt-1 text-xs text-muted-foreground">
								{conversation.messages.length} messages
							</div>
						</button>
					))}
				</div>

				<Card className="flex flex-col overflow-hidden">
					{selectedConversation ? (
						<>
							<CardHeader className="shrink-0 border-b pb-3">
								{isEditing ? (
									<EditTitleForm
										conversationId={selectedConversation.id}
										currentTitle={selectedConversation.title}
										onCancel={() => setIsEditing(false)}
										onSuccess={() => setIsEditing(false)}
									/>
								) : (
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-base">
												{selectedConversation.title}
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												{selectedConversation.participants.join(", ")}
											</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setIsEditing(true)}
										>
											Edit
										</Button>
									</div>
								)}
							</CardHeader>

							<CardContent className="flex-1 space-y-4 overflow-auto py-4">
								{selectedConversation.messages.map((message) => (
									<div key={message.id}>
										<div className="text-sm font-medium">{message.sender}</div>
										<div className="mt-1 rounded-sm bg-muted/50 px-3 py-2 text-sm">
											{message.text}
										</div>
									</div>
								))}
							</CardContent>

							<MessageForm conversationId={selectedConversation.id} />
						</>
					) : (
						<div className="flex flex-1 items-center justify-center text-muted-foreground">
							Select a conversation
						</div>
					)}
				</Card>
			</div>
		</Layout>
	);
}

function MessageForm({ conversationId }: { conversationId: number }) {
	const { data, setData, post, processing, reset } = useForm({
		text: "",
		sender: "You",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!data.text.trim()) return;
		post(`/conversations/${conversationId}/messages`, {
			onSuccess: () => reset("text"),
		});
	};

	return (
		<form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t p-4">
			<Input
				type="text"
				value={data.text}
				onChange={(e) => setData("text", e.target.value)}
				placeholder="Type a message..."
				className="flex-1"
			/>
			<Button type="submit" disabled={processing || !data.text.trim()}>
				Send
			</Button>
		</form>
	);
}

function EditTitleForm({
	conversationId,
	currentTitle,
	onCancel,
	onSuccess,
}: {
	conversationId: number;
	currentTitle: string;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const { data, setData, put, processing } = useForm({
		title: currentTitle,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!data.title.trim()) return;
		put(`/conversations/${conversationId}`, {
			onSuccess,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<Input
				type="text"
				value={data.title}
				onChange={(e) => setData("title", e.target.value)}
				className="flex-1"
				autoFocus
			/>
			<Button
				type="submit"
				size="sm"
				disabled={processing || !data.title.trim()}
			>
				Save
			</Button>
			<Button type="button" variant="ghost" size="sm" onClick={onCancel}>
				Cancel
			</Button>
		</form>
	);
}
