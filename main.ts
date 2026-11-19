import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildDossier } from "./vendor/makefun-app.ts";

// Resolve defaults beside this entry point so the script also works outside the
// repository's current working directory.
const repositoryRoot = dirname(fileURLToPath(import.meta.url));
const sourceRoot = process.env.MAKEFUN_BOT_DIR || repositoryRoot;
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// These limits describe the bundle that buildDossier is allowed to inventory.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

mkdirSync(outputRoot, { recursive: true });

// Always replace generated assets; stale files must not survive a new export.
for (const directory of ["app", "screenshots"]) {
  const destination = join(outputRoot, directory);
  try {
    rmSync(destination, { recursive: true, force: true });
    cpSync(join(sourceRoot, directory), destination, { recursive: true });
  } catch (error) {
    throw new Error(`Could not refresh ${directory} in ${outputRoot}`, { cause: error });
  }
}

// Write the manifest last so it only describes a fully copied bundle.
try {
  writeFileSync(join(outputRoot, "dossier.json"), buildDossier(outputRoot, caps));
} catch (error) {
  throw new Error(`Could not write dossier.json in ${outputRoot}`, { cause: error });
}
