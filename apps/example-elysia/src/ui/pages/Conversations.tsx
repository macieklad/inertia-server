import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { Layout } from "../components/Layout";

interface Message {
	id: number;
	text: string;
	sender: string;
}

interface Conversation {
	id: number;
	title: string;
	participants: string[];
	messages: Message[];
	lastActivity: string;
}

interface Props {
	title: string;
	conversations: Conversation[];
}

export default function Conversations({ title, conversations }: Props) {
	const [selectedId, setSelectedId] = useState<number | null>(
		conversations[0]?.id ?? null,
	);

	const selectedConversation = conversations.find((c) => c.id === selectedId);

	return (
		<Layout title={title}>
			<p style={{ marginBottom: "1.5rem", color: "#666" }}>
				Messages use deep merge props, allowing nested updates without replacing the entire conversation.
			</p>

			<div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", height: "500px" }}>
				<div style={{ background: "#f8f9fa", borderRadius: "8px", overflow: "auto" }}>
					{conversations.map((conversation) => (
						<button
							key={conversation.id}
							onClick={() => setSelectedId(conversation.id)}
							style={{
								width: "100%",
								padding: "1rem",
								border: "none",
								borderBottom: "1px solid #e9ecef",
								background: selectedId === conversation.id ? "#e9ecef" : "transparent",
								textAlign: "left",
								cursor: "pointer",
							}}
						>
							<div style={{ fontWeight: 500 }}>{conversation.title}</div>
							<div style={{ fontSize: "0.875rem", color: "#666" }}>
								{conversation.participants.join(", ")}
							</div>
							<div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.25rem" }}>
								{conversation.messages.length} messages
							</div>
						</button>
					))}
				</div>

				<div style={{ background: "#fff", border: "1px solid #e9ecef", borderRadius: "8px", display: "flex", flexDirection: "column" }}>
					{selectedConversation ? (
						<>
							<div style={{ padding: "1rem", borderBottom: "1px solid #e9ecef" }}>
								<h3 style={{ margin: 0 }}>{selectedConversation.title}</h3>
								<div style={{ fontSize: "0.875rem", color: "#666" }}>
									{selectedConversation.participants.join(", ")}
								</div>
							</div>

							<div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
								{selectedConversation.messages.map((message) => (
									<div key={message.id} style={{ marginBottom: "1rem" }}>
										<div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
											{message.sender}
										</div>
										<div style={{ background: "#f8f9fa", padding: "0.5rem 0.75rem", borderRadius: "8px", marginTop: "0.25rem" }}>
											{message.text}
										</div>
									</div>
								))}
							</div>

							<MessageForm conversationId={selectedConversation.id} />
						</>
					) : (
						<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
							Select a conversation
						</div>
					)}
				</div>
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
		<form onSubmit={handleSubmit} style={{ padding: "1rem", borderTop: "1px solid #e9ecef", display: "flex", gap: "0.5rem" }}>
			<input
				type="text"
				value={data.text}
				onChange={(e) => setData("text", e.target.value)}
				placeholder="Type a message..."
				style={{
					flex: 1,
					padding: "0.5rem",
					border: "1px solid #ced4da",
					borderRadius: "4px",
				}}
			/>
			<button
				type="submit"
				disabled={processing || !data.text.trim()}
				style={{
					background: "#1a1a2e",
					color: "#fff",
					padding: "0.5rem 1rem",
					border: "none",
					borderRadius: "4px",
					cursor: processing ? "not-allowed" : "pointer",
				}}
			>
				Send
			</button>
		</form>
	);
}
