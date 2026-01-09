export const REQUIRED_SHARED = Symbol("inertia:required-shared");
export const BUILDER_STATE = Symbol("inertia:builder:state");
export const BUILDER_TYPE = Symbol("inertia:builder:type");
export const BUILDER_LAZY = Symbol("inertia:builder:lazy");
/**
 * Users augment this namespace to make the inertia helper typesafe.
 *
 * @example
 * ```ts
 * declare namespace Inertia {
 *   interface Flashable {
 *     success: string
 *     error: string
 *   }
 *   interface Shared {
 *     user: User | null
 *   }
 *   interface ErrorBags {
 *     createUser: { name?: string; email?: string }
 *   }
 * }
 *
 * inertia.flash("success", "User created!");
 * inertia.share({ user: ctx.auth?.user });
 * inertia.errors({ email: "Invalid email" }, "createUser");
 * ```
 */
declare global {
  namespace Inertia {
    interface Flashable {}
    interface Shared {}
    interface ErrorBags {}
  }
}

export interface CreateInertiaConfig {
  version: string | (() => string | Promise<string>);
  render: (page: InertiaPage) => string | Promise<string>;
  encryptHistory?: boolean;
}

export type CreateHelperFn = (
  ctx: CreateHelperFnOptions
) => Promise<InertiaHelper>;

export interface CreateHelperFnOptions {
  /** The incoming request */
  request: Request;
  /** Flash functions (optional, injected by adapter) */
  flash?: FlashAdapter | undefined;
}

export interface FlashAdapter {
  /** Get all flash data from the session */
  getAll(): Record<string, unknown> | Promise<Record<string, unknown>>;
  /** Set flash data (backend commits after request) */
  set(data: Record<string, unknown>): void | Promise<void>;
}

export interface InertiaHelper {
  render(page: InertiaPageContext): Promise<Response>;

  redirect(url: string, status?: 302 | 303): Response;

  location(url: string): Response;

  errors(
    errors: Record<string, string>,
    bag?: keyof Inertia.ErrorBags | string
  ): void;

  encryptHistory(): void;

  clearHistory(): void;
}

/**
 * Inertia request options parsed from the request headers.
 *
 * @see https://inertiajs.com/docs/v2/core-concepts/the-protocol#request-headers
 */
export interface InertiaRequestOptions {
  isInertia: boolean;
  version: string | null;
  partialComponent: string | null;
  partialData: string[];
  partialExcept: string[];
  resetProps: string[];
  errorBag: string | null;
  exceptOnceProps: string[];
  scrollMergeIntent: MergeIntent | null;
  isPrefetch: boolean;
}

/**
 * @see https://inertiajs.com/docs/v2/core-concepts/the-protocol#param-x-inertia-infinite-scroll-merge-intent
 */
export type MergeIntent = "append" | "prepend";

/**
 * The Inertia page object sent in responses.
 *
 * @see https://inertiajs.com/docs/v2/core-concepts/the-protocol#the-page-object
 */
export interface InertiaPage {
  component: string;
  props: Record<string, unknown>;
  url: string;
  version: string;
  encryptHistory?: boolean;
  clearHistory?: boolean;
  deferredProps?: Record<string, string[]>;
  mergeProps?: string[];
  prependProps?: string[];
  deepMergeProps?: string[];
  matchPropsOn?: string[];
  scrollProps?: Record<string, InertiaPageScrollProps>;
  onceProps?: Record<string, InertiaPageOnceProps>;
}

export interface InertiaPageScrollProps {
  pageName: string;
  previousPage: number | null;
  nextPage: number | null;
  currentPage: number;
}

export interface InertiaPageOnceProps {
  prop: string;
  expiresAt: number | null;
}

/**
 * Page context is an object that render function uses to match
 * request options with page props.
 */
export interface InertiaPageContext<
  S extends PagePropsSchema = PagePropsSchema
> {
  readonly component: string;
  readonly schema: S;
  readonly values: PagePropsValues<S>;
  readonly options?: PageDefinitionFnOptions | undefined;
  readonly version: string;
}

/**
 * To provide type safety for inertia pages, `definePage` function returns a builder object
 * that can construct the page object according to the inertia protocol. By using functional
 * approach, we can provide type safety for the page object by using schema functions.
 *
 * @example
 * ```ts
 * const page = definePage({
 *   component: "Home",
 *   props: {
 *     title: prop<string>(),
 *   },
 * });
 * ```
 *
 * prop(), mergedProp(), deepMergedProp() return builders that are then processed by
 * the callback returned from definePage function to construct the page object.
 */
export interface DefinePageFn {
  <S extends PagePropsSchema, RS extends keyof Inertia.Shared = never>(
    options: DefinePageFnOptions<S, RS>
  ): InertiaPageDefinition<S, RS>;
}

export interface DefinePageFnOptions<
  S extends PagePropsSchema,
  RS extends keyof Inertia.Shared = never
> {
  component: string;
  props: S;
  requireShared?: RS[];
}

export interface InertiaPageDefinition<
  S extends PagePropsSchema,
  RS extends keyof Inertia.Shared = never
