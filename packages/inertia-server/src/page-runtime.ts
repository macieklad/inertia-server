import { isBuilder } from "./builders";
import type {
	DefinePageDataOptions,
	DefinePageModifierOptions,
	DefinePageSchemaOptions,
	InertiaPage,
	InertiaPageContext,
	InertiaPageScrollProps,
	InertiaRequestOptions,
	ModifierTree,
	PagePropsSchema,
	PageRuntimeDefinition,
	PropBuilderState,
	SharedPageProps,
	StoredScrollOptions,
} from "./types";
import { BUILDER_STATE } from "./types";

export function buildRuntimeDefinition(
	options:
		| DefinePageSchemaOptions<PagePropsSchema, keyof SharedPageProps>
		| DefinePageDataOptions<Record<string, unknown>, keyof SharedPageProps>
		| DefinePageModifierOptions<
				Record<string, unknown>,
				ModifierTree<Record<string, unknown>>,
				keyof SharedPageProps
		  >,
): PageRuntimeDefinition {
	if (hasSchemaOptions(options)) {
		return normalizeSchemaDefinition(options);
	}

	if (hasModifierOptions(options)) {
		return normalizeModifierDefinition(
			options as Parameters<typeof normalizeModifierDefinition>[0],
		);
	}

	return { modifiers: {}, scrollOptions: {} };
}

export async function resolvePageProps(
	context: InertiaPageContext<unknown, unknown>,
	requestOptions: InertiaRequestOptions,
	flash: Record<string, unknown>,
	stagedErrors: Record<string, Record<string, string>>,
	requestUrl: string,
): Promise<InertiaPage> {
	const { component, definition, values, options, version } = context;
	const pageValues = values as Record<string, unknown>;

	const resolvedProps: Record<string, unknown> = {};
	const pageMetadata: PageMetadata = {
		deferredProps: {},
		mergeProps: [],
		prependProps: [],
		deepMergeProps: [],
		matchPropsOn: [],
		scrollProps: {},
		onceProps: {},
	};

	const isPartialReload =
		requestOptions.partialComponent !== null &&
		requestOptions.partialComponent === component;

	const partialProps = new Set(requestOptions.partialData);
	const partialExceptProps = new Set(requestOptions.partialExcept);
	const exceptOnceProps = new Set(requestOptions.exceptOnceProps);
	const urlParams = new URLSearchParams(new URL(requestUrl).search);
	const paginatedPropsWithNextPage = hasMoreMarker(pageValues)
		? pageValues.$hasMore
		: undefined;

	for (const [propPath, propMetadata] of Object.entries(definition.modifiers)) {
		parsePropIntoPageMetadata({
			propPath,
			propMetadata,
			urlParams,
			paginatedPropsWithNextPage,
			pageMetadata,
		});
	}

	for (const [propKey, value] of Object.entries(pageValues)) {
		if (propKey === "$hasMore") {
			continue;
		}

		const resolved = await resolveValueNode({
			path: propKey,
			rawValue: value,
			modifiers: definition.modifiers,
			isPartialReload,
			partialProps,
			partialExceptProps,
			exceptOnceProps,
		});

		if (resolved.included) {
			resolvedProps[propKey] = resolved.value;
		}
	}

	const flashedErrors = flash._inertia_errors as
		| Record<string, Record<string, string>>
		| undefined;
	const allErrors = { ...flashedErrors, ...stagedErrors };
	resolvedProps.errors = shapeErrors(allErrors, requestOptions.errorBag);

	const { _inertia_errors, ...userFlash } = flash;
	resolvedProps.flash = userFlash;

	const page: InertiaPage = {
		component,
		props: resolvedProps,
		url: options?.url ?? "",
		version,
	};

	if (options?.encryptHistory !== undefined) {
		page.encryptHistory = options.encryptHistory;
	}
	if (options?.clearHistory !== undefined) {
		page.clearHistory = options.clearHistory;
	}

	if (!isPartialReload) {
		if (Object.keys(pageMetadata.deferredProps).length > 0) {
			page.deferredProps = pageMetadata.deferredProps;
		}
		if (Object.keys(pageMetadata.onceProps).length > 0) {
			page.onceProps = pageMetadata.onceProps;
		}
	}

	if (pageMetadata.mergeProps.length > 0) {
		page.mergeProps = pageMetadata.mergeProps;
	}
	if (pageMetadata.prependProps.length > 0) {
		page.prependProps = pageMetadata.prependProps;
	}
	if (pageMetadata.deepMergeProps.length > 0) {
		page.deepMergeProps = pageMetadata.deepMergeProps;
	}
	if (pageMetadata.matchPropsOn.length > 0) {
		page.matchPropsOn = pageMetadata.matchPropsOn;
	}
	if (Object.keys(pageMetadata.scrollProps).length > 0) {
		page.scrollProps = pageMetadata.scrollProps;
	}

	return page;
}

