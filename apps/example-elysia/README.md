# example-elysia

Full working example of inertia-server with Elysia, React, and TypeScript.

Demonstrates all inertia-server features:

- Type-safe page definitions
- Props (deferred, optional, always, merged)
- Error bags and validation feedback
- Flash messages
- Partial reloads
- Server-side rendering

Used as testing ground for the `inertia-server` package.

## Run

```bash
bun run dev
```

Server runs at http://localhost:3000

## Test

### Unit Tests

```bash
cd ../..
bun run test
```

### E2E Tests

```bash
bun run test:e2e
```

Playwright tests verify all routes and prop behaviors work end-to-end.

## Build

```bash
bun run build
```

Outputs to `dist/`

Serves built client from `dist/client/` + runs server.

## Structure

```
src/
  server.ts          Elysia app + inertia setup
  routes/            Page routes
    home.ts          Basic page
    users.ts         List with deferred props
    props.ts         Prop variations
    lists.ts         Arrays and relationships
    advanced.ts      Error bags, flash, partials
  pages/             React components (sent to client)
  db.ts              SQLite database
```

## Features Demonstrated

- **Home**: Basic page with static props
- **Users**: Deferred props, partial reloads
- **Props**: All prop types (deferred, optional, always, merged)
- **Lists**: Relationships, arrays
- **Advanced**: Error bags, validation, flash messages
