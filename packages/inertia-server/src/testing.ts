import type { InertiaPage } from "./types";
import { deepEqual, isInertiaPage } from "./utils";

type FetchLikeFn =
	| ((
			request: Request | string | URL,
			init?: RequestInit,
	  ) => Response | Promise<Response>)
	| ((request: Request) => Response | Promise<Response>);

interface WinterTcApp {
	fetch: FetchLikeFn;
}

interface InertiaTestingOptions {
	fetch?: FetchLikeFn;
}

export function inertiaFromPage(
	page: InertiaPage,
	options?: InertiaTestingOptions,
): InertiaAssertion {
	return new InertiaAssertion(page, options);
}

export function createAppHelper(
	app: WinterTcApp,
): (response: Response | unknown) => InertiaAssertion {
	return (response) =>
		new InertiaAssertion(response, { fetch: (req: Request) => app.fetch(req) });
}

export function inertia(
	response: Response | unknown,
	options?: InertiaTestingOptions,
): InertiaAssertion {
	return new InertiaAssertion(response, options);
}

type ValueCallback = (value: unknown) => boolean;

type ReloadConfig =
	| { type: "only"; props: string[] }
	| { type: "except"; props: string[] }
	| { type: "deferred"; groups: string[] };

type AssertionItem =
	| { kind: "assertion"; fn: (page: InertiaPage) => void | Promise<void> }
	| { kind: "reload"; config: ReloadConfig }
	| {
			kind: "reloadWithCallback";
			config: ReloadConfig;
			callback: (page: InertiaPage) => void | Promise<void>;
	  };

export class InertiaAssertion {
	private source: Response | unknown;
	private page: InertiaPage | null = null;
	private baseUrl: string | null = null;
	private items: AssertionItem[] = [];
	private readonly options: InertiaTestingOptions;

	constructor(source: Response | unknown, options?: InertiaTestingOptions) {
		this.source = source;
		this.options = options ?? {};
		this.baseUrl = "http://localhost";

		if (source instanceof Response && this.options.fetch === undefined) {
			try {
				const url = new URL(source.url);
				this.baseUrl = `${url.protocol}//${url.host}`;
			} catch {
				this.baseUrl = null;
			}
		}
	}

	tap(callback: (page: InertiaPage) => void | Promise<void>): this {
		this.items.push({ kind: "assertion", fn: callback });
		return this;
	}

	has(key: string, expected?: unknown | ValueCallback): this {
		this.items.push({
			kind: "assertion",
			fn: (page) => {
				const value = getNestedValue(page.props, key);

				if (value === undefined) {
					throw new Error(`Property "${key}" does not exist.`);
				}

				if (expected !== undefined) {
					if (typeof expected === "function") {
						const callback = expected as ValueCallback;
						if (!callback(value)) {
							throw new Error(
								`Property "${key}" failed callback assertion. Value: ${JSON.stringify(
									value,
								)}`,
							);
						}
					} else if (!deepEqual(value, expected)) {
						throw new Error(
							`Property "${key}" does not match expected value.\n` +
								`Expected: ${JSON.stringify(expected)}\n` +
								`Actual: ${JSON.stringify(value)}`,
						);
					}
				}
			},
		});

		return this;
	}

	missing(key: string): this {
		this.items.push({
			kind: "assertion",
			fn: (page) => {
				const value = getNestedValue(page.props, key);

				if (value !== undefined) {
					throw new Error(
						`Property "${key}" exists but should not. Value: ${JSON.stringify(
							value,
						)}`,
					);
				}
			},
		});

		return this;
	}

	component(expected: string): this {
		this.items.push({
			kind: "assertion",
			fn: (page) => {
				if (page.component !== expected) {
					throw new Error(
						`Component mismatch.\nExpected: "${expected}"\nActual: "${page.component}"`,
					);
				}
			},
		});
		return this;
	}

	url(expected: string): this {
		this.items.push({
			kind: "assertion",
			fn: (page) => {
				if (page.url !== expected) {
					throw new Error(
						`URL mismatch.\nExpected: "${expected}"\nActual: "${page.url}"`,
					);
				}
			},
		});
		return this;
	}

