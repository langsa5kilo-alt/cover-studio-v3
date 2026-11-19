import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const kitHelper = "/home/ubuntu/projects/makefun/kits/gta6-cover/gta6-cover-art-01-kit/vendor/makefun-frontend.ts";
const workspaceHelper = "/home/ubuntu/agents/brisk/projects/gta6-cover/vendor/makefun-frontend.ts";

let module;
try {
  module = await import(pathToFileURL(kitHelper).href);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ERR_MODULE_NOT_FOUND") throw error;
  module = await import(pathToFileURL(workspaceHelper).href);
}

const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const root = dirname(fileURLToPath(import.meta.url));
const target = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(target, { recursive: true });

for (const folder of ["app", "screenshots"]) {
  const copyTarget = join(target, folder);
  rmSync(copyTarget, { recursive: true, force: true });
  cpSync(join(root, folder), copyTarget, { recursive: true });
}

writeFileSync(join(target, "dossier.json"), module.buildDossier(target, limits));
