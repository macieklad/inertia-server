import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface ManifestEntry {
	file: string;
	name?: string;
	src?: string;
	isEntry?: boolean;
	css?: string[];
	assets?: string[];
	imports?: string[];
	dynamicImports?: string[];
}

export type Manifest = Record<string, ManifestEntry>;

let cachedManifest: Manifest | null = null;

export function loadManifest(): Manifest | null {
	if (cachedManifest) {
		return cachedManifest;
	}

	const manifestPath = join(
		import.meta.dir,
		"../../dist/client/.vite/manifest.json",
	);

	if (!existsSync(manifestPath)) {
		return null;
	}

	try {
		const content = readFileSync(manifestPath, "utf-8");
		cachedManifest = JSON.parse(content);
		return cachedManifest;
	} catch {
		return null;
	}
}
