# inertia-server

TypeScript library for server-side Inertia.js integration.

Modern server adapter for Inertia.js with first-class TypeScript support, built-in prop management, and framework-agnostic design.

## Install

```bash
npm install inertia-server
# or
bun add inertia-server
# or
yarn add inertia-server
```

## Features

- ✓ **Type-safe props**: Infer prop types end-to-end with TypeScript
- ✓ **Prop builders**: Deferred, optional, always, and merged props
- ✓ **Error handling**: Validation error bags with per-field feedback
- ✓ **Flash messages**: One-time messages across page redirects
- ✓ **Partial reloads**: Rerender only specific components
- ✓ **Version control**: Automatic version conflict detection
- ✓ **Framework adapters**: Elysia (Hono/Express coming soon)

## Quick Start

### Elysia

```typescript
import { Elysia } from "elysia";
import { createInertia, prop } from "inertia-server";
import { elysiaAdapter } from "inertia-server/elysia";

const { definePage, createHelper } = createInertia({
  version: "1.0.0",
  render: (page) => renderToString(<Root page={page} />),
});

// Define pages with type-safe props
const homePage = definePage("Home", {
  title: prop.string(),
  count: prop.number().optional(),
  items: prop.deferred(async () => fetchItems()),
});

const app = new Elysia();
app.use(elysiaAdapter(createHelper));

app.get("/", ({ inertia }) => {
  return inertia.render(homePage({ title: "Home" }));
});
```

### Props

```typescript
// Required prop
prop.string()

// Optional prop
prop.string().optional()

// Deferred prop (lazy-loaded on the client)
prop.deferred(async () => fetchData())

// Always included (even on partial reloads)
prop.always(() => getUser())

// Merged with existing props
prop.merged(() => getSharedProps())
```

### Error Handling

```typescript
import { createErrorBag } from "inertia-server";

const errors = createErrorBag();
errors.add("email", "Email is required");
errors.add("password", "Password must be at least 8 characters");

return inertia.redirect("/login", { errors: errors.all() });
```

### Flash Messages

```typescript
return inertia.redirect("/dashboard", {
  flash: { success: "User created successfully" },
});
```

## Exports

### Main
```typescript
import { createInertia, prop, createErrorBag } from "inertia-server";
```

### Elysia Adapter
```typescript
import { elysiaAdapter } from "inertia-server/elysia";
```

### Types
```typescript
import type { InertiaPage, PropBuilderState } from "inertia-server/types";
```

## Documentation

Full documentation: https://inertia-server.vercel.app

## Example

See the full example app: https://github.com/macieklad/inertia-server/tree/master/apps/example-elysia

## License

MIT
