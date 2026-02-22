# AGENTS.md - inertia-server package

Scope: `packages/inertia-server` only.

## Mission

- Keep Inertia protocol behavior correct
- Keep type inference stable
- Keep adapters thin; core logic in `src/index.ts`

## Fast Map

- `src/index.ts`: core engine, page resolution, partial/deferred/once handling
- `src/builders.ts`: prop builder DSL and metadata encoding
- `src/headers.ts`: request header parsing
- `src/response.ts`: response builders and status helpers
- `src/elysia.ts`, `src/hono.ts`: framework adapters
- `src/testing.ts`: assertion/test helper API
- `tests/integration.test.ts`: behavior contract

## Commands

- install deps: `bun install`
- build package: `bun --filter inertia-server build`
- typecheck package: `bun --filter inertia-server typecheck`
- run tests: `bun --filter inertia-server test`

## Readme Publish Rule

- npm package should expose root repo README on publish
- implementation: `prepack`/`postpack` scripts run `scripts/sync-root-readme.mjs`
- do not remove this without replacing npm README sync behavior

## Change Rules

- New protocol behavior: add integration tests
- Builder changes: add/adjust builder unit tests + integration coverage
- Testing helper changes: add/adjust `tests/testing.test.ts`
- Public API changes: update `README.md` and `ARCHITECTURE.md`

## Guardrails

- Avoid broad refactors outside package scope
- No destructive git/file commands unless explicitly requested
- Prefer small, reviewable edits
