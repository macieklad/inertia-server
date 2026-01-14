import type {
	ErrorValue,
	FlashData,
	InertiaConfigFor,
	SharedPageProps,
} from "@inertiajs/core";

export const REQUIRED_SHARED = Symbol("inertia:required-shared");
export const BUILDER_STATE = Symbol("inertia:builder:state");
export const BUILDER_TYPE = Symbol("inertia:builder:type");
export const BUILDER_LAZY = Symbol("inertia:builder:lazy");
export const BUILDER_SCROLL = Symbol("inertia:builder:scroll");

export type { InertiaConfigFor, ErrorValue, FlashData, SharedPageProps };

declare global {
	namespace InertiaServer {
		interface ErrorBags {}
	}
}

type DefaultErrorBags = Record<string, Record<string, ErrorValue>>;

type IsEmptyObject<T> = keyof T extends never ? true : false;

export type ErrorBags =
	IsEmptyObject<InertiaServer.ErrorBags> extends true
		? DefaultErrorBags
		: InertiaServer.ErrorBags;

export interface CreateInertiaConfig {
	version: string | (() => string | Promise<string>);
	render: (page: InertiaPage) => string | Promise<string>;
	encryptHistory?: boolean;
}

export type CreateHelperFn = (
	ctx: CreateHelperFnOptions,
) => Promise<InertiaHelper>;

export interface CreateHelperFnOptions {
	request: Request;
	flash?: FlashAdapter | undefined;
}

export interface FlashAdapter {
	getAll(): Record<string, unknown> | Promise<Record<string, unknown>>;
	set(data: Record<string, unknown>): void | Promise<void>;
}

export interface InertiaHelper {
	render(page: InertiaPageContext): Promise<Response>;

	redirect(url: string, status?: 302 | 303): Response;

	location(url: string): Response;

	flash<K extends keyof FlashData>(key: K, value: FlashData[K]): void;

	errors(errors: Record<string, ErrorValue>, bag?: string): void;

	encryptHistory(): void;

	clearHistory(): void;
}

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

export type MergeIntent = "append" | "prepend";

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

export interface InertiaPageContext<
	S extends PagePropsSchema = PagePropsSchema,
> {
	readonly component: string;
	readonly schema: S;
	readonly values: PagePropsValues<S>;
	readonly options?: PageDefinitionFnOptions | undefined;
	readonly version: string;
}

export type DefinePageFn = <
	S extends PagePropsSchema,
	RS extends keyof SharedPageProps = never,
>(
	options: DefinePageFnOptions<S, RS>,
) => InertiaPageDefinition<S, RS>;

export interface DefinePageFnOptions<
	S extends PagePropsSchema,
	RS extends keyof SharedPageProps = never,
> {
	component: string;
	props: S;
	requireShared?: RS[];
}

export interface InertiaPageDefinition<
	S extends PagePropsSchema,
	RS extends keyof SharedPageProps = never,
> {
	(
		values: PagePropsValues<S>,
		options?: PageDefinitionFnOptions,
	): InertiaPageContext<S>;
	readonly component: string;
	readonly schema: S;
	readonly scrollOptions: ExtractScrollOptions<S>;
	readonly [REQUIRED_SHARED]: RS;
}

type ExtractScrollOptions<S extends PagePropsSchema> = {
	[K in keyof S as S[K] extends { readonly [BUILDER_SCROLL]: true }
		? K
		: never]: StoredScrollOptions;
};

export interface PageDefinitionFnOptions {
	url?: string;
	encryptHistory?: boolean;
	clearHistory?: boolean;
}

export type PagePropsSchema = Record<string, AnyBuilder<unknown>>;

// Extract keys of props that have scroll enabled
type ScrollPropKeys<S extends PagePropsSchema> = {
	[K in keyof S]: S[K] extends { readonly [BUILDER_SCROLL]: true } ? K : never;
}[keyof S];

// Base prop values without $hasMore
type BasePropValues<S extends PagePropsSchema> = {
	[K in keyof S]: S[K] extends BaseBuilder<infer T, boolean>
		? T | (() => T | Promise<T>)
		: never;
};

