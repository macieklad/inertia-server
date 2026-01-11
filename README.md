# inertia-server

> [!NOTE] Work in progress, core working, needs refactoring and docs

TypeScript library for server-side Inertia.js integration with Elysia (and other frameworks).

## What is Inertia.js?

Inertia lets you build single-page apps without SPA complexity. You write server routes that return components from your client framework (React, Vue, Svelte). Inertia handles the routing and state management on the client side.

`inertia-server` provides the server tooling for Inertia.js in TypeScript, with built-in support for:

- **Props management**: Deferred, optional, always, and merged props
- **Error handling**: Error bags with per-field validation feedback
- **Flash messages**: One-time messages across redirects
- **Partial reloads**: Only rerender specific components
- **Version control**: Automatic version conflict detection
- **Full type safety**: TypeScript inference end-to-end

## Quick Start

### Install

```bash
bun add inertia-server
```

### Basic Usage

```typescript
import { Elysia } from "elysia";
import { createInertia, prop } from "inertia-server";
import { elysiaAdapter } from "inertia-server/elysia";

const { definePage, createHelper } = createInertia({
  version: "1.0.0",
  render: (page) => renderToString(<Root page={page} />),
});

const homePage = definePage("Home", {
  title: prop.string(),
  users: prop.deferred(async () => fetchUsers()),
});

const app = new Elysia();
const inertia = elysiaAdapter(createHelper);

app.use(inertia).get("/", ({ inertia }) => {
  return inertia.render(homePage({ title: "Welcome" }));
});

app.listen(3000);
```

## Documentation

Full docs at https://inertia-server.vercel.app

## Monorepo Structure

```
packages/inertia-server/   Main library
apps/example-elysia/       Full example with tests
apps/docs/                 Mintlify docs site
```

## Development

### Prerequisites

- Bun 1.3.3+
- Node.js 18+

### Commands

```bash
# Install dependencies
bun install

# Development (runs example app)
bun run dev

# Run unit tests
bun run test

# Run E2E tests
bun run test:e2e

# Type checking
bun run typecheck

# Linting
bun run lint
bun run lint:fix

# Build the package
bun run build:pkg

# Docs (local)
bun run dev:docs
```

## Contributing

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog management.

When contributing:

1. Make your changes
2. Run `bun run changeset` to document the change
3. Push a PR

Changesets are automatically released via GitHub Actions.

## License

MIT
