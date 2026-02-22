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
	type InertiaPageOnceProps,
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

// =============================================================================
// Inertia Factory
// =============================================================================

/**
 * Creates an Inertia plugin and definePage function using the provided adapter.
 *
 * The adapter is responsible for creating the framework-specific plugin that
 * injects the `inertia` helper into the request context.
 *
 * @param config - Inertia configuration
 * @returns Object with definePage function and createHelper factory
 *
 * @example
 * ```ts
 * const { definePage, createHelper } = createInertia({
 *   version: "1.0.0",
 *   render: (page) => renderToString(<Root page={page} />),
 * });
 *
 * const postsPage = definePage({
 *   component: "Posts",
 *   props: {
 *     title: prop<string>(),
 *     posts: merge<Post[]>({ matchOn: "id" }),
 *   },
 * });
 *
 * // URL is automatically injected from the current request
 * app.use(plugin).get("/posts", ({ inertia }) => {
 *   return inertia.render(postsPage({
 *     title: "All Posts",
 *     posts: await getPosts(),
 *   }));
 * });
 * ```
 */
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
				version: getVersionSync(),
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

	/**
	 * Gets the version synchronously for definePage.
	 * Throws if an async version resolver is used.
	 */
	function getVersionSync(): string {
		if (typeof config.version === "string") {
			return config.version;
		}
		throw new Error(
			"Cannot use async version resolver with definePage. Use a string version or resolve the version before calling the page function.",
		);
	}

	return { definePage, createHelper };
}

// =============================================================================
// Internal: Page Props Resolution
// =============================================================================

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
	const deferredProps: Record<string, string[]> = {};
	const mergeProps: string[] = [];
	const prependProps: string[] = [];
	const deepMergeProps: string[] = [];
	const matchPropsOn: string[] = [];
	const scrollProps: Record<string, InertiaPageScrollProps> = {};
	const onceProps: Record<string, InertiaPageOnceProps> = {};

	const isPartialReload =
		requestOptions.partialComponent !== null &&
		requestOptions.partialComponent === component;

	const partialDataSet = new Set(requestOptions.partialData);
	const partialExceptSet = new Set(requestOptions.partialExcept);
	const exceptOncePropsSet = new Set(requestOptions.exceptOnceProps);

	const urlParams = new URLSearchParams(new URL(requestUrl).search);
	const hasMore =
		"$hasMore" in values
			? (values.$hasMore as Record<string, boolean>)
			: undefined;

	for (const [propKey, builder] of Object.entries(schema)) {
		const state = builder[BUILDER_STATE];
		const value = values[propKey as keyof typeof values];

		collectBuilderMetadata(propKey, state, urlParams, hasMore, {
			deferredProps,
			mergeProps,
			prependProps,
			deepMergeProps,
			matchPropsOn,
			scrollProps,
			onceProps,
		});

		const shouldInclude = shouldIncludeProp(
			propKey,
			state,
			isPartialReload,
			partialDataSet,
			partialExceptSet,
			exceptOncePropsSet,
		);

		if (shouldInclude) {
			const resolvedValue =
				typeof value === "function"
					? await (value as () => unknown | Promise<unknown>)()
					: value;
			resolvedProps[propKey] = resolvedValue;
		}
	}

	// Handle errors from flash (for redirect-based validation flow)
	const flashedErrors = flash._inertia_errors as
		| Record<string, Record<string, string>>
		| undefined;
	const allErrors = { ...flashedErrors, ...stagedErrors };
	resolvedProps.errors = shapeErrors(allErrors, requestOptions.errorBag);

	// Add flash data (excluding internal _inertia_errors)
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

	// Deferred/once metadata only on initial load (prevents infinite fetch loops)
	if (!isPartialReload) {
		if (Object.keys(deferredProps).length > 0)
			page.deferredProps = deferredProps;
		if (Object.keys(onceProps).length > 0) page.onceProps = onceProps;
	}

	// Merge metadata always sent (needed for client-side merging)
	if (mergeProps.length > 0) page.mergeProps = mergeProps;
	if (prependProps.length > 0) page.prependProps = prependProps;
	if (deepMergeProps.length > 0) page.deepMergeProps = deepMergeProps;
	if (matchPropsOn.length > 0) page.matchPropsOn = matchPropsOn;
	if (Object.keys(scrollProps).length > 0) page.scrollProps = scrollProps;

	return page;
}

/**
 * Determines if a prop should be included in the response based on request options and builder state.
 */
function shouldIncludeProp(
	propKey: string,
	state: PropBuilderState,
	isPartialReload: boolean,
	partialDataSet: Set<string>,
	partialExceptSet: Set<string>,
	exceptOncePropsSet: Set<string>,
): boolean {
	const isDeferred = state.type === "deferred";
	const isOnce = state.type === "once" || state.once !== undefined;
	const isOptional = state.isOptional === true;
	const isAlways = state.isAlways === true;

	// "always" props are always included
	if (isAlways) {
		return true;
	}

	const isExplicitlyRequested =
		partialDataSet.size > 0 && partialDataSet.has(propKey);
	const isExplicitlyExcluded = partialExceptSet.has(propKey);

	// "errors" and "flash" props are always included
	if (propKey === "errors" || propKey === "flash") {
		return true;
	}

	// For partial reloads
	if (isPartialReload) {
		if (partialExceptSet.size > 0 && isExplicitlyExcluded) {
			return false;
		}

		if (partialDataSet.size > 0) {
			return isExplicitlyRequested;
		}

		// No specific filters - include all non-optional, non-deferred props
		if (isDeferred) {
			return false;
		}

		return !isOptional;
	}

	// For standard (non-partial) visits

	// Deferred props: don't resolve on initial visit
	if (isDeferred) {
		return false;
	}

	// Optional props: never included on standard visits
	if (isOptional) {
		return false;
	}

	// Once props: skip if client already has them
	if (isOnce && exceptOncePropsSet.has(propKey)) {
		return false;
	}

	return true;
}

/**
 * Shapes errors based on the errorBag header.
 * - No bag specified: flatten default errors to props.errors
 * - Bag specified: return errors nested under bag key
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
		if (bagErrors) {
			return { [errorBag]: bagErrors };
		}
		return {};
	}

	return allErrors;
}

function collectBuilderMetadata(
	key: string,
	meta: PropBuilderState,
	urlParams: URLSearchParams,
	hasMore: Record<string, boolean> | undefined,
	collections: {
		deferredProps: Record<string, string[]>;
		mergeProps: string[];
		prependProps: string[];
		deepMergeProps: string[];
		matchPropsOn: string[];
		scrollProps: Record<string, InertiaPageScrollProps>;
		onceProps: Record<string, InertiaPageOnceProps>;
	},
): void {
	const {
		deferredProps,
		mergeProps,
		prependProps,
		deepMergeProps,
		matchPropsOn,
		scrollProps,
		onceProps,
	} = collections;
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