function hasSchemaOptions(
	options:
		| DefinePageSchemaOptions<PagePropsSchema, keyof SharedPageProps>
		| DefinePageDataOptions<Record<string, unknown>, keyof SharedPageProps>
		| DefinePageModifierOptions<
				Record<string, unknown>,
				ModifierTree<Record<string, unknown>>,
				keyof SharedPageProps
		  >,
): options is DefinePageSchemaOptions<PagePropsSchema> {
	return "props" in options;
}

function hasModifierOptions(
	options:
		| DefinePageDataOptions<Record<string, unknown>, keyof SharedPageProps>
		| DefinePageModifierOptions<
				Record<string, unknown>,
				ModifierTree<Record<string, unknown>>,
				keyof SharedPageProps
		  >,
): options is DefinePageModifierOptions<
	Record<string, unknown>,
	ModifierTree<Record<string, unknown>>,
	keyof SharedPageProps
> {
	return "modifiers" in options;
}

function normalizeSchemaDefinition(
	options: DefinePageSchemaOptions<PagePropsSchema>,
): PageRuntimeDefinition {
	const modifiers: Record<string, PropBuilderState> = {};
	const scrollOptions: Record<string, StoredScrollOptions> = {};

	for (const [key, builder] of Object.entries(options.props)) {
		const state = builder[BUILDER_STATE];
		modifiers[key] = state;
		if (state.scrollOptions) {
			scrollOptions[key] = state.scrollOptions;
		}
	}

	return { modifiers, scrollOptions };
}

function normalizeModifierDefinition(
	options: DefinePageModifierOptions<
		Record<string, unknown>,
		ModifierTree<Record<string, unknown>>
	>,
): PageRuntimeDefinition {
	const modifiers: Record<string, PropBuilderState> = {};
	const scrollOptions: Record<string, StoredScrollOptions> = {};

	normalizeModifierTree(options.modifiers, "", modifiers, scrollOptions);

	return { modifiers, scrollOptions };
}

function normalizeModifierTree(
	tree: Record<string, unknown>,
	prefix: string,
	modifiers: Record<string, PropBuilderState>,
	scrollOptions: Record<string, StoredScrollOptions>,
): void {
	for (const [key, value] of Object.entries(tree)) {
		if (value === undefined) {
			continue;
		}

		const path = joinPath(prefix, key);

		if (isBuilder(value)) {
			const state = value[BUILDER_STATE];
			modifiers[path] = state;
			if (state.scrollOptions) {
				scrollOptions[path] = state.scrollOptions;
			}
			continue;
		}

		if (isPlainObject(value)) {
			normalizeModifierTree(value, path, modifiers, scrollOptions);
		}
	}
}

type ResolvedNode = { included: false } | { included: true; value: unknown };

