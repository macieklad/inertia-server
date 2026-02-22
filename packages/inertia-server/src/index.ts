import { parseInertiaHeaders } from "./headers";
import {
	checkVersionMatch,
	createExternalRedirectResponse,
	createHtmlResponse,
	createJsonResponse,
	createRedirectResponse,
	createVersionConflictResponse,
	getRedirectStatus,
} from "./response";
import {
	BUILDER_STATE,
	type CreateHelperFn,
	type CreateInertiaConfig,
	type DefinePageFn,
	type DefinePageFnOptions,
	type InertiaHelper,
	type InertiaPage,
	type InertiaPageContext,
	type InertiaPageDefinition,
	type InertiaPageScrollProps,
	type InertiaRequestOptions,
	type PageDefinitionFnOptions,
	type PagePropsSchema,
	type PagePropsValues,
	type PropBuilderState,
	type SharedPageProps,
} from "./types";

export { deepMergedProp, isBuilder, mergedProp, prop } from "./builders";
export { parseInertiaHeaders } from "./headers";
export {
	checkVersionMatch,
	createDataPageAttribute,
	createExternalRedirectResponse,
	createHtmlResponse,
	createJsonResponse,
	createRedirectResponse,
	createVersionConflictResponse,
	getRedirectStatus,
} from "./response";

export type {
	AnyBuilder,
	CreateHelperFn,
	CreateHelperFnOptions as HelperFactoryContext,
	CreateInertiaConfig,
	CreateInertiaConfig as InertiaConfig,
	DeepMergeBuilder,
	DeferredBuilder,
	DeferredOnceBuilder,
	DefinePageFn as DefinePage,
	DefinePageFnOptions as DefinePageOptions,
	InertiaHelper,
	InertiaPage,
	InertiaPageContext,
	InertiaPageDefinition as PageDefinition,
	InertiaRequestOptions,
	InertiaRequestOptions as InertiaRequestHeaders,
	MergeBuilder,
	OnceBuilder,
	PageDefinitionFnOptions as PageRenderOptions,
	PageProps,
	PagePropsSchema,
	PagePropsValues,
	PropBuilder,
	ScrollDeepMergeBuilder,
	ScrollMergeBuilder,
} from "./types";

