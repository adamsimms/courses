import fs from "node:fs";
import path from "node:path";
import { humanizeFilename, listAssetFiles } from "./asset-links.mjs";
import { externalAssetUrl, listExternalAssets } from "./sample-releases.mjs";

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function parseReadingsTable(readmeContent, siteUrlFn) {
  const match = readmeContent.match(/## Readings[\s\S]*?\n(\|[^|][\s\S]*?)(?:\n\n|\n## )/);
  if (!match) return "";

  const rows = match[1]
    .trim()
    .split("\n")
    .slice(2)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) return "";

  const items = rows.map((line) => {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    const [reading, author, source] = cells;
    return `- ${reading} — ${author}. ${source}`;
  });

  return `## Assigned readings

Publisher and official sources for course texts. See the [schedule](${siteUrlFn("/course/schedule/")}) and [assignments](${siteUrlFn("/assignments/")}) for when each reading is discussed.

${items.join("\n")}`;
}

function localFilesSection(title, files, siteUrl) {
  if (files.length === 0) return "";

  const rows = files.map((file) => {
    const label = humanizeFilename(file.name);
    const href = siteUrl(`/${file.relPath}`);
    const hosted = file.overPagesLimit ? " — hosted on [GitHub](https://github.com/adamsimms/syllabi)" : "";
    return `| ${label} | ${file.sizeLabel} | [Download](${href})${hosted} |`;
  });

  return `## ${title}

| File | Size | Link |
|------|------|------|
${rows.join("\n")}`;
}

function externalSamplesSection(courseFolderName) {
  const files = listExternalAssets(courseFolderName);
  if (files.length === 0) return "";

  const rows = files.map((assetPath) => {
    const label = humanizeFilename(path.basename(assetPath));
    const href = externalAssetUrl(courseFolderName, assetPath);
    return `| ${label} | GitHub | [Download on GitHub](${href}) |`;
  });

  return `## Sample files (GitHub)

| File | Size | Link |
|------|------|------|
${rows.join("\n")}`;
}

export function buildReadingsMarkdown(courseDir, siteUrlFn) {
  const assetsDir = path.join(courseDir, "assets");
  const courseFolderName = path.basename(courseDir);
  const readme = readText(path.join(assetsDir, "README.md"));
  const sections = ["# Readings & Downloads", ""];

  const readingsTable = parseReadingsTable(readme, siteUrlFn);
  if (readingsTable) {
    sections.push(readingsTable, "");
  }

  const readingPdfs = listAssetFiles(path.join(assetsDir, "readings"), { extensions: [".pdf"] }).map((file) => ({
    ...file,
    relPath: `assets/readings/${file.name}`,
  }));
  const manuals = listAssetFiles(path.join(assetsDir, "manuals"), { extensions: [".pdf"] }).map((file) => ({
    ...file,
    relPath: `assets/manuals/${file.name}`,
  }));
  const samples = listAssetFiles(path.join(assetsDir, "samples"), { extensions: [".zip"] }).map((file) => ({
    ...file,
    relPath: `assets/samples/${file.name}`,
  }));

  const localSections = [
    localFilesSection("PDF readings", readingPdfs, siteUrlFn),
    localFilesSection("Manuals", manuals, siteUrlFn),
    localFilesSection("Sample files", samples, siteUrlFn),
    externalSamplesSection(courseFolderName),
  ].filter(Boolean);

  if (localSections.length > 0) {
    sections.push(
      "Files stored in this course repository. Large archives over 24 MB are linked from GitHub instead of this site.",
      "",
      ...localSections.flatMap((section) => [section, ""])
    );
  } else if (!readingsTable) {
    sections.push(
      `Assigned readings and downloads are linked from the [schedule](${siteUrlFn("/course/schedule/")}) and [assignments](${siteUrlFn("/assignments/")}) pages.`,
      ""
    );
  }

  return sections.join("\n").trim();
}
