import { Link } from "@inertiajs/react";
import { Layout } from "../components/Layout";
import { FlashMessages } from "../components/FlashMessages";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { PageProps } from "inertia-server";
import type { homePage } from "@/inertia";

export default function Home({
  title,
  description,
}: PageProps<typeof homePage>) {
  return (
    <Layout title={title}>
      <FlashMessages />
      <p className="mb-8 text-lg text-muted-foreground">
        {description}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="CRUD Operations"
          description="Full user management with create, read, update, delete"
          href="/users"
        />
        <FeatureCard
          title="Infinite Scroll"
          description="Posts with merged props and pagination"
          href="/posts"
        />
        <FeatureCard
          title="Deferred Props"
          description="Lazy-load heavy data after initial render"
          href="/deferred"
        />
        <FeatureCard
          title="Once Props"
          description="Cache data that rarely changes"
          href="/once-props"
        />
        <FeatureCard
          title="Form Validation"
          description="Server-side validation with error handling"
          href="/contact"
        />
        <FeatureCard
          title="Error Bags"
          description="Multiple forms with separate error bags"
          href="/error-bags"
        />
      </div>
    </Layout>
  );
}

function FeatureCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block no-underline">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
