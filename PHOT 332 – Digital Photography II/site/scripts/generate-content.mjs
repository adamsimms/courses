import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  appointmentsMeta,
  contentSitemap,
  homeMeta,
  sectionIndexMeta,
  seoMeta,
} from "../../../scripts/generate-content-helpers.mjs";
import { buildOverviewMarkdown } from "../lib/overview.js";
import { extractPageMarkdown, readCourseFile, rewriteMdLinksMarkdown } from "../lib/sections.js";

const COURSE_SLUG = "phot332";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, "../content");
const staticAssetsDir = path.resolve(__dirname, "../static/assets");
const courseAssetsDir = path.resolve(__dirname, "../../assets");

const PAGES_MAX_ASSET_BYTES = 24 * 1024 * 1024;

function copyAssetsFiltered(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyAssetsFiltered(sourcePath, destinationPath);
      continue;
    }

    if (fs.statSync(sourcePath).size > PAGES_MAX_ASSET_BYTES) {
      console.warn(`Skipping ${path.relative(courseAssetsDir, sourcePath)} (>24 MiB, linked from GitHub)`);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function syncAssets() {
  if (fs.existsSync(staticAssetsDir)) {
    fs.rmSync(staticAssetsDir, { recursive: true, force: true });
  }
  if (fs.existsSync(courseAssetsDir)) {
    copyAssetsFiltered(courseAssetsDir, staticAssetsDir);
  }
}

function formatYamlValue(value) {
  if (value === null || value === undefined) return '""';
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const entries = Object.entries(value).map(([key, nested]) => `  ${key}: ${formatYamlValue(nested)}`);
    return `\n${entries.join("\n")}`;
  }
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

function writePage(relativePath, frontmatter, body) {
  const filePath = path.join(contentDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${formatYamlValue(value)}`)
    .join("\n");

  fs.writeFileSync(filePath, `---\n${yaml}\n---\n\n${body.trim()}\n`);
}

function writeSectionIndex(relativePath, title, weight) {
  writePage(relativePath, { title, weight, ...sectionIndexMeta }, "");
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

cleanDir(contentDir);
syncAssets();

writePage(
  "_index.md",
  { title: "Home", ...homeMeta, ...seoMeta(COURSE_SLUG, "home") },
  "{{< course-hero >}}"
);

writeSectionIndex("course/_index.md", "Course", 10);

writePage(
  "course/overview.md",
  { title: "Overview", weight: 10, ...seoMeta(COURSE_SLUG, "overview"), ...contentSitemap(1.0) },
  rewriteMdLinksMarkdown(buildOverviewMarkdown())
);

writePage(
  "course/delivery.md",
  { title: "Delivery", weight: 20, ...seoMeta(COURSE_SLUG, "delivery"), ...contentSitemap(0.7) },
  extractPageMarkdown("README.md", "Delivery", "Delivery")
);

writePage(
  "course/schedule.md",
  { title: "Schedule", weight: 30, ...seoMeta(COURSE_SLUG, "schedule"), ...contentSitemap(0.8) },
  rewriteMdLinksMarkdown(`# Schedule\n\n${readCourseFile("schedule.md")}`)
);

writePage(
  "course/rules.md",
  { title: "Rules", weight: 40, ...seoMeta(COURSE_SLUG, "rules"), ...contentSitemap(0.6) },
  extractPageMarkdown("README.md", "Rules", "Rules")
);

writePage(
  "course/student-services.md",
  { title: "Student Services", weight: 50, ...seoMeta(COURSE_SLUG, "student-services"), ...contentSitemap(0.7) },
  extractPageMarkdown("resources.md", "Student Services", "Student Services")
);

writeSectionIndex("assignments/_index.md", "Assignments", 20);

writePage(
  "assignments/group-presentations.md",
  { title: "Group Presentations", weight: 10, ...seoMeta(COURSE_SLUG, "group-presentations"), ...contentSitemap(0.8) },
  extractPageMarkdown("assignments.md", "Assignment #1", "Group Presentations", { exact: false })
);

writePage(
  "assignments/triptyque.md",
  { title: "Triptyque", weight: 20, ...seoMeta(COURSE_SLUG, "triptyque"), ...contentSitemap(0.8) },
  extractPageMarkdown("assignments.md", "Assignment #2", "Triptyque", { exact: false })
);

writePage(
  "assignments/looking-through-the-screen.md",
  {
    title: "Looking Through The Screen",
    weight: 30,
    ...seoMeta(COURSE_SLUG, "looking-through-the-screen"),
    ...contentSitemap(0.8),
  },
  extractPageMarkdown("assignments.md", "Assignment #3", "Looking Through The Screen", { exact: false })
);

writeSectionIndex("general/_index.md", "General Info", 30);

writePage(
  "general/faculty-of-fine-arts.md",
  { title: "Faculty Of Fine Arts", weight: 10, ...seoMeta(COURSE_SLUG, "faculty-of-fine-arts"), ...contentSitemap(0.5) },
  `# Faculty Of Fine Arts

Message from the [Faculty of Fine Arts](https://www.concordia.ca/finearts.html) at Concordia University.`
);

writePage(
  "general/photography-program.md",
  { title: "Photography Program", weight: 20, ...seoMeta(COURSE_SLUG, "photography-program"), ...contentSitemap(0.5) },
  `# Photography Program

[Photography program](https://www.concordia.ca/finearts/studio-arts/photography.html) in the [Studio Arts Department](https://www.concordia.ca/finearts/studio-arts.html) at [Concordia University](https://www.concordia.ca).`
);

writePage(
  "appointments.md",
  {
    title: "Appointments",
    weight: 50,
    bookHref: "https://cal.com/adam-simms-ivi9mt/1-hour-meeting",
    ...appointmentsMeta,
  },
  "."
);

console.log(`Generated Hugo content in ${contentDir}`);
