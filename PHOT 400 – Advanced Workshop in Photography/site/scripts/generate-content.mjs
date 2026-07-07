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

const COURSE_SLUG = "phot400";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, "../content");
const staticAssetsDir = path.resolve(__dirname, "../static/assets");
const courseAssetsDir = path.resolve(__dirname, "../../assets");

function syncAssets() {
  if (fs.existsSync(staticAssetsDir)) {
    fs.rmSync(staticAssetsDir, { recursive: true, force: true });
  }
  if (fs.existsSync(courseAssetsDir)) {
    fs.cpSync(courseAssetsDir, staticAssetsDir, { recursive: true });
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
  "assignments/proposal.md",
  { title: "Proposal", weight: 10, ...seoMeta(COURSE_SLUG, "proposal"), ...contentSitemap(0.8) },
  extractPageMarkdown("assignments.md", "Proposal", "Proposal", { exact: false })
);

writePage(
  "assignments/mid-term-presentation.md",
  { title: "Mid-Term Presentation", weight: 20, ...seoMeta(COURSE_SLUG, "mid-term-presentation"), ...contentSitemap(0.8) },
  extractPageMarkdown("assignments.md", "Mid-Term Presentation", "Mid-Term Presentation", { exact: false })
);

writePage(
  "assignments/final-presentation-and-critique.md",
  {
    title: "Final Presentation and Critique",
    weight: 30,
    ...seoMeta(COURSE_SLUG, "final-presentation-and-critique"),
    ...contentSitemap(0.8),
  },
  extractPageMarkdown("assignments.md", "Final Presentation and Critique", "Final Presentation and Critique", {
    exact: false,
  })
);

writePage(
  "assignments/class-participation.md",
  { title: "Class Participation", weight: 40, ...seoMeta(COURSE_SLUG, "class-participation"), ...contentSitemap(0.7) },
  extractPageMarkdown("assignments.md", "Class Participation", "Class Participation", { exact: false })
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
