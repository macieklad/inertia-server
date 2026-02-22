import { copyFileSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];

if (mode !== "prepack" && mode !== "postpack") {
	throw new Error("Expected mode: prepack | postpack");
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, "..");
const packageReadmePath = resolve(packageDir, "README.md");
const rootReadmePath = resolve(packageDir, "..", "..", "README.md");
const backupReadmePath = resolve(
	tmpdir(),
	"inertia-server-package-readme.backup.md",
);

if (mode === "prepack") {
	copyFileSync(packageReadmePath, backupReadmePath);
	copyFileSync(rootReadmePath, packageReadmePath);
	process.stdout.write("Synced root README into package README for packing.\n");
	process.exit(0);
}

if (!existsSync(backupReadmePath)) {
	process.stdout.write("README backup not found. Skipping restore.\n");
	process.exit(0);
}

copyFileSync(backupReadmePath, packageReadmePath);
rmSync(backupReadmePath);
process.stdout.write("Restored package README after packing.\n");
