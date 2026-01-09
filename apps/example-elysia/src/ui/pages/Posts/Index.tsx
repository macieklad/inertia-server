import { router } from "@inertiajs/react";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { PageProps } from "inertia-server";
import type { postsIndexPage } from "@/inertia";

export default function PostsIndex({
  title,
  posts,
  currentPage,
  totalPages,
  hasMore,
}: PageProps<typeof postsIndexPage>) {
  const loadMore = () => {
    router.reload({
      data: { page: currentPage + 1 },
      only: ["posts", "currentPage", "hasMore"],
    });
  };

  return (
    <Layout title={title}>
      <p className="mb-6 text-muted-foreground">
        Showing {posts.length} posts (page {currentPage} of {totalPages}). Posts
        use merged props for infinite scroll behavior.
      </p>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                By {post.author} on {post.createdAt}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Button onClick={loadMore} size="lg">
            Load More
          </Button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          You've reached the end!
        </p>
      )}
    </Layout>
  );
}