// If there are scroll props, require $hasMore with those keys
export type PagePropsValues<S extends PagePropsSchema> =
	ScrollPropKeys<S> extends never
		? BasePropValues<S>
		: BasePropValues<S> & {
				$hasMore: { [K in ScrollPropKeys<S>]: boolean };
			};

export type AnyBuilder<T = unknown> =
	| PropBuilder<T>
	| OnceBuilder<T>
	| DeferredBuilder<T>
	| MergeBuilder<T>
	| ScrollMergeBuilder<T>
	| DeferredOnceBuilder<T>
	| DeepMergeBuilder<T>
	| ScrollDeepMergeBuilder<T>;

export interface PropBuilder<T> extends BaseBuilder<T, false> {
	once(opts?: OncePropOptions): OnceBuilder<T>;
	deferred(group?: string): DeferredBuilder<T>;
	optional(): PropBuilder<T>;
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
	scroll(opts?: ScrollPropOptions): ScrollMergeBuilder<T>;
}

export interface ScrollMergeBuilder<T> extends BaseBuilder<T, false> {
	readonly [BUILDER_SCROLL]: true;
	append(): ScrollMergeBuilder<T>;
	prepend(): ScrollMergeBuilder<T>;
}

export interface DeepMergeBuilder<T> extends BaseBuilder<T, false> {
	append(): DeepMergeBuilder<T>;
	prepend(): DeepMergeBuilder<T>;
	scroll(opts?: ScrollPropOptions): ScrollDeepMergeBuilder<T>;
}

export interface ScrollDeepMergeBuilder<T> extends BaseBuilder<T, false> {
	readonly [BUILDER_SCROLL]: true;
	append(): ScrollDeepMergeBuilder<T>;
	prepend(): ScrollDeepMergeBuilder<T>;
}

export interface BaseBuilder<T, Lazy extends boolean = boolean> {
	readonly [BUILDER_STATE]: PropBuilderState;
	readonly [BUILDER_TYPE]: T;
	readonly [BUILDER_LAZY]: Lazy;
}

export interface PropBuilderState {
	type: "prop" | "merge" | "deepMerge" | "once" | "deferred";
	once?: OncePropOptions | undefined;
	deferredGroup?: string | undefined;
	mergeOptions?: MergePropOptions | undefined;
	mergeDirection?: MergeIntent | undefined;
	scrollOptions?: StoredScrollOptions | undefined;
	isDeferredOnce?: boolean | undefined;
	isOptional?: boolean | undefined;
	isAlways?: boolean | undefined;
}

export interface OncePropOptions {
	expiresAt?: number;
}

export interface MergePropOptions {
	matchOn?: string;
}

export interface ScrollPropOptions {
	pageName?: string;
}

/** Internal type for scroll options stored in builder state - pageName is guaranteed */
export interface StoredScrollOptions {
	pageName: string;
}

export type PageProps<
	// biome-ignore lint/suspicious/noExplicitAny: Relaxed constraint to allow specific page definitions
	T extends InertiaPageDefinition<any, any>,
> =
	T extends InertiaPageDefinition<infer S, infer RS>
		? ExtractPropTypes<S> &
				Omit<SharedPageProps, RS> & {
					[K in RS]: NonNullable<SharedPageProps[K]>;
				} & {
					flash: Partial<FlashData>;
					errors: PageErrors;
				}
		: never;

export type PageErrors = {
	[K in keyof ErrorBags]?: ErrorBags[K];
} & Record<string, ErrorValue>;

export type ExtractPropTypes<S extends PagePropsSchema> = {
	[K in keyof S]: ExtractBuilderType<S[K]>;
};

export type ExtractBuilderType<B> =
	B extends BaseBuilder<infer T, true>
		? B extends OnceBuilder<infer T>
			? T
			: T | undefined
		: B extends BaseBuilder<infer T, false>
			? T
			: never;

export type ExtractRequiredShared<T> =
	T extends InertiaPageDefinition<infer _S, infer RS> ? RS : never;
