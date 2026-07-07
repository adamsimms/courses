import fs from "node:fs";
import path from "node:path";

const PAGES_MAX_ASSET_BYTES = 24 * 1024 * 1024;

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function assetFileSize(courseDir, assetPath) {
  const fullPath = path.join(courseDir, assetPath);
  if (!fs.existsSync(fullPath)) return null;
  return formatFileSize(fs.statSync(fullPath).size);
}

export function annotateAssetLinks(text, courseDir) {
  return text.replace(/\[([^\]]+)\]\((assets\/[^)]+)\)/g, (match, label, assetPath) => {
    const size = assetFileSize(courseDir, assetPath);
    if (!size || label.includes(size)) {
      return match;
    }
    return `[${label} (${size})](${assetPath})`;
  });
}

export function listAssetFiles(dir, { extensions = null } = {}) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (extensions && !extensions.some((ext) => entry.name.endsWith(ext))) continue;
    const filePath = path.join(dir, entry.name);
    const { size } = fs.statSync(filePath);
    files.push({
      name: entry.name,
      relPath: `assets/${path.basename(dir)}/${entry.name}`,
      size,
      sizeLabel: formatFileSize(size),
      overPagesLimit: size > PAGES_MAX_ASSET_BYTES,
    });
  }

  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export function humanizeFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
