import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const courseDir = path.resolve(__dirname, "../..");

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
  "#moodle-responses-10": "/assignments/moodle-responses/",
  "#group-presentation--discussion-20": "/assignments/group-presentation/",
  "#research-creation-project-50": "/assignments/research-creation-project/",
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
  return text.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]+)?\)/g, (_, label, file, hash) => {
    let target = hugoLinkMap[file] || `/${file.replace(/\.md$/, "")}/`;
    if (file === "assignments.md" && hash && hugoAnchorMap[hash]) {
      target = hugoAnchorMap[hash];
      hash = "";
    }
    return `[${label}](${target}${hash || ""})`;
  });
}

export function extractPageMarkdown(filename, sectionTitle, pageTitle, options = {}) {
  const section = extractSection(readCourseFile(filename), sectionTitle, options);
  const heading = pageTitle ? `# ${pageTitle}\n\n` : "";
  return rewriteMdLinksMarkdown(`${heading}${section}`);
}