export function createInertia(config: CreateInertiaConfig) {
	const definePage: DefinePageFn = <
		S extends PagePropsSchema,
		RS extends keyof SharedPageProps = never,
	>(
		options: DefinePageFnOptions<S, RS>,
	): InertiaPageDefinition<S, RS> => {
		const { component, props: schema } = options;

		const definition = ((
			values: PagePropsValues<S>,
			renderOptions?: PageDefinitionFnOptions,
		): InertiaPageContext<S> => {
			return {
				component,
				schema,
				values,
				options: renderOptions,
				version:
					typeof config.version === "function"
						? config.version()
						: config.version,
			};
		}) as InertiaPageDefinition<S, RS>;

		Object.defineProperty(definition, "component", {
			value: component,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(definition, "schema", {
			value: schema,
			writable: false,
			enumerable: false,
		});

		const scrollOptions: Record<string, { pageName: string }> = {};
		for (const [key, builder] of Object.entries(schema)) {
			const state = builder[BUILDER_STATE];
			if (state.scrollOptions) {
				scrollOptions[key] = state.scrollOptions;
			}
		}

		Object.defineProperty(definition, "scrollOptions", {
			value: scrollOptions,
			writable: false,
			enumerable: false,
		});

		return definition;
	};

	const createHelper: CreateHelperFn = async ({ request, flash }) => {
		const requestOptions = parseInertiaHeaders(request);
		const currentFlash = (await flash?.getAll()) ?? {};
		const stagedErrors: Record<string, Record<string, string>> = {};

		let encryptHistory = config.encryptHistory ?? false;
		let clearHistory = false;
		const getFlashData = (): Record<string, unknown> =>
			Object.keys(stagedErrors).length > 0
				? { ...currentFlash, _inertia_errors: stagedErrors }
				: currentFlash;

		const inertia: InertiaHelper = {
			async render(context) {
				const page = await resolvePageProps(
					context,
					requestOptions,
					currentFlash,
					stagedErrors,
					request.url,
				);

				const url = page.url || new URL(request.url).pathname;

				const pageWithUrl: InertiaPage = {
					...page,
					url,
					encryptHistory: page.encryptHistory ?? encryptHistory,
					clearHistory: page.clearHistory ?? clearHistory,
				};

				if (
					requestOptions.isInertia &&
					!checkVersionMatch(requestOptions.version, pageWithUrl.version)
				) {
					await flash?.set(currentFlash);
					return createVersionConflictResponse(pageWithUrl.url);
				}

				if (requestOptions.isInertia) {
					return createJsonResponse(pageWithUrl);
				}

				const html = await config.render(pageWithUrl);
				return createHtmlResponse(html);
			},

			redirect(url, status) {
				const method = request.method;
				const finalStatus = status ?? getRedirectStatus(method);

				flash?.set(getFlashData());

				return createRedirectResponse(url, finalStatus);
			},

			location(url) {
				flash?.set(getFlashData());

				return createExternalRedirectResponse(url);
			},

			flash(key, value): void {
				currentFlash[key as string] = value;
			},

			errors(errs, bag): void {
				if (bag) {
					stagedErrors[bag] = errs;
				} else {
					stagedErrors.default = errs;
				}
			},

			encryptHistory(): void {
				encryptHistory = true;
			},

			clearHistory(): void {
				clearHistory = true;
			},
		};

		return inertia;
	};

	return { definePage, createHelper };
}

/**
 * Resolves a page resolution context into a fully resolved InertiaPage.
 * This is where request-driven prop filtering happens.
 */
async function resolvePageProps<S extends PagePropsSchema>(
	context: InertiaPageContext<S>,
	requestOptions: InertiaRequestOptions,
	flash: Record<string, unknown>,
	stagedErrors: Record<string, Record<string, string>>,
	requestUrl: string,
): Promise<InertiaPage> {
	const { component, schema, values, options, version } = context;

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
	const paginatedPropsWithNextPage =
		"$hasMore" in values
			? (values.$hasMore as Record<string, boolean>)
			: undefined;

	for (const [propKey, builder] of Object.entries(schema)) {
		const propMetadata = builder[BUILDER_STATE];
		const value = values[propKey as keyof typeof values];

		parsePropIntoPageMetadata({
			propKey,
			propMetadata,
			urlParams,
			paginatedPropsWithNextPage,
			pageMetadata,
		});

		const shouldPropResolve = shouldResolveProp({
			propKey,
			propMetadata,
			isPartialReload,
			partialProps,
			partialExceptProps,
			exceptOnceProps,
		});

		if (shouldPropResolve) {
			const resolvedValue =
				typeof value === "function"
					? await (value as () => unknown | Promise<unknown>)()
					: value;
			resolvedProps[propKey] = resolvedValue;
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
		if (Object.keys(pageMetadata.deferredProps).length > 0)
			page.deferredProps = pageMetadata.deferredProps;
		if (Object.keys(pageMetadata.onceProps).length > 0)
			page.onceProps = pageMetadata.onceProps;
	}

	if (pageMetadata.mergeProps.length > 0)
		page.mergeProps = pageMetadata.mergeProps;
	if (pageMetadata.prependProps.length > 0)
		page.prependProps = pageMetadata.prependProps;
	if (pageMetadata.deepMergeProps.length > 0)
		page.deepMergeProps = pageMetadata.deepMergeProps;
	if (pageMetadata.matchPropsOn.length > 0)
		page.matchPropsOn = pageMetadata.matchPropsOn;
	if (Object.keys(pageMetadata.scrollProps).length > 0)
		page.scrollProps = pageMetadata.scrollProps;

	return page;
}

/**
 * Determines if a prop should be included in the response based on request options and builder state.
 */
function shouldResolveProp(params: {
	propKey: string;
	propMetadata: PropBuilderState;
	isPartialReload: boolean;
	partialProps: Set<string>;
	partialExceptProps: Set<string>;
	exceptOnceProps: Set<string>;
}): boolean {
	const {
		propKey,
		propMetadata: state,
		isPartialReload,
		partialProps: partialDataSet,
		partialExceptProps: partialExceptSet,
		exceptOnceProps: exceptOncePropsSet,
	} = params;
	const isDeferred = state.type === "deferred";
	const isOnce = state.type === "once" || state.once !== undefined;
	const isOptional = state.isOptional === true;
	const isAlways = state.isAlways === true;

	if (isAlways) {
		return true;
	}

	const isExplicitlyRequested =
		partialDataSet.size > 0 && partialDataSet.has(propKey);
	const isExplicitlyExcluded = partialExceptSet.has(propKey);

	if (propKey === "errors" || propKey === "flash") {
		return true;
	}

	if (isPartialReload) {
		if (partialExceptSet.size > 0 && isExplicitlyExcluded) {
			return false;
		}

		if (partialDataSet.size > 0) {
			return isExplicitlyRequested;
		}

		if (isDeferred) {
			return false;
		}

		return !isOptional;
	}

	if (isDeferred) {
		return false;
	}

	if (isOptional) {
		return false;
	}

	if (isOnce && exceptOncePropsSet.has(propKey)) {
		return false;
	}

	return true;
}

/**
 * Shapes errors based on the errorBag header.
 * - No bag specified: return all known bags.
 * - Bag specified and missing: return empty errors.
 * - Bag specified and present: keep all bags so existing form errors persist.
 */
function shapeErrors(
	allErrors: Record<string, Record<string, string>>,
	errorBag: string | null,
): Record<string, unknown> {
	if (Object.keys(allErrors).length === 0) {
		return {};
	}

	if (errorBag) {
		const bagErrors = allErrors[errorBag];
		return bagErrors ? allErrors : {};
	}

	return allErrors;
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
	propKey: string;
	propMetadata: PropBuilderState;
	urlParams: URLSearchParams;
	paginatedPropsWithNextPage: Record<string, boolean> | undefined;
	pageMetadata: PageMetadata;
}): void {
	const {
		propKey: key,
		propMetadata: meta,
		urlParams,
		paginatedPropsWithNextPage: hasMore,
		pageMetadata: metadata,
	} = params;
	const {
		deferredProps,
		mergeProps,
		prependProps,
		deepMergeProps,
		matchPropsOn,
		scrollProps,
		onceProps,
	} = metadata;
	const shouldTrackOnce =
		meta.type === "once" ||
		meta.isDeferredOnce === true ||
		meta.once !== undefined;

	if (meta.type === "deferred" || meta.deferredGroup) {
		const group = meta.deferredGroup || "default";
		if (!deferredProps[group]) {
			deferredProps[group] = [];
		}
		deferredProps[group].push(key);
	}

	if (shouldTrackOnce) {
		onceProps[key] = {
			prop: key,
			expiresAt: meta.once?.expiresAt ?? null,
		};
	}

	if (meta.type === "merge") {
		if (meta.mergeDirection === "prepend") {
			prependProps.push(key);
		} else {
			mergeProps.push(key);
		}

		if (meta.mergeOptions?.matchOn) {
			matchPropsOn.push(`${key}.${meta.mergeOptions.matchOn}`);
		}

		if (meta.scrollOptions) {
			addScrollMetadata(
				key,
				meta.scrollOptions.pageName,
				urlParams,
				hasMore,
				scrollProps,
			);
		}
	}

	if (meta.type === "deepMerge") {
		deepMergeProps.push(key);

		if (meta.mergeOptions?.matchOn) {
			matchPropsOn.push(`${key}.${meta.mergeOptions.matchOn}`);
		}

		if (meta.scrollOptions) {
			addScrollMetadata(
				key,
				meta.scrollOptions.pageName,
				urlParams,
				hasMore,
				scrollProps,
			);
		}
	}
}

function addScrollMetadata(
	key: string,
	pageName: string,
	urlParams: URLSearchParams,
	hasMore: Record<string, boolean> | undefined,
	scrollProps: Record<string, InertiaPageScrollProps>,
): void {
	const currentPage = parseInt(urlParams.get(pageName) ?? "1", 10);
	const propHasMore = hasMore?.[key] ?? false;
	scrollProps[key] = {
		pageName,
		previousPage: currentPage > 1 ? currentPage - 1 : null,
		nextPage: propHasMore ? currentPage + 1 : null,
		currentPage,
	};
}
