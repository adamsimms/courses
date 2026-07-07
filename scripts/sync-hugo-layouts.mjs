import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(rootDir, "templates/hugo-layouts");
const customScssTemplate = path.join(rootDir, "templates/course-assets/_custom.scss");

function copyDirectory(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyDirectory(sourcePath, destinationPath);
      continue;
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

export function syncHugoLayouts(siteDir) {
  const destination = path.join(siteDir, "layouts");
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }
  copyDirectory(templateDir, destination);

  const assetsDir = path.join(siteDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.copyFileSync(customScssTemplate, path.join(assetsDir, "_custom.scss"));
}
