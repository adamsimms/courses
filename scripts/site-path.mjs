import fs from "node:fs";
import path from "node:path";

export function readSitePath(hugoSiteDir) {
  const hugoToml = fs.readFileSync(path.join(hugoSiteDir, "hugo.toml"), "utf8");
  const match = hugoToml.match(/^baseURL\s*=\s*"(.+?)"/m);
  if (!match) return "";
  return new URL(match[1]).pathname.replace(/\/$/, "");
}

export function siteUrl(hugoSiteDir, relativePath) {
  const sitePath = readSitePath(hugoSiteDir);
  const normalized = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${sitePath}${normalized}`;
}