async function resolveValueNode(params: {
	path: string;
	rawValue: unknown;
	modifiers: Record<string, PropBuilderState>;
	isPartialReload: boolean;
	partialProps: Set<string>;
	partialExceptProps: Set<string>;
	exceptOnceProps: Set<string>;
	forceResolveDescendants?: boolean;
}): Promise<ResolvedNode> {
	const {
		path,
		rawValue,
		modifiers,
		isPartialReload,
		partialProps,
		partialExceptProps,
		exceptOnceProps,
		forceResolveDescendants,
	} = params;
	const propMetadata = modifiers[path];

	if (
		!shouldResolvePath({
			path,
			propMetadata,
			isPartialReload,
			partialProps,
			partialExceptProps,
			exceptOnceProps,
			forceResolve: forceResolveDescendants === true,
		})
	) {
		return { included: false };
	}

	const materializedValue = await materializeValue(rawValue);

	if (isPlainObject(materializedValue)) {
		const resolvedObject: Record<string, unknown> = {};
		const nextForceResolve =
			forceResolveDescendants === true || propMetadata?.isAlways === true;

		for (const [key, childValue] of Object.entries(materializedValue)) {
			const child = await resolveValueNode({
				...params,
				path: joinPath(path, key),
				rawValue: childValue,
				forceResolveDescendants: nextForceResolve,
			});

			if (child.included) {
				resolvedObject[key] = child.value;
			}
		}

		return { included: true, value: resolvedObject };
	}

	return {
		included: true,
		value: await resolveDeepValue(materializedValue),
	};
}

function shouldResolvePath(params: {
	path: string;
	propMetadata: PropBuilderState | undefined;
	isPartialReload: boolean;
	partialProps: Set<string>;
	partialExceptProps: Set<string>;
	exceptOnceProps: Set<string>;
	forceResolve: boolean;
}): boolean {
	const {
		path,
		propMetadata: state,
		isPartialReload,
		partialProps,
		partialExceptProps,
		exceptOnceProps,
		forceResolve,
	} = params;
	const isDeferred =
		state?.type === "deferred" || state?.deferredGroup !== undefined;
	const isOnce =
		state?.type === "once" ||
		state?.once !== undefined ||
		state?.isDeferredOnce === true;
	const isOptional = state?.isOptional === true;
	const isAlways = state?.isAlways === true;

	if (isAlways) {
		return true;
	}

	if (path === "errors" || path === "flash") {
		return true;
	}

	if (forceResolve) {
		return true;
	}

	const isExplicitlyRequested =
		partialProps.size > 0 && pathMatchesRequestedTree(path, partialProps);
	const isExplicitlyExcluded = pathIsExcluded(path, partialExceptProps);

	if (isPartialReload) {
		if (partialExceptProps.size > 0 && isExplicitlyExcluded) {
			return false;
		}

		if (partialProps.size > 0) {
			return isExplicitlyRequested;
		}

		if (isDeferred) {
			return false;
		}

		return !isOptional;
	}

	if (isDeferred || isOptional) {
		return false;
	}

	if (isOnce && exceptOnceProps.has(path)) {
		return false;
	}

	return true;
}

function shapeErrors(
	allErrors: Record<string, Record<string, string>>,
	errorBag: string | null,
): Record<string, unknown> {
	if (Object.keys(allErrors).length === 0) {
		return {};
	}

	if (errorBag) {
		const bagErrors = allErrors[errorBag];
		return bagErrors ? { [errorBag]: bagErrors } : {};
	}

	return allErrors;
}

function hasMoreMarker(
	values: Record<string, unknown>,
): values is Record<string, unknown> & { $hasMore: Record<string, boolean> } {
	return "$hasMore" in values;
}

type PageMetadata = Required<
	Pick<
		InertiaPage,
		| "deferredProps"
		| "mergeProps"
		| "prependProps"
		| "deepMergeProps"
		| "matchPropsOn"
		| "scrollProps"
		| "onceProps"
	>
>;