	version(expected: string): this {
		this.items.push({
			kind: "assertion",
			fn: (page) => {
				if (page.version !== expected) {
					throw new Error(
						`Version mismatch.\nExpected: "${expected}"\nActual: "${page.version}"`,
					);
				}
			},
		});
		return this;
	}

	reloadOnly(props: string | string[]): this;
	reloadOnly(
		props: string | string[],
		callback: (page: InertiaPage) => void | Promise<void>,
	): this;
	reloadOnly(
		props: string | string[],
		callback?: (page: InertiaPage) => void | Promise<void>,
	): this {
		const config: ReloadConfig = {
			type: "only",
			props: Array.isArray(props) ? props : [props],
		};

		if (callback) {
			this.items.push({ kind: "reloadWithCallback", config, callback });
		} else {
			this.items.push({ kind: "reload", config });
		}

		return this;
	}

	reloadExcept(props: string | string[]): this;
	reloadExcept(
		props: string | string[],
		callback: (page: InertiaPage) => void | Promise<void>,
	): this;
	reloadExcept(
		props: string | string[],
		callback?: (page: InertiaPage) => void | Promise<void>,
	): this {
		const config: ReloadConfig = {
			type: "except",
			props: Array.isArray(props) ? props : [props],
		};

		if (callback) {
			this.items.push({ kind: "reloadWithCallback", config, callback });
		} else {
			this.items.push({ kind: "reload", config });
		}

		return this;
	}

	loadDeferredProps(): this;
	loadDeferredProps(group: string): this;
	loadDeferredProps(groups: string[]): this;
	loadDeferredProps(
		callback: (page: InertiaPage) => void | Promise<void>,
	): this;
	loadDeferredProps(
		group: string,
		callback: (page: InertiaPage) => void | Promise<void>,
	): this;
	loadDeferredProps(
		groups: string[],
		callback: (page: InertiaPage) => void | Promise<void>,
	): this;
	loadDeferredProps(
		groupOrCallback?:
			| string
			| string[]
			| ((page: InertiaPage) => void | Promise<void>),
		callback?: (page: InertiaPage) => void | Promise<void>,
	): this {
		let groups: string[];
		let cb: ((page: InertiaPage) => void | Promise<void>) | undefined;

		if (groupOrCallback === undefined) {
			groups = [];
			cb = undefined;
		} else if (typeof groupOrCallback === "function") {
			groups = [];
			cb = groupOrCallback;
		} else if (Array.isArray(groupOrCallback)) {
			groups = groupOrCallback;
			cb = callback;
		} else {
			groups = [groupOrCallback];
			cb = callback;
		}

		const config: ReloadConfig = { type: "deferred", groups };

		if (cb) {
			this.items.push({ kind: "reloadWithCallback", config, callback: cb });
		} else {
			this.items.push({ kind: "reload", config });
		}

		return this;
	}

	async props(): Promise<Record<string, unknown>>;
	async props<T = unknown>(key: string): Promise<T>;
	async props<T = unknown>(key?: string): Promise<Record<string, unknown> | T> {
		const page = await this.resolvePage();
		if (key === undefined) {
			return page.props;
		}
		return getNestedValue(page.props, key) as T;
	}

	async toPage(): Promise<InertiaPage> {
		return this.resolvePage();
	}

	async assert(): Promise<void> {
		let currentPage = await this.resolvePage();

		for (const item of this.items) {
			switch (item.kind) {
				case "assertion":
					await item.fn(currentPage);
					break;

				case "reload":
					currentPage = await this.executeReload(currentPage, item.config);
					break;

				case "reloadWithCallback": {
					const reloadedPage = await this.executeReload(
						currentPage,
						item.config,
					);
					await item.callback(reloadedPage);
					break;
				}
			}
		}
	}

	private async resolvePage(): Promise<InertiaPage> {
		if (!this.page) {
			this.page = await parseInertiaResponse(this.source);
		}
		return this.page;
	}

