import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { annotateAssetLinks } from "../../../scripts/asset-links.mjs";
import { siteUrl } from "../../../scripts/site-path.mjs";
import { externalAssetUrl } from "../../../scripts/sample-releases.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const courseDir = path.resolve(__dirname, "../..");
const courseFolder = path.basename(courseDir);
const hugoSiteDir = path.resolve(__dirname, "..");
const PAGES_MAX_ASSET_BYTES = 24 * 1024 * 1024;

function internalUrl(relativePath) {
  return siteUrl(hugoSiteDir, relativePath);
}

export function stripRepoNav(content) {
  return content
    .replace(/^# [^\n]+\n\n/m, "")
    .replace(/^\[Syllabus\]\(README\.md\)[^\n]*\n\n(?:---\n\n)?/m, "")
    .replace(/^\*\*Syllabus\*\*[^\n]*\n\n/m, "")
    .replace(/^---\n\n/m, "");
}

const hugoLinkMap = {
  "README.md": "/course/overview/",
  "assignments.md": "/assignments/",
  "schedule.md": "/course/schedule/",
};

const hugoAnchorMap = {
  "#assignment-1-group-presentations-20": "/assignments/group-presentations/",
  "#assignment-2-triptyque-30": "/assignments/triptyque/",
  "#assignment-3-looking-through-the-screen-40": "/assignments/looking-through-the-screen/",
};

export function readCourseFile(filename) {
  return stripRepoNav(fs.readFileSync(path.join(courseDir, filename), "utf8"));
}

export function extractSection(content, title, { level = 2, until, exact = true } = {}) {
  const lines = content.split("\n");
  const prefix = "#".repeat(level) + " ";
  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (start < 0) {
      const heading = line.startsWith(prefix) ? line.slice(prefix.length).trim() : "";
      const matched = exact ? heading === title : heading.startsWith(title);
      if (matched) {
        start = i + 1;
      }
      continue;
    }

    if (until && line.startsWith("#".repeat(level) + " ") && line.slice(prefix.length).trim() === until) {
      end = i;
      break;
    }

    if (level === 2 && line.startsWith("## ") && !line.startsWith("### ")) {
      end = i;
      break;
    }

    if (level === 3 && line.startsWith("### ")) {
      end = i;
      break;
    }
  }

  if (start < 0) return "";
  return lines.slice(start, end).join("\n").trim();
}

export function rewriteMdLinksMarkdown(text) {
  let result = annotateAssetLinks(text, courseDir);

  result = result.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]+)?\)/g, (_, label, file, hash) => {
    let target = hugoLinkMap[file] || `/${file.replace(/\.md$/, "")}/`;
    if (file === "assignments.md" && hash && hugoAnchorMap[hash]) {
      target = hugoAnchorMap[hash];
      hash = "";
    }
    return `[${label}](${internalUrl(target)}${hash || ""})`;
  });

  result = result.replace(/\[([^\]]+)\]\((assets\/[^)]+)\)/g, (_, label, assetPath) => {
    const releaseUrl = externalAssetUrl(courseFolder, assetPath);
    if (releaseUrl) {
      return `[${label}](${releaseUrl})`;
    }

    const sourcePath = path.join(courseDir, assetPath);
    if (fs.existsSync(sourcePath) && fs.statSync(sourcePath).size > PAGES_MAX_ASSET_BYTES) {
      throw new Error(
        `Asset ${assetPath} exceeds the Pages size limit but is not listed in scripts/sample-releases.mjs`
      );
    }
    return `[${label}](${internalUrl(`/${assetPath}`)})`;
  });

  return result;
}

export function extractPageMarkdown(filename, sectionTitle, pageTitle, options = {}) {
  const section = extractSection(readCourseFile(filename), sectionTitle, options);
  const heading = pageTitle ? `# ${pageTitle}\n\n` : "";
  return rewriteMdLinksMarkdown(`${heading}${section}`);
}
