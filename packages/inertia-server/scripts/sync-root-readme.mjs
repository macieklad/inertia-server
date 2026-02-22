import { copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, "..");
const packageReadmePath = resolve(packageDir, "README.md");
const rootReadmePath = resolve(packageDir, "..", "..", "README.md");

copyFileSync(rootReadmePath, packageReadmePath);
process.stdout.write("Synced root README into package README for packing.\n");
process.exit(0);
