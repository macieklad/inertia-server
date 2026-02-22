/**
 * Builders expose an API to type-safely create any property configuration
 * available in  the Inertia protocol. Users define their pages by providing
 * prop definitions using builders. Builders encode that state into an object
 * that can be serialized into valid page responses.
 */
import type {
	AnyBuilder,
	DeepMergeBuilder,
	DeferredBuilder,
	DeferredOnceBuilder,
	MergeBuilder,
	MergePropOptions,
	OnceBuilder,
	OncePropOptions,
	PropBuilder,
	PropBuilderState,
	ScrollDeepMergeBuilder,
	ScrollMergeBuilder,
	ScrollPropOptions,
} from "./types";
import {
	BUILDER_LAZY,
	BUILDER_SCROLL,
	BUILDER_STATE,
	BUILDER_TYPE,
} from "./types";

/**
 * Creates a basic prop builder.
 *
 * @example
 * ```ts
 * prop<string>()                    // Basic prop
 * prop<User>().once()               // Cached prop
 * prop<Analytics>().deferred()      // Deferred prop
 * prop<Heavy>().optional()          // Only included when explicitly requested
 * prop<Auth>().always()             // Always included, even in partial reloads
 * ```
 */
export function prop<T>(): PropBuilder<T> {
	const meta: PropBuilderState = { type: "prop" };

	const createPropBuilder = (currentMeta: PropBuilderState): PropBuilder<T> => {
		return createBuilder<T, PropBuilder<T>>(
			currentMeta,
			{
				once(opts?: OncePropOptions): OnceBuilder<T> {
					return createOnceBuilder({
						...currentMeta,
						type: "once",
						once: opts,
					});
				},
				deferred(group = "default"): DeferredBuilder<T> {
					const deferredMeta: PropBuilderState = {
						...currentMeta,
						type: "deferred",
						deferredGroup: group,
					};

					return createBuilder<T, DeferredBuilder<T>>(
						deferredMeta,
						{
							once(opts?: OncePropOptions): DeferredOnceBuilder<T> {
								return createBuilder<T, DeferredOnceBuilder<T>>(
									{
										...deferredMeta,
										once: opts,
										isDeferredOnce: true,
									},
									{},
									true,
								);
							},
						},
						true,
					);
				},
				optional(): PropBuilder<T> {
					return createPropBuilder({ ...currentMeta, isOptional: true });
				},
				always(): PropBuilder<T> {
					return createPropBuilder({ ...currentMeta, isAlways: true });
				},
			},
			false,
		);
	};

	const createOnceBuilder = (currentMeta: PropBuilderState): OnceBuilder<T> => {
		return createBuilder<T, OnceBuilder<T>>(
			currentMeta,
			{
				deferred(group = "default"): DeferredOnceBuilder<T> {
					return createBuilder<T, DeferredOnceBuilder<T>>(
						{
							...currentMeta,
							type: "deferred",
							deferredGroup: group,
							isDeferredOnce: true,
						},
						{},
						true,
					);
				},
			},
			true,
		);
	};

	return createPropBuilder(meta);
}

/**
 * Creates a merge prop builder for array merging on navigation.
 *
 * @example
 * ```ts
 * mergedProp<Post[]>({ matchOn: "id" })           // Append (default)
 * mergedProp<Post[]>({ matchOn: "id" }).prepend() // Prepend
 * mergedProp<Post[]>({ matchOn: "id" }).scroll({ pageName: "page" })
 * ```
 */
export function mergedProp<T>(opts?: MergePropOptions): MergeBuilder<T> {
	const meta: PropBuilderState = {
		type: "merge",
		mergeOptions: opts,
		mergeDirection: "append",
	};

	const createMergeBuilder = (
		currentMeta: PropBuilderState,
	): MergeBuilder<T> => {
		return createBuilder<T, MergeBuilder<T>>(
			currentMeta,
			{
				append(): MergeBuilder<T> {
					return createMergeBuilder({
						...currentMeta,
						mergeDirection: "append",
					});
				},
				prepend(): MergeBuilder<T> {
					return createMergeBuilder({
						...currentMeta,
						mergeDirection: "prepend",
					});
				},
				scroll(scrollOpts?: ScrollPropOptions): ScrollMergeBuilder<T> {
					return createScrollMergeBuilder({
						...currentMeta,
						scrollOptions: { pageName: scrollOpts?.pageName ?? "page" },
					});
				},
			},
			false,
		);
	};

	const createScrollMergeBuilder = (
		currentMeta: PropBuilderState,
	): ScrollMergeBuilder<T> => {
		return createScrollBuilder<T, ScrollMergeBuilder<T>>(
			currentMeta,
			{
				append(): ScrollMergeBuilder<T> {
					return createScrollMergeBuilder({
						...currentMeta,
						mergeDirection: "append",
					});
				},
				prepend(): ScrollMergeBuilder<T> {
					return createScrollMergeBuilder({
						...currentMeta,
						mergeDirection: "prepend",
					});
				},
			},
			false,
		);
	};

	return createMergeBuilder(meta);
}