	private async executeReload(
		page: InertiaPage,
		config: ReloadConfig,
	): Promise<InertiaPage> {
		if (config.type === "deferred") {
			return this.executeDeferredReload(page, config.groups);
		}

		const options: { only?: string[]; except?: string[] } = {};
		if (config.type === "only") {
			options.only = config.props;
		} else if (config.type === "except") {
			options.except = config.props;
		}

		const response = await this.makePartialRequest(page, options);

		return parseInertiaResponse(response);
	}

	private async executeDeferredReload(
		page: InertiaPage,
		requestedGroups: string[],
	): Promise<InertiaPage> {
		const deferredProps = page.deferredProps;
		if (!deferredProps || Object.keys(deferredProps).length === 0) {
			throw new Error("No deferred props in response.");
		}

		const groups =
			requestedGroups.length > 0 ? requestedGroups : Object.keys(deferredProps);

		const propsToLoad: string[] = [];
		for (const group of groups) {
			const groupProps = deferredProps[group];
			if (groupProps) {
				propsToLoad.push(...groupProps);
			}
		}

		if (propsToLoad.length === 0) {
			throw new Error(
				`No deferred props found in groups: ${groups.join(", ")}`,
			);
		}

		const response = await this.makePartialRequest(page, {
			only: propsToLoad,
		});

		return parseInertiaResponse(response);
	}

	private async makePartialRequest(
		page: InertiaPage,
		options: { only?: string[]; except?: string[] },
	): Promise<Response> {
		const fetchFn = this.options.fetch ?? globalThis.fetch;

		const fullUrl = this.baseUrl ? `${this.baseUrl}${page.url}` : page.url;

		const headers: Record<string, string> = {
			"X-Inertia": "true",
			"X-Inertia-Version": page.version,
			"X-Inertia-Partial-Component": page.component,
		};

		if (options.only) {
			headers["X-Inertia-Partial-Data"] = options.only.join(",");
		}

		if (options.except) {
			headers["X-Inertia-Partial-Except"] = options.except.join(",");
		}

		const request = new Request(fullUrl, { headers });

		return fetchFn(request);
	}
}

async function parseInertiaResponse(response: unknown): Promise<InertiaPage> {
	if (response instanceof Response) {
		const cloned = response.clone();
		const contentType = response.headers.get("Content-Type") ?? "";

		if (contentType.includes("application/json")) {
			return cloned.json() as Promise<InertiaPage>;
		}

		if (contentType.includes("text/html")) {
			const html = await cloned.text();
			return extractInertiaPageFromHtml(html);
		}

		throw new Error(
			`Unexpected response content type: ${contentType}. Expected application/json or text/html.`,
		);
	}

	if (isInertiaPage(response)) {
		return response;
	}

	if (typeof response === "string") {
		return extractInertiaPageFromHtml(response);
	}

	throw new Error(
		`Unexpected response type: ${typeof response}. Pass a Response or InertiaPage object.`,
	);
}

function extractInertiaPageFromHtml(html: string): InertiaPage {
	const singleQuoteMatch = html.match(/data-page='([^']+)'/);
	const doubleQuoteMatch = html.match(/data-page="([^"]+)"/);
	const match = singleQuoteMatch || doubleQuoteMatch;

	if (!match) {
		throw new Error(
			"Could not find data-page attribute in HTML response. " +
				"Make sure the response is a valid Inertia HTML response.",
		);
	}

	const rawJson = match[1]
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&amp;/g, "&");

	const page = JSON.parse(rawJson) as InertiaPage;

	if (!isInertiaPage(page)) {
		throw new Error("data-page attribute is not a valid InertiaPage object.");
	}

	return page;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	const keys = path.split(".");
	let current: unknown = obj;

	for (const key of keys) {
		if (current === null || current === undefined) {
			return undefined;
		}

		if (typeof current !== "object") {
			return undefined;
		}

		current = (current as Record<string, unknown>)[key];
	}

	return current;
}