> {
  (
    values: PagePropsValues<S>,
    options?: PageDefinitionFnOptions
  ): InertiaPageContext<S>;
  readonly component: string;
  readonly schema: S;
  readonly [REQUIRED_SHARED]: RS;
}

export interface PageDefinitionFnOptions {
  url?: string;
  encryptHistory?: boolean;
  clearHistory?: boolean;
}

export type PagePropsSchema = Record<string, AnyBuilder<unknown>>;

/**
 * Values provided when calling a page definition.
 * All props can accept either a literal value or a resolver function.
 * Use resolvers when you want the value recomputed on every request.
 */
export type PagePropsValues<S extends PagePropsSchema> = {
  [K in keyof S]: S[K] extends BaseBuilder<infer T, boolean>
    ? T | (() => T | Promise<T>)
    : never;
};

// =============================================================================
// Builder Types
// =============================================================================

export type AnyBuilder<T = unknown> =
  | PropBuilder<T>
  | OnceBuilder<T>
  | DeferredBuilder<T>
  | MergeBuilder<T>
  | DeferredOnceBuilder<T>
  | DeepMergeBuilder<T>;

export interface PropBuilder<T> extends BaseBuilder<T, false> {
  once(opts?: OncePropOptions): OnceBuilder<T>;
  deferred(group?: string): DeferredBuilder<T>;
  /** Never included on standard visits; only when explicitly requested via partial reload */
  optional(): PropBuilder<T>;
  /** Always included, even during partial reloads that don't request it */
  always(): PropBuilder<T>;
}

export interface OnceBuilder<T> extends BaseBuilder<T, true> {
  deferred(group?: string): DeferredOnceBuilder<T>;
}

export interface DeferredBuilder<T> extends BaseBuilder<T, true> {
  once(opts?: OncePropOptions): DeferredOnceBuilder<T>;
}

export interface DeferredOnceBuilder<T> extends BaseBuilder<T, true> {}

export interface MergeBuilder<T> extends BaseBuilder<T, false> {
  append(): MergeBuilder<T>;
  prepend(): MergeBuilder<T>;
  scroll(opts: ScrollPropOptions): MergeBuilder<T>;
}

export interface DeepMergeBuilder<T> extends BaseBuilder<T, false> {
  append(): DeepMergeBuilder<T>;
  prepend(): DeepMergeBuilder<T>;
  scroll(opts: ScrollPropOptions): DeepMergeBuilder<T>;
}

export interface BaseBuilder<T, Lazy extends boolean = boolean> {
  readonly [BUILDER_STATE]: PropBuilderState;
  readonly [BUILDER_TYPE]: T;
  readonly [BUILDER_LAZY]: Lazy;
}

// =============================================================================
// Builder State & Options
// =============================================================================

export interface PropBuilderState {
  type: "prop" | "merge" | "deepMerge" | "once" | "deferred";
  once?: OncePropOptions | undefined;
  deferredGroup?: string | undefined;
  mergeOptions?: MergePropOptions | undefined;
  mergeDirection?: MergeIntent | undefined;
  scrollOptions?: ScrollPropOptions | undefined;
  isDeferredOnce?: boolean | undefined;
  /** Never included on standard visits; only when explicitly requested via partial reload */
  isOptional?: boolean | undefined;
  /** Always included, even during partial reloads that don't request it */
  isAlways?: boolean | undefined;
}

export interface OncePropOptions {
  expiresAt?: number;
}

export interface MergePropOptions {
  matchOn?: string;
}

export interface ScrollPropOptions {
  pageName: string;
} // =============================================================================
// Type Utilities
// =============================================================================

/**
 * Type helper for page component props.
 * Use this to type your page components.
 *
 * @example
 * ```ts
 * const homepage = definePage({
 *   component: "Home",
 *   props: { title: prop<string>() },
 *   requireShared: ['user'],
 * });
 *
 * function Page(props: PageProps<typeof homepage>) {
 *   // props.user is guaranteed to be non-null
 *   // props.title is string
 * }
 * ```
 */
export type PageProps<
  // biome-ignore lint/suspicious/noExplicitAny: Relaxed constraint to allow specific page definitions
  T extends InertiaPageDefinition<any, any>
> = T extends InertiaPageDefinition<infer S, infer RS>
  ? ExtractPropTypes<S> &
      Omit<Inertia.Shared, RS> & {
        [K in RS]: NonNullable<Inertia.Shared[K]>;
      } & {
        flash: Partial<Inertia.Flashable>;
        errors: Partial<Inertia.ErrorBags> & Record<string, string>;
      }
  : never;

export type ExtractPropTypes<S extends PagePropsSchema> = {
  [K in keyof S]: ExtractBuilderType<S[K]>;
};

export type ExtractBuilderType<B> = B extends BaseBuilder<infer T, true>
  ? B extends OnceBuilder<infer T>
    ? T
    : T | undefined
  : B extends BaseBuilder<infer T, false>
  ? T
  : never;

export type ExtractRequiredShared<T> = T extends InertiaPageDefinition<
  infer _S,
  infer RS
>
  ? RS
  : never;