/**
 * Creates a deep merge prop builder for nested object merging.
 *
 * @example
 * ```ts
 * deepMergedProp<Conversations>({ matchOn: "data.id" })
 * deepMergedProp<Conversations>({ matchOn: "data.id" }).prepend()
 * deepMergedProp<Conversations>({ matchOn: "data.id" }).scroll({ pageName: "page" })
 * ```
 */
export function deepMergedProp<T>(
	opts?: MergePropOptions,
): DeepMergeBuilder<T> {
	const meta: PropBuilderState = {
		type: "deepMerge",
		mergeOptions: opts,
		mergeDirection: "append",
	};

	const createDeepMergeBuilder = (
		currentMeta: PropBuilderState,
	): DeepMergeBuilder<T> => {
		return createBuilder<T, DeepMergeBuilder<T>>(
			currentMeta,
			{
				append(): DeepMergeBuilder<T> {
					return createDeepMergeBuilder({
						...currentMeta,
						mergeDirection: "append",
					});
				},
				prepend(): DeepMergeBuilder<T> {
					return createDeepMergeBuilder({
						...currentMeta,
						mergeDirection: "prepend",
					});
				},
				scroll(scrollOpts?: ScrollPropOptions): ScrollDeepMergeBuilder<T> {
					return createScrollDeepMergeBuilder({
						...currentMeta,
						scrollOptions: { pageName: scrollOpts?.pageName ?? "page" },
					});
				},
			},
			false,
		);
	};

	const createScrollDeepMergeBuilder = (
		currentMeta: PropBuilderState,
	): ScrollDeepMergeBuilder<T> => {
		return createScrollBuilder<T, ScrollDeepMergeBuilder<T>>(
			currentMeta,
			{
				append(): ScrollDeepMergeBuilder<T> {
					return createScrollDeepMergeBuilder({
						...currentMeta,
						mergeDirection: "append",
					});
				},
				prepend(): ScrollDeepMergeBuilder<T> {
					return createScrollDeepMergeBuilder({
						...currentMeta,
						mergeDirection: "prepend",
					});
				},
			},
			false,
		);
	};

	return createDeepMergeBuilder(meta);
}

/**
 * Type guard to check if a value is an Inertia prop builder.
 */
export function isBuilder(value: unknown): value is AnyBuilder {
	return typeof value === "object" && value !== null && BUILDER_STATE in value;
}

/**
 * Creates a builder object with the given metadata.
 */
function createBuilder<T, B extends AnyBuilder<T>>(
	meta: PropBuilderState,
	methods: Omit<
		B,
		typeof BUILDER_STATE | typeof BUILDER_TYPE | typeof BUILDER_LAZY
	>,
	isLazy: boolean,
): B {
	return {
		[BUILDER_STATE]: meta,
		[BUILDER_TYPE]: undefined as T,
		[BUILDER_LAZY]: isLazy,
		...methods,
	} as B;
}

function createScrollBuilder<
	T,
	B extends ScrollMergeBuilder<T> | ScrollDeepMergeBuilder<T>,
>(
	meta: PropBuilderState,
	methods: Omit<
		B,
		| typeof BUILDER_STATE
		| typeof BUILDER_TYPE
		| typeof BUILDER_LAZY
		| typeof BUILDER_SCROLL
	>,
	isLazy: boolean,
): B {
	return {
		[BUILDER_STATE]: meta,
		[BUILDER_TYPE]: undefined as T,
		[BUILDER_LAZY]: isLazy,
		[BUILDER_SCROLL]: true,
		...methods,
	} as B;
}
