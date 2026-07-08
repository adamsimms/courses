import fs from "node:fs";
import path from "node:path";
import {
  appointmentsMeta,
  contentSitemap,
  homeMeta,
  longPageMeta,
  sectionIndexMeta,
  seoMeta,
  sourceMeta,
} from "./generate-content-helpers.mjs";
import { buildReadingsMarkdown } from "./readings-page.mjs";
import { writeRelatedCoursesData } from "./course-catalog.mjs";
import { siteUrl } from "./site-path.mjs";

const PAGES_MAX_ASSET_BYTES = 24 * 1024 * 1024;

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

function writePage(contentDir, relativePath, frontmatter, body) {
  const filePath = path.join(contentDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${formatYamlValue(value)}`)
    .join("\n");

  fs.writeFileSync(filePath, `---\n${yaml}\n---\n\n${body.trim()}\n`);
}

function writeSectionIndex(contentDir, relativePath, title, weight) {
  writePage(contentDir, relativePath, { title, weight, ...sectionIndexMeta }, "");
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

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
      console.warn(`Skipping ${path.relative(source, sourcePath)} (>24 MiB, linked from GitHub)`);
      continue;
    }

    fs.cpSync(sourcePath, destinationPath);
  }
}

function syncAssets(courseAssetsDir, staticAssetsDir, mode) {
  if (fs.existsSync(staticAssetsDir)) {
    fs.rmSync(staticAssetsDir, { recursive: true, force: true });
  }
  if (!fs.existsSync(courseAssetsDir) || mode === "none") return;

  if (mode === "filtered") {
    copyAssetsFiltered(courseAssetsDir, staticAssetsDir);
  } else {
    fs.cpSync(courseAssetsDir, staticAssetsDir, { recursive: true });
  }
}

function buildPrintSyllabusBody({ buildOverviewMarkdown, readCourseFile, rewriteMdLinksMarkdown, assignmentTitles }) {
  const overview = rewriteMdLinksMarkdown(buildOverviewMarkdown()).replace(/^# Overview\n\n/, "");
  const schedule = rewriteMdLinksMarkdown(readCourseFile("schedule.md")).replace(/^# Schedule\n\n/, "");
  const assignmentList = assignmentTitles.map((title) => `- ${title}`).join("\n");

  return `# Syllabus

<p class="print-actions no-print"><button type="button" onclick="window.print()">Print this page</button></p>

${overview}

---

# Schedule

${schedule}

---

# Assignments

${assignmentList}
`;
}

export function runCourseGenerator({
  courseSlug,
  siteDir,
  assetSync = "full",
  includeReadingsPage = true,
  includeDeliveryPage = true,
  assignments,
  buildOverviewMarkdown,
  extractPageMarkdown,
  readCourseFile,
  rewriteMdLinksMarkdown,
}) {
  const sitePath = path.resolve(siteDir);
  const contentDir = path.join(sitePath, "content");
  const staticAssetsDir = path.join(sitePath, "static/assets");
  const courseDir = path.resolve(sitePath, "..");
  const courseFolderName = path.basename(courseDir);
  const url = (relativePath) => siteUrl(sitePath, relativePath);

  cleanDir(contentDir);
  syncAssets(path.join(courseDir, "assets"), staticAssetsDir, assetSync);
  writeRelatedCoursesData(sitePath, courseSlug);

  writePage(contentDir, "_index.md", { title: "Home", ...homeMeta, ...seoMeta(courseSlug, "home") }, "{{< course-hero >}}");

  writeSectionIndex(contentDir, "course/_index.md", "Course", 10);

  writePage(
    contentDir,
    "course/overview.md",
    {
      title: "Overview",
      weight: 10,
      ...seoMeta(courseSlug, "overview"),
      ...contentSitemap(1.0),
      ...sourceMeta(courseFolderName, "README.md"),
    },
    rewriteMdLinksMarkdown(buildOverviewMarkdown())
  );

  writePage(
    contentDir,
    "course/print.md",
    {
      title: "Print Syllabus",
      weight: 15,
      layout: "print-syllabus",
      noindex: true,
      sitemap: { disable: true },
      bookHidden: true,
      bookToC: false,
    },
    buildPrintSyllabusBody({
      buildOverviewMarkdown,
      readCourseFile,
      rewriteMdLinksMarkdown,
      assignmentTitles: assignments.map((item) => item.title),
    })
  );

  if (includeDeliveryPage) {
    writePage(
      contentDir,
      "course/delivery.md",
      {
        title: "Delivery",
        weight: 20,
        ...seoMeta(courseSlug, "delivery"),
        ...contentSitemap(0.7),
        ...sourceMeta(courseFolderName, "README.md", "delivery"),
      },
      extractPageMarkdown("README.md", "Delivery", "Delivery")
    );
  }

  writePage(
    contentDir,
    "course/schedule.md",
    {
      title: "Schedule",
      weight: 30,
      ...seoMeta(courseSlug, "schedule"),
      ...contentSitemap(0.8),
      ...sourceMeta(courseFolderName, "schedule.md"),
    },
    rewriteMdLinksMarkdown(`# Schedule\n\n${readCourseFile("schedule.md")}`)
  );

  writePage(
    contentDir,
    "course/rules.md",
    {
      title: "Rules",
      weight: 40,
      ...longPageMeta,
      ...seoMeta(courseSlug, "rules"),
      ...contentSitemap(0.6),
      ...sourceMeta(courseFolderName, "README.md", "rules"),
    },
    extractPageMarkdown("README.md", "Rules", "Rules")
  );

  writePage(
    contentDir,
    "course/student-services.md",
    {
      title: "Student Services",
      weight: 50,
      ...seoMeta(courseSlug, "student-services"),
      ...contentSitemap(0.7),
      ...sourceMeta(courseFolderName, "resources.md", "student-services"),
    },
    extractPageMarkdown("resources.md", "Student Services", "Student Services")
  );

  writeSectionIndex(contentDir, "assignments/_index.md", "Assignments", 20);

  for (const assignment of assignments) {
    writePage(
      contentDir,
      assignment.path,
      {
        title: assignment.title,
        weight: assignment.weight,
        ...longPageMeta,
        ...seoMeta(courseSlug, assignment.seoKey),
        ...contentSitemap(0.8),
        ...sourceMeta(courseFolderName, "assignments.md", assignment.sourceAnchor),
      },
      extractPageMarkdown("assignments.md", assignment.section, assignment.pageTitle, {
        exact: assignment.exact ?? false,
      })
    );
  }

  if (includeReadingsPage) {
    writePage(
      contentDir,
      "readings.md",
      {
        title: "Readings & Downloads",
        weight: 25,
        ...seoMeta(courseSlug, "readings"),
        ...contentSitemap(0.7),
        ...sourceMeta(courseFolderName, "assets/README.md"),
      },
      rewriteMdLinksMarkdown(buildReadingsMarkdown(courseDir, url))
    );
  }

  writePage(
    contentDir,
    "course/appointments.md",
    {
      title: "Appointments",
      weight: 60,
      bookHref: "https://cal.com/adam-simms-ivi9mt/1-hour-meeting",
      ...appointmentsMeta,
    },
    "."
  );

  console.log(`Generated Hugo content in ${contentDir}`);
}
