import { router } from "@inertiajs/react";
import { Layout } from "../../components/Layout";

interface Post {
	id: number;
	title: string;
	excerpt: string;
	author: string;
	createdAt: string;
}

interface Props {
	title: string;
	posts: Post[];
	currentPage: number;
	totalPages: number;
	hasMore: boolean;
}

export default function PostsIndex({ title, posts, currentPage, totalPages, hasMore }: Props) {
	const loadMore = () => {
		router.reload({
			data: { page: currentPage + 1 },
			only: ["posts", "currentPage", "hasMore"],
		});
	};

	return (
		<Layout title={title}>
			<p style={{ marginBottom: "1.5rem", color: "#666" }}>
				Showing {posts.length} posts (page {currentPage} of {totalPages}). 
				Posts use merged props for infinite scroll behavior.
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				{posts.map((post) => (
					<article
						key={post.id}
						style={{
							padding: "1.5rem",
							background: "#fff",
							border: "1px solid #e9ecef",
							borderRadius: "8px",
						}}
					>
						<h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem" }}>
							{post.title}
						</h2>
						<p style={{ margin: "0 0 0.75rem", color: "#666" }}>
							{post.excerpt}
						</p>
						<footer style={{ fontSize: "0.875rem", color: "#999" }}>
							By {post.author} on {post.createdAt}
						</footer>
					</article>
				))}
			</div>

			{hasMore && (
				<div style={{ textAlign: "center", marginTop: "2rem" }}>
					<button
						onClick={loadMore}
						style={{
							background: "#1a1a2e",
							color: "#fff",
							padding: "0.75rem 2rem",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							fontSize: "1rem",
						}}
					>
						Load More
					</button>
				</div>
			)}

			{!hasMore && posts.length > 0 && (
				<p style={{ textAlign: "center", marginTop: "2rem", color: "#666" }}>
					You've reached the end!
				</p>
			)}
		</Layout>
	);
}
