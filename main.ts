import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildDossier } from "./vendor/makefun-app.ts";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));
const sourceRoot = process.env.MAKEFUN_BOT_DIR || repositoryRoot;
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

mkdirSync(outputRoot, { recursive: true });

for (const directory of ["app", "screenshots"]) {
  const destination = join(outputRoot, directory);
  rmSync(destination, { recursive: true, force: true });
  cpSync(join(sourceRoot, directory), destination, { recursive: true });
}

writeFileSync(join(outputRoot, "dossier.json"), buildDossier(outputRoot, caps));
