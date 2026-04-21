/**
 * Builders expose an API to type-safely create any property configuration
 * available in the Inertia protocol.
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

export function prop<T>(): PropBuilder<T> {
	return createPropBuilder<T>({ type: "prop" });
}

export function once(opts?: OncePropOptions): OnceBuilder<unknown> {
	return prop<unknown>().once(opts);
}

export function deferred(group = "default"): DeferredBuilder<unknown> {
	return prop<unknown>().deferred(group);
}

export function optional(): PropBuilder<unknown> {
	return prop<unknown>().optional();
}

export function always(): PropBuilder<unknown> {
	return prop<unknown>().always();
}

export function merged<T = unknown>(opts?: MergePropOptions): MergeBuilder<T> {
	return mergedProp<T>(opts);
}

export function mergedProp<T>(opts?: MergePropOptions): MergeBuilder<T> {
	return createMergeBuilder<T>({
		type: "merge",
		mergeOptions: opts,
		mergeDirection: "append",
	});
}

export function deepMerged<T = unknown>(
	opts?: MergePropOptions,
): DeepMergeBuilder<T> {
	return deepMergedProp<T>(opts);
}

export function deepMergedProp<T>(
	opts?: MergePropOptions,
): DeepMergeBuilder<T> {
	return createDeepMergeBuilder<T>({
		type: "deepMerge",
		mergeOptions: opts,
		mergeDirection: "append",
	});
}

export function isBuilder(value: unknown): value is AnyBuilder {
	return typeof value === "object" && value !== null && BUILDER_STATE in value;
}

function createPropBuilder<T>(meta: PropBuilderState): PropBuilder<T> {
	return createBuilder<T, PropBuilder<T>>(
		meta,
		{
			once(opts?: OncePropOptions) {
				return createOnceBuilder<T>({
					...meta,
					type: "once",
					once: opts,
				});
			},
			deferred(group = "default") {
				return createDeferredBuilder<T>({
					...meta,
					type: "deferred",
					deferredGroup: group,
				});
			},
			optional() {
				return createPropBuilder<T>({ ...meta, isOptional: true });
			},
			always() {
				return createPropBuilder<T>({ ...meta, isAlways: true });
			},
		},
		false,
	);
}

function createOnceBuilder<T>(meta: PropBuilderState): OnceBuilder<T> {
	return createBuilder<T, OnceBuilder<T>>(
		meta,
		{
			deferred(group = "default") {
				return createDeferredOnceBuilder<T>({
					...meta,
					type: "deferred",
					deferredGroup: group,
					isDeferredOnce: true,
				});
			},
		},
		true,
	);
}

function createDeferredBuilder<T>(meta: PropBuilderState): DeferredBuilder<T> {
	return createBuilder<T, DeferredBuilder<T>>(
		meta,
		{
			once(opts?: OncePropOptions) {
				return createDeferredOnceBuilder<T>({
					...meta,
					once: opts,
					isDeferredOnce: true,
				});
			},
		},
		true,
	);
}

function createDeferredOnceBuilder<T>(
	meta: PropBuilderState,
): DeferredOnceBuilder<T> {
	return createBuilder<T, DeferredOnceBuilder<T>>(meta, {}, true);
}

function createMergeBuilder<T, Lazy extends boolean = false>(
	meta: PropBuilderState,
): MergeBuilder<T, Lazy> {
	return createBuilder<T, MergeBuilder<T, Lazy>>(
		meta,
		{
			append() {
				return createMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "append",
				});
			},
			prepend() {
				return createMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "prepend",
				});
			},
			scroll(scrollOpts?: ScrollPropOptions) {
				return createScrollMergeBuilder<T, Lazy>({
					...meta,
					scrollOptions: { pageName: scrollOpts?.pageName ?? "page" },
				});
			},
			once(opts?: OncePropOptions) {
				return createMergeBuilder<T, true>({ ...meta, once: opts });
			},
			deferred(group = "default") {
				return createMergeBuilder<T, true>({
					...meta,
					deferredGroup: group,
				});
			},
			optional() {
				return createMergeBuilder<T, Lazy>({ ...meta, isOptional: true });
			},
			always() {
				return createMergeBuilder<T, Lazy>({ ...meta, isAlways: true });
			},
		},
		isLazyMeta(meta),
	);
}

function createScrollMergeBuilder<T, Lazy extends boolean = false>(
	meta: PropBuilderState,
): ScrollMergeBuilder<T, Lazy> {
	return createBuilder<T, ScrollMergeBuilder<T, Lazy>>(
		meta,
		{
			append() {
				return createScrollMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "append",
				});
			},
			prepend() {
				return createScrollMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "prepend",
				});
			},
			once(opts?: OncePropOptions) {
				return createScrollMergeBuilder<T, true>({
					...meta,
					once: opts,
				});
			},
			deferred(group = "default") {
				return createScrollMergeBuilder<T, true>({
					...meta,
					deferredGroup: group,
				});
			},
			optional() {
				return createScrollMergeBuilder<T, Lazy>({
					...meta,
					isOptional: true,
				});
			},
			always() {
				return createScrollMergeBuilder<T, Lazy>({
					...meta,
					isAlways: true,
				});
			},
		},
		isLazyMeta(meta),
		true,
	);
}

function createDeepMergeBuilder<T, Lazy extends boolean = false>(
	meta: PropBuilderState,
): DeepMergeBuilder<T, Lazy> {
	return createBuilder<T, DeepMergeBuilder<T, Lazy>>(
		meta,
		{
			append() {
				return createDeepMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "append",
				});
			},
			prepend() {
				return createDeepMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "prepend",
				});
			},
			scroll(scrollOpts?: ScrollPropOptions) {
				return createScrollDeepMergeBuilder<T, Lazy>({
					...meta,
					scrollOptions: { pageName: scrollOpts?.pageName ?? "page" },
				});
			},
			once(opts?: OncePropOptions) {
				return createDeepMergeBuilder<T, true>({ ...meta, once: opts });
			},
			deferred(group = "default") {
				return createDeepMergeBuilder<T, true>({
					...meta,
					deferredGroup: group,
				});
			},
			optional() {
				return createDeepMergeBuilder<T, Lazy>({ ...meta, isOptional: true });
			},
			always() {
				return createDeepMergeBuilder<T, Lazy>({ ...meta, isAlways: true });
			},
		},
		isLazyMeta(meta),
	);
}

function createScrollDeepMergeBuilder<T, Lazy extends boolean = false>(
	meta: PropBuilderState,
): ScrollDeepMergeBuilder<T, Lazy> {
	return createBuilder<T, ScrollDeepMergeBuilder<T, Lazy>>(
		meta,
		{
			append() {
				return createScrollDeepMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "append",
				});
			},
			prepend() {
				return createScrollDeepMergeBuilder<T, Lazy>({
					...meta,
					mergeDirection: "prepend",
				});
			},
			once(opts?: OncePropOptions) {
				return createScrollDeepMergeBuilder<T, true>({
					...meta,
					once: opts,
				});
			},
			deferred(group = "default") {
				return createScrollDeepMergeBuilder<T, true>({
					...meta,
					deferredGroup: group,
				});
			},
			optional() {
				return createScrollDeepMergeBuilder<T, Lazy>({
					...meta,
					isOptional: true,
				});
			},
			always() {
				return createScrollDeepMergeBuilder<T, Lazy>({
					...meta,
					isAlways: true,
				});
			},
		},
		isLazyMeta(meta),
		true,
	);
}

function isLazyMeta(meta: PropBuilderState): boolean {
	return (
		meta.type === "once" ||
		meta.type === "deferred" ||
		meta.once !== undefined ||
		meta.deferredGroup !== undefined ||
		meta.isDeferredOnce === true
	);
}

function createBuilder<T, B extends AnyBuilder<T>>(
	meta: PropBuilderState,
	methods: Omit<
		B,
		| typeof BUILDER_STATE
		| typeof BUILDER_TYPE
		| typeof BUILDER_LAZY
		| typeof BUILDER_SCROLL
	>,
	isLazy: boolean,
	isScroll = false,
): B {
	return {
		[BUILDER_STATE]: meta,
		[BUILDER_TYPE]: undefined as T,
		[BUILDER_LAZY]: isLazy,
		[BUILDER_SCROLL]: isScroll,
		...methods,
	} as B;
}
