import { parseInertiaHeaders } from "./headers";
import { buildRuntimeDefinition, resolvePageProps } from "./page-runtime";
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
	type CreateHelperFn,
	type CreateInertiaConfig,
	type DefinePageFn,
	type InertiaHelper,
	type InertiaPage,
	type InertiaPageContext,
	type InertiaPageDefinition,
	PAGE_PROPS,
	PAGE_VALUES,
	type PageDefinitionFnOptions,
	REQUIRED_SHARED,
} from "./types";

export {
	always,
	deepMerged,
	deepMergedProp,
	deferred,
	isBuilder,
	merged,
	mergedProp,
	once,
	optional,
	prop,
} from "./builders";
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
	DefinePageModifierOptions,
	DefinePageSchemaOptions,
	ErrorBags,
	InertiaHelper,
	InertiaPage,
	InertiaPageContext,
	InertiaPageDefinition as PageDefinition,
	InertiaRequestOptions,
	InertiaRequestOptions as InertiaRequestHeaders,
	MergeBuilder,
	ModifierTree,
	OnceBuilder,
	PageDefinitionFnOptions as PageRenderOptions,
	PageProps,
	PagePropsSchema,
	PagePropsValues,
	PropBuilder,
	ScrollDeepMergeBuilder,
	ScrollMergeBuilder,
} from "./types";

export function createInertia(config: CreateInertiaConfig): {
	definePage: DefinePageFn;
	createHelper: CreateHelperFn;
} {
	const definePage = (options: {
		component: string;
		props?: unknown;
		modifiers?: unknown;
		requireShared?: readonly string[];
	}): InertiaPageDefinition<
		Record<string, unknown>,
		Record<string, unknown>
	> => {
		const { component } = options;
		const definition = buildRuntimeDefinition(
			options as Parameters<typeof buildRuntimeDefinition>[0],
		);

		const pageDefinition = ((
			values: Record<string, unknown>,
			renderOptions?: PageDefinitionFnOptions,
		): InertiaPageContext => {
			return {
				component,
				definition,
				values,
				options: renderOptions,
				version:
					typeof config.version === "function"
						? config.version()
						: config.version,
			};
		}) as InertiaPageDefinition<
			Record<string, unknown>,
			Record<string, unknown>
		>;

		Object.defineProperty(pageDefinition, "component", {
			value: component,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(pageDefinition, "scrollOptions", {
			value: definition.scrollOptions,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(pageDefinition, REQUIRED_SHARED, {
			value: undefined,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(pageDefinition, PAGE_PROPS, {
			value: undefined,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(pageDefinition, PAGE_VALUES, {
			value: undefined,
			writable: false,
			enumerable: false,
		});

		return pageDefinition;
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
				const finalStatus = status ?? getRedirectStatus(request.method);
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

			errors(errors, bag): void {
				if (bag) {
					stagedErrors[bag] = errors;
					return;
				}

				stagedErrors.default = errors;
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

	return { definePage: definePage as unknown as DefinePageFn, createHelper };
}
