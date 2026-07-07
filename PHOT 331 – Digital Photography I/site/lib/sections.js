import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteUrl } from "../../../scripts/site-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const courseDir = path.resolve(__dirname, "../..");
const hugoSiteDir = path.resolve(__dirname, "..");

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
  "resources.md": "/course/student-services/",
};

const hugoAnchorMap = {
  "#assignment-1-inputs-30": "/assignments/inputs/",
  "#assignment-2-printing-30": "/assignments/printing/",
  "#assignment-3-composite-triptych-30": "/assignments/composite-triptych/",
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
  let result = text.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]+)?\)/g, (_, label, file, hash) => {
    let target = hugoLinkMap[file] || `/${file.replace(/\.md$/, "")}/`;
    if (file === "assignments.md" && hash && hugoAnchorMap[hash]) {
      target = hugoAnchorMap[hash];
      hash = "";
    }
    return `[${label}](${internalUrl(target)}${hash || ""})`;
  });

  result = result.replace(/\[([^\]]+)\]\((assets\/[^)]+)\)/g, (_, label, assetPath) => {
    return `[${label}](${internalUrl(`/${assetPath}`)})`;
  });

  return result;
}

export function extractPageMarkdown(filename, sectionTitle, pageTitle, options = {}) {
  const section = extractSection(readCourseFile(filename), sectionTitle, options);
  const heading = pageTitle ? `# ${pageTitle}\n\n` : "";
  return rewriteMdLinksMarkdown(`${heading}${section}`);
}
