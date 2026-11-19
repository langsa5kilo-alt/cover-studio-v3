import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const requestedHelper = "/home/ubuntu/projects/makefun/kits/gta6-cover/gta6-cover-art-01-kit/vendor/makefun-frontend.ts";
const compatibleHelper = "/home/ubuntu/agents/brisk/projects/gta6-cover/vendor/makefun-frontend.ts";
let helper;
try {
  helper = await import(pathToFileURL(requestedHelper).href);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ERR_MODULE_NOT_FOUND") throw error;
  helper = await import(pathToFileURL(compatibleHelper).href);
}
const { buildDossier } = helper;

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
};

const project = dirname(fileURLToPath(import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(output, { recursive: true });
for (const name of ["app", "screenshots"]) {
  const destination = join(output, name);
  rmSync(destination, { recursive: true, force: true });
  cpSync(join(project, name), destination, { recursive: true });
}
writeFileSync(join(output, "dossier.json"), buildDossier(output, caps));
