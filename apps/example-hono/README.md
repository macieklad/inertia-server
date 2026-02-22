# example-hono

Minimal full-stack login demo using `inertia-server` + Hono + React.

What it covers:

- `honoAdapter` integration
- flash adapter + session-backed flash messages
- validation errors with error bag
- authenticated dashboard + logout

## Run

```bash
bun run dev
```

Server runs at `http://localhost:3002`.

Demo credentials:

- email: `demo@example.com`
- password: `password123`

## E2E

```bash
bun run test:e2e
```
