import type { InertiaPage } from "inertia-server/types";
import type { Manifest } from "../manifest";

const VITE_DEV_SERVER = "http://localhost:5174";

interface RootProps {
	page: InertiaPage;
	manifest: Manifest | null;
}

function getReactRefreshPreamble() {
	return `
import RefreshRuntime from "${VITE_DEV_SERVER}/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`;
}

export default function Root({ page, manifest }: RootProps) {
	const isDev = !manifest;
	const entrypoint = "src/ui/main.tsx";
	const jsPath = manifest?.[entrypoint]?.file
		? `/assets/${manifest[entrypoint].file}`
		: null;
	const cssFiles = manifest?.[entrypoint]?.css ?? [];

	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Inertia Server Example</title>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap"
					rel="stylesheet"
				/>
				{cssFiles.map((css) => (
					<link key={css} rel="stylesheet" href={`/assets/${css}`} />
				))}
			</head>
			<body>
				<div id="app" data-page={JSON.stringify(page)} />
				{isDev ? (
					<>
						<script type="module" src={`${VITE_DEV_SERVER}/@vite/client`} />
						<script type="module">{getReactRefreshPreamble()}</script>
						<script type="module" src={`${VITE_DEV_SERVER}/src/ui/main.tsx`} />
					</>
				) : (
					jsPath && <script type="module" src={jsPath} />
				)}
			</body>
		</html>
	);
}

export function renderToHtml(
	page: InertiaPage,
	manifest: Manifest | null,
): string {
	const { renderToString } = require("react-dom/server");
	return `<!DOCTYPE html>${renderToString(<Root page={page} manifest={manifest} />)}`;
}
