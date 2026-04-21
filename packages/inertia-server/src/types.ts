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
export const PAGE_PROPS = Symbol("inertia:page:props");
export const PAGE_VALUES = Symbol("inertia:page:values");

export type { InertiaConfigFor, ErrorValue, FlashData, SharedPageProps };

declare global {
	namespace InertiaServer {
		interface ErrorBags {}
	}
}

type DefaultErrorBags = Record<string, Record<string, ErrorValue>>;
type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type Resolver<T> = () => T | Promise<T>;
type JoinPath<Prefix extends string, Key extends string> = Prefix extends ""
	? Key
	: `${Prefix}.${Key}`;

type IsEmptyObject<T> = keyof T extends never ? true : false;

export type ErrorBags =
	IsEmptyObject<InertiaServer.ErrorBags> extends true
		? DefaultErrorBags
		: InertiaServer.ErrorBags;

export interface CreateInertiaConfig {
	version: string | (() => string);
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
	render(page: InertiaPageContext<unknown, unknown>): Promise<Response>;

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

export interface PageRuntimeDefinition {
	readonly modifiers: Record<string, PropBuilderState>;
	readonly scrollOptions: Record<string, StoredScrollOptions>;
}

export interface InertiaPageContext<
	Values = Record<string, unknown>,
	Props = Record<string, unknown>,
> {
	readonly component: string;
	readonly definition: PageRuntimeDefinition;
	readonly values: Values;
	readonly options?: PageDefinitionFnOptions | undefined;
	readonly version: string;
	readonly [PAGE_PROPS]?: Props;
}

export interface DefinePageSchemaOptions<
	S extends PagePropsSchema,
	RS extends keyof SharedPageProps = never,
> {
	component: string;
	props: S;
	requireShared?: RS[];
}

export interface DefinePageModifierOptions<
	Data extends Record<string, unknown>,
	M extends ModifierTree<Data> = ModifierTree<Data>,
	RS extends keyof SharedPageProps = never,
> {
	component: string;
	modifiers: M;
	requireShared?: RS[];
}

export interface DefinePageDataOptions<
	_Data extends Record<string, unknown>,
	RS extends keyof SharedPageProps = never,
> {
	component: string;
	requireShared?: RS[];
}

export type DefinePageFnOptions<
	S extends PagePropsSchema = PagePropsSchema,
	RS extends keyof SharedPageProps = never,
	Data extends Record<string, unknown> = Record<string, unknown>,
	M extends ModifierTree<Data> = ModifierTree<Data>,
> =
	| DefinePageSchemaOptions<S, RS>
	| DefinePageDataOptions<Data, RS>
	| DefinePageModifierOptions<Data, M, RS>;

export type DefinePageFn = {
	<S extends PagePropsSchema, RS extends keyof SharedPageProps = never>(
		options: DefinePageSchemaOptions<S, RS>,
	): InertiaPageDefinition<PagePropsValues<S>, ExtractPropTypes<S>, RS>;
	<
		Data extends Record<string, unknown>,
		M extends ModifierTree<Data> = ModifierTree<Data>,
		RS extends keyof SharedPageProps = never,
	>(
		options: DefinePageModifierOptions<Data, M, RS>,
	): InertiaPageDefinition<PageDataValues<Data, M>, PageDataProps<Data, M>, RS>;
	<
		Data extends Record<string, unknown>,
		RS extends keyof SharedPageProps = never,
	>(
		options: DefinePageDataOptions<Data, RS>,
	): InertiaPageDefinition<DeepPageValues<Data>, Data, RS>;
};

export interface InertiaPageDefinition<
	Values = Record<string, unknown>,
	Props = Record<string, unknown>,
	RS extends keyof SharedPageProps = never,
> {
	(
		values: Values,
		options?: PageDefinitionFnOptions,
	): InertiaPageContext<Values, Props>;
	readonly component: string;
	readonly scrollOptions: Record<string, StoredScrollOptions>;
	readonly [REQUIRED_SHARED]: RS;
	readonly [PAGE_PROPS]: Props;
	readonly [PAGE_VALUES]: Values;
}

export interface PageDefinitionFnOptions {
	url?: string;
	encryptHistory?: boolean;
	clearHistory?: boolean;
}

export type PagePropsSchema = Record<string, AnyBuilder<unknown>>;

export type ScrollPropKeys<S extends PagePropsSchema> = {
	[K in keyof S]: S[K] extends { readonly [BUILDER_SCROLL]: true } ? K : never;
}[keyof S];

export type BasePropValues<S extends PagePropsSchema> = {
	[K in keyof S]: S[K] extends BaseBuilder<infer T, boolean>
		? T | Resolver<T>
		: never;
};

export type PagePropsValues<S extends PagePropsSchema> =
	ScrollPropKeys<S> extends never
		? BasePropValues<S>
		: BasePropValues<S> & {
				$hasMore: { [K in ScrollPropKeys<S>]: boolean };
			};

export type DeepPageValues<T> = T extends Primitive
	? T | Resolver<T>
	: T extends readonly (infer U)[]
		? DeepPageValues<U>[] | Resolver<T>
		: T extends (...args: never[]) => unknown
			? T
			: T extends object
				? { [K in keyof T]: DeepPageValues<T[K]> } | Resolver<T>
				: T | Resolver<T>;

export type ModifierTree<Data extends Record<string, unknown>> = {
	[K in keyof Data]?: ModifierTreeValue<Data[K]>;
};

export type ModifierTreeValue<T> = T extends readonly unknown[]
	? AnyBuilder<unknown>
	: T extends (...args: never[]) => unknown
		? AnyBuilder<unknown>
		: T extends object
			? AnyBuilder<unknown> | ModifierTree<Extract<T, Record<string, unknown>>>
			: AnyBuilder<unknown>;

export type ExtractScrollPathsFromModifierTree<
	M,
	Prefix extends string = "",
> = M extends Record<string, unknown>
	? {
			[K in keyof M & string]: M[K] extends {
				readonly [BUILDER_SCROLL]: true;
			}
				? JoinPath<Prefix, K>
				: M[K] extends AnyBuilder<unknown>
					? never
					: M[K] extends Record<string, unknown>
						? ExtractScrollPathsFromModifierTree<M[K], JoinPath<Prefix, K>>
						: never;
		}[keyof M & string]
	: never;

type ModifierTreeScrollPaths<
	M extends ModifierTree<Record<string, unknown>> | undefined,
> = ExtractScrollPathsFromModifierTree<NonNullable<M>>;

type ApplyModifierToPropType<Value, Modifier> =
	Modifier extends OnceBuilder<unknown>
		? Value
		: Modifier extends BaseBuilder<unknown, true>
			? Value | undefined
			: Value;

type ApplyModifierTreeValue<Value, Modifier> =
	Modifier extends AnyBuilder<unknown>
		? ApplyModifierToPropType<Value, Modifier>
		: Modifier extends Record<string, unknown>
			? Value extends Record<string, unknown>
				? PageDataProps<
						Extract<Value, Record<string, unknown>>,
						Extract<
							Modifier,
							ModifierTree<Extract<Value, Record<string, unknown>>>
						>
					>
				: Value
			: Value;

export type PageDataValues<
	Data extends Record<string, unknown>,
	M extends ModifierTree<Data> | undefined,
> = [ModifierTreeScrollPaths<M>] extends [never]
	? DeepPageValues<Data>
	: DeepPageValues<Data> & {
			$hasMore: Record<ModifierTreeScrollPaths<M>, boolean>;
		};

export type PageDataProps<
	Data extends Record<string, unknown>,
	M extends ModifierTree<Data> | undefined,
> = {
	[K in keyof Data]: K extends keyof NonNullable<M>
		? ApplyModifierTreeValue<Data[K], NonNullable<M>[K]>
		: Data[K];
};

export type AnyBuilder<T = unknown> =
	| PropBuilder<T>
	| OnceBuilder<T>
	| DeferredBuilder<T>
	| MergeBuilder<T, boolean>
	| ScrollMergeBuilder<T, boolean>
	| DeferredOnceBuilder<T>
	| DeepMergeBuilder<T, boolean>
	| ScrollDeepMergeBuilder<T, boolean>;

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

export interface MergeBuilder<T, Lazy extends boolean = false>
	extends BaseBuilder<T, Lazy> {
	append(): MergeBuilder<T, Lazy>;
	prepend(): MergeBuilder<T, Lazy>;
	scroll(opts?: ScrollPropOptions): ScrollMergeBuilder<T, Lazy>;
	once(opts?: OncePropOptions): MergeBuilder<T, true>;
	deferred(group?: string): MergeBuilder<T, true>;
	optional(): MergeBuilder<T, Lazy>;
	always(): MergeBuilder<T, Lazy>;
}

export interface ScrollMergeBuilder<T, Lazy extends boolean = false>
	extends BaseBuilder<T, Lazy> {
	readonly [BUILDER_SCROLL]: true;
	append(): ScrollMergeBuilder<T, Lazy>;
	prepend(): ScrollMergeBuilder<T, Lazy>;
	once(opts?: OncePropOptions): ScrollMergeBuilder<T, true>;
	deferred(group?: string): ScrollMergeBuilder<T, true>;
	optional(): ScrollMergeBuilder<T, Lazy>;
	always(): ScrollMergeBuilder<T, Lazy>;
}

export interface DeepMergeBuilder<T, Lazy extends boolean = false>
	extends BaseBuilder<T, Lazy> {
	append(): DeepMergeBuilder<T, Lazy>;
	prepend(): DeepMergeBuilder<T, Lazy>;
	scroll(opts?: ScrollPropOptions): ScrollDeepMergeBuilder<T, Lazy>;
	once(opts?: OncePropOptions): DeepMergeBuilder<T, true>;
	deferred(group?: string): DeepMergeBuilder<T, true>;
	optional(): DeepMergeBuilder<T, Lazy>;
	always(): DeepMergeBuilder<T, Lazy>;
}

export interface ScrollDeepMergeBuilder<T, Lazy extends boolean = false>
	extends BaseBuilder<T, Lazy> {
	readonly [BUILDER_SCROLL]: true;
	append(): ScrollDeepMergeBuilder<T, Lazy>;
	prepend(): ScrollDeepMergeBuilder<T, Lazy>;
	once(opts?: OncePropOptions): ScrollDeepMergeBuilder<T, true>;
	deferred(group?: string): ScrollDeepMergeBuilder<T, true>;
	optional(): ScrollDeepMergeBuilder<T, Lazy>;
	always(): ScrollDeepMergeBuilder<T, Lazy>;
}

export interface BaseBuilder<T, Lazy extends boolean = boolean> {
	readonly [BUILDER_STATE]: PropBuilderState;
	readonly [BUILDER_TYPE]: T;
	readonly [BUILDER_LAZY]: Lazy;
	readonly [BUILDER_SCROLL]: boolean;
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

export interface StoredScrollOptions {
	pageName: string;
}

export type PageProps<T> = T extends {
	readonly [PAGE_PROPS]: infer Props;
	readonly [REQUIRED_SHARED]: infer RS extends keyof SharedPageProps;
}
	? Props &
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

export type ExtractRequiredShared<T> = T extends {
	readonly [REQUIRED_SHARED]: infer RS extends keyof SharedPageProps;
}
	? RS
	: never;
