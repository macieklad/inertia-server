<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./apps/docs/assets/logo/dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="./apps/docs/assets/logo/light.svg">
      <img alt="Inertia Server logo" src="./apps/docs/assets/logo/light.svg">
    </picture>
</p>

<p align="center">
Integrate Inertia.js with any modern Javascript runtime and server.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/inertia-server">
    <img alt="npm version" src="https://img.shields.io/npm/v/inertia-server?label=inertia-server&logo=npm">
  </a>
</p>

## Documentation

Full documentation is available at [https://inertiaserver.mintlify.app](https://inertiaserver.mintlify.app)

## What is Inertia.js?

[Inertia](https://inertiajs.com/) lets you build single-page apps without SPA complexity. You write server routes that return components from your client framework (React, Vue, Svelte). Inertia handles the routing and state management on the client side.

## Why Inertia Server?

JavaScript backend ecosystem was lacking a frontend solution that is backend centered.
Inertia protocol, while quite simple, requires you to write a lot of boilerplate code to get started.

`inertia-server` provides framework agnostic server tooling for Inertia.js. It makes interaction with the library type-safe, seamless, and more mature. Use a ready-made adapter for your framework of choice, or create your own. Test your application using your favourite testing library. `inertia-server` is here to help.

### Example

```ts
import { createInertia, prop, PageProps } from 'inertia-server';

const { definePage, createHelper } = createInertia({
  version: '1.0.0',
  render: (page) => renderToString(<Root page={page} />),
});

const homePage = definePage({
  component: 'Home',
  props: {
    title: prop<string>(),
    description: prop<string>().deferred(),
  },
});

export type HomePageProps = PageProps<typeof homePage>;

// Server agnostic request handler, with integrations you don't need createHelper
const inertia = createHelper({ request });
return inertia.render(
  homePage({ title: 'Welcome', description: () => 'Hello, World!' })
);

// On the client (react example):
import { PageProps } from 'inertia-server';
import type { HomePageProps } from './pages/home';

export function Page({ title, description }: HomePageProps) {
  return <>
    <h1>{title}</h1>
    {description ? <p>{description}</p> : <p>Loading description...</p>}
  </>;
}
```

## Contributing

Contributions are more than welcome.

This monorepo uses bun, biome, and [Changesets](https://github.com/changesets/changesets) for versioning and changelog management. To start, clone the repository and run:

```bash
bun install
bun build
```

You can now start exploring the examples or the core `inertia-server` package. To run the examples and docs, execute:

```bash
# Elysia example, best for testing visually
bun run dev
# Hono example, best for testing with a real server
bun run dev:hono
# Docs
bun run dev:docs
```

When everything is running, pick up any nested README's and start working on what interests you. You coding agents are provided with the AGENTS.MD, so ask them for help ;)
