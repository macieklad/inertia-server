# Issue #8 Plan

Branch: `issue-8-nested-prop-builders`

Goal: add nested modifier support with the new `definePage<Data>({ modifiers })` API, keep the existing flat builder API working during migration, then move the Elysia example over step by step.

## Progress

- [completed] 1. Prepare new implementation in parallel with the existing API
- [completed] 2. Prepare tests for the new API and nested behavior
- [completed] 3. Run package tests and fix regressions
- [completed] 4. Update Elysia example e2e tests
- [completed] 5. Slowly migrate Elysia example pages to the new API
- [completed] 6. Cleanup old/internal duplication and update docs

## Notes

- No `[PROP]` support in this iteration
- Parent modifiers or child modifiers are allowed, not both on the same node
- Keep old schema-based API working while the example migrates
- Example app uses explicit `ModifierTree` constants on migrated pages to keep `PageProps` and `$hasMore` inference precise