function parsePropIntoPageMetadata(params: {
	propPath: string;
	propMetadata: PropBuilderState;
	urlParams: URLSearchParams;
	paginatedPropsWithNextPage: Record<string, boolean> | undefined;
	pageMetadata: PageMetadata;
}): void {
	const {
		propPath,
		propMetadata: meta,
		urlParams,
		paginatedPropsWithNextPage,
		pageMetadata,
	} = params;
	const {
		deferredProps,
		mergeProps,
		prependProps,
		deepMergeProps,
		matchPropsOn,
		scrollProps,
		onceProps,
	} = pageMetadata;
	const shouldTrackOnce =
		meta.type === "once" ||
		meta.isDeferredOnce === true ||
		meta.once !== undefined;

	if (meta.type === "deferred" || meta.deferredGroup) {
		const group = meta.deferredGroup || "default";
		if (!deferredProps[group]) {
			deferredProps[group] = [];
		}
		deferredProps[group].push(propPath);
	}

	if (shouldTrackOnce) {
		onceProps[propPath] = {
			prop: propPath,
			expiresAt: meta.once?.expiresAt ?? null,
		};
	}

	if (meta.type === "merge") {
		if (meta.mergeDirection === "prepend") {
			prependProps.push(propPath);
		} else {
			mergeProps.push(propPath);
		}

		if (meta.mergeOptions?.matchOn) {
			matchPropsOn.push(`${propPath}.${meta.mergeOptions.matchOn}`);
		}

		if (meta.scrollOptions) {
			addScrollMetadata(
				propPath,
				meta.scrollOptions.pageName,
				urlParams,
				paginatedPropsWithNextPage,
				scrollProps,
			);
		}
	}

	if (meta.type === "deepMerge") {
		deepMergeProps.push(propPath);

		if (meta.mergeOptions?.matchOn) {
			matchPropsOn.push(`${propPath}.${meta.mergeOptions.matchOn}`);
		}

		if (meta.scrollOptions) {
			addScrollMetadata(
				propPath,
				meta.scrollOptions.pageName,
				urlParams,
				paginatedPropsWithNextPage,
				scrollProps,
			);
		}
	}
}

function addScrollMetadata(
	path: string,
	pageName: string,
	urlParams: URLSearchParams,
	hasMore: Record<string, boolean> | undefined,
	scrollProps: Record<string, InertiaPageScrollProps>,
): void {
	const currentPage = parseInt(urlParams.get(pageName) ?? "1", 10);
	const propHasMore = hasMore?.[path] ?? false;
	scrollProps[path] = {
		pageName,
		previousPage: currentPage > 1 ? currentPage - 1 : null,
		nextPage: propHasMore ? currentPage + 1 : null,
		currentPage,
	};
}

async function materializeValue(value: unknown): Promise<unknown> {
	if (typeof value === "function") {
		return await (value as () => unknown | Promise<unknown>)();
	}

	return value;
}

async function resolveDeepValue(value: unknown): Promise<unknown> {
	const materializedValue = await materializeValue(value);

	if (Array.isArray(materializedValue)) {
		return Promise.all(materializedValue.map((item) => resolveDeepValue(item)));
	}

	if (isPlainObject(materializedValue)) {
		const resolvedObject: Record<string, unknown> = {};
		for (const [key, childValue] of Object.entries(materializedValue)) {
			resolvedObject[key] = await resolveDeepValue(childValue);
		}
		return resolvedObject;
	}

	return materializedValue;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

function pathMatchesRequestedTree(
	path: string,
	requestedPaths: Set<string>,
): boolean {
	for (const requestedPath of requestedPaths) {
		if (path === requestedPath) {
			return true;
		}

		if (path.startsWith(`${requestedPath}.`)) {
			return true;
		}

		if (requestedPath.startsWith(`${path}.`)) {
			return true;
		}
	}

	return false;
}

function pathIsExcluded(path: string, excludedPaths: Set<string>): boolean {
	for (const excludedPath of excludedPaths) {
		if (path === excludedPath || path.startsWith(`${excludedPath}.`)) {
			return true;
		}
	}

	return false;
}

function joinPath(prefix: string, key: string): string {
	return prefix ? `${prefix}.${key}` : key;
}
