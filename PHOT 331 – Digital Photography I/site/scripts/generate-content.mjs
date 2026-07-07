import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildOverviewMarkdown } from "../lib/overview.js";
import { extractPageMarkdown, readCourseFile, rewriteMdLinksMarkdown } from "../lib/sections.js";

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
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
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
  writePage(relativePath, { title, weight }, "");
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
  { title: "Home", bookHidden: true, bookToC: false, bookSearchExclude: true },
  "{{< course-hero >}}"
);

writeSectionIndex("course/_index.md", "Course", 10);

writePage(
  "course/overview.md",
  { title: "Overview", weight: 10 },
  rewriteMdLinksMarkdown(buildOverviewMarkdown())
);

writePage(
  "course/delivery.md",
  { title: "Delivery", weight: 20 },
  extractPageMarkdown("README.md", "Delivery", "Delivery")
);

writePage(
  "course/schedule.md",
  { title: "Schedule", weight: 30 },
  rewriteMdLinksMarkdown(`# Schedule\n\n${readCourseFile("schedule.md")}`)
);

writePage("course/rules.md", { title: "Rules", weight: 40 }, extractPageMarkdown("README.md", "Rules", "Rules"));

writePage(
  "course/student-services.md",
  { title: "Student Services", weight: 50 },
  extractPageMarkdown("resources.md", "Student Services", "Student Services")
);

writeSectionIndex("assignments/_index.md", "Assignments", 20);

writePage(
  "assignments/inputs.md",
  { title: "Inputs", weight: 10 },
  extractPageMarkdown("assignments.md", "Assignment #1", "Inputs", { exact: false })
);

writePage(
  "assignments/printing.md",
  { title: "Printing", weight: 20 },
  extractPageMarkdown("assignments.md", "Assignment #2", "Printing", { exact: false })
);

writePage(
  "assignments/composite-triptych.md",
  { title: "Composite Triptych", weight: 30 },
  extractPageMarkdown("assignments.md", "Assignment #3", "Composite Triptych", { exact: false })
);

writeSectionIndex("general/_index.md", "General Info", 30);

writePage(
  "general/faculty-of-fine-arts.md",
  { title: "Faculty Of Fine Arts", weight: 10 },
  `# Faculty Of Fine Arts

Message from the [Faculty of Fine Arts](https://www.concordia.ca/finearts.html) at Concordia University.`
);

writePage(
  "general/photography-program.md",
  { title: "Photography Program", weight: 20 },
  `# Photography Program

[Photography program](https://www.concordia.ca/finearts/studio-arts/photography.html) in the [Studio Arts Department](https://www.concordia.ca/finearts/studio-arts.html) at [Concordia University](https://www.concordia.ca).`
);

writePage(
  "appointments.md",
  {
    title: "Appointments",
    weight: 50,
    bookHref: "https://cal.com/adam-simms-ivi9mt/1-hour-meeting",
    bookToC: false,
    bookSearchExclude: true,
  },
  "."
);

console.log(`Generated Hugo content in ${contentDir}`);
