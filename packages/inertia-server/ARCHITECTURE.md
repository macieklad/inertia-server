# `inertia-server` Architecture

Reference for contributors and package users.

## Design Goals

- Framework-agnostic Inertia server core
- Strong TypeScript inference for page props
- Small adapters for runtime/framework integration
- First-class test assertions for Inertia payloads and partial reload behavior

## Package Layers

### 1) Core API (`src/index.ts`)

`createInertia(config)` returns:

- `definePage(options)`: creates typed page definitions
- `createHelper({ request, flash })`: creates per-request helper with:
  - `render(pageContext)`
  - `redirect(url, status?)`
  - `location(url)`
  - `flash(key, value)`
  - `errors(errorBag, bagName?)`
  - `encryptHistory()`
  - `clearHistory()`

Core responsibilities:

- Parse incoming Inertia headers
- Resolve prop values (including lazy resolver functions)
- Apply partial reload rules
- Shape error bags and flash payload
- Build protocol metadata (`deferredProps`, `onceProps`, merge/scroll metadata)
- Emit proper response type (HTML vs JSON vs redirect/location/version conflict)

### 2) Builder DSL (`src/builders.ts`)

Type-safe property builders encode metadata on symbols:

- `prop<T>()`
- `mergedProp<T>(opts?)`
- `deepMergedProp<T>(opts?)`

Supported modifiers:

- `.once({ expiresAt? })`
- `.deferred(group?)`
- `.optional()`
- `.always()`
- `.append()` / `.prepend()`
- `.scroll({ pageName? })`

Builder state is consumed by core page resolution and metadata generation.

### 3) Protocol utilities

- `src/headers.ts`: parse all supported `X-Inertia-*` request headers
- `src/response.ts`: response builders and status/version helpers
- `src/utils.ts`: `isInertiaPage`, deep comparison helpers for tests/assertions

### 4) Framework adapters

- `src/elysia.ts`: plugin/derive wrapper that injects `inertia` helper into context
- `src/hono.ts`: middleware that sets `inertia` helper in `ContextVariableMap`

Adapters intentionally stay thin. Core behavior remains in `createInertia`.

### 5) Testing API (`src/testing.ts`)

`InertiaAssertion` provides fluent assertions against:

- JSON Inertia responses
- HTML responses with `data-page`
- Raw `InertiaPage` objects

Capabilities:

- check component/url/version
- check prop presence/value/callback
- partial reload simulation (`reloadOnly`, `reloadExcept`)
- deferred loading simulation (`loadDeferredProps`)

## Request Lifecycle

1. Adapter creates helper with incoming `Request` (+ optional flash adapter).
2. `render()` parses headers, then resolves page context into an `InertiaPage`.
3. Prop resolution decides inclusion/exclusion using:
   - partial headers (`partial-data`, `partial-except`)
   - deferred/once/optional/always rules
   - once exclusions (`X-Inertia-Except-Once-Props`)
4. Metadata is attached when relevant:
   - `deferredProps`, `onceProps`, merge lists, match paths, `scrollProps`
5. Errors and flash are injected into `props`.
6. Response format:
   - non-Inertia request -> HTML via `config.render`
   - Inertia request -> JSON
   - version mismatch -> `409` + `X-Inertia-Location`
   - redirect/location helpers produce protocol-compliant redirect responses

## Extension Points

- Custom flash adapter through `createHelper({ flash })`
- Runtime-specific adapters can call the same `createHelper`
- Builder metadata model can be extended without changing adapter contracts
- Testing helper can use custom `fetch` implementation in assertion options

## Stability Contract

Public imports are exposed from:

- `inertia-server`
- `inertia-server/elysia`
- `inertia-server/hono`
- `inertia-server/testing`
- `inertia-server/types`

If behavior or public exports change, update:

- `README.md`
- `ARCHITECTURE.md`
- relevant tests under `tests/`
