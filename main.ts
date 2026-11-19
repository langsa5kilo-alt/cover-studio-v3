import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildDossier } from "./vendor/makefun-app.ts";

// Anchor the fallback source path to this file, not to the caller's working directory.
const repositoryRoot = dirname(fileURLToPath(import.meta.url));
const sourceRoot = process.env.MAKEFUN_BOT_DIR || repositoryRoot;
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// Keep the dossier inventory within the platform's accepted bundle limits.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

mkdirSync(outputRoot, { recursive: true });

// Rebuild both asset trees so an earlier export cannot leave stale files behind.
for (const directory of ["app", "screenshots"]) {
  const destination = join(outputRoot, directory);
  try {
    rmSync(destination, { recursive: true, force: true });
    cpSync(join(sourceRoot, directory), destination, { recursive: true });
  } catch (error) {
    throw new Error(
      `Failed to replace output directory "${destination}" from source "${join(sourceRoot, directory)}"`,
      { cause: error },
    );
  }
}

// Generate the manifest only after the files it inventories are in place.
try {
  writeFileSync(join(outputRoot, "dossier.json"), buildDossier(outputRoot, caps));
} catch (error) {
  throw new Error(`Failed to build or write dossier manifest "${join(outputRoot, "dossier.json")}"`, {
    cause: error,
  });
}
