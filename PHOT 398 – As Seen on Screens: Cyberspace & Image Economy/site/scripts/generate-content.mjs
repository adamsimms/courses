import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCourseGenerator } from "../../../scripts/generate-course-content.mjs";
import { buildOverviewMarkdown } from "../lib/overview.js";
import { extractPageMarkdown, readCourseFile, rewriteMdLinksMarkdown } from "../lib/sections.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

runCourseGenerator({
  courseSlug: "phot398",
  siteDir: path.resolve(__dirname, ".."),
  assetSync: "none",
  buildOverviewMarkdown,
  extractPageMarkdown,
  readCourseFile,
  rewriteMdLinksMarkdown,
  assignments: [
    {
      path: "assignments/moodle-responses.md",
      title: "Moodle Responses",
      weight: 10,
      seoKey: "moodle-responses",
      section: "Moodle Responses",
      pageTitle: "Moodle Responses",
      sourceAnchor: "moodle-responses",
    },
    {
      path: "assignments/group-presentation.md",
      title: "Group Presentations",
      weight: 20,
      seoKey: "group-presentation",
      section: "Group Presentation",
      pageTitle: "Group Presentations",
      sourceAnchor: "group-presentation",
    },
    {
      path: "assignments/research-creation-project.md",
      title: "Research-Creation Project",
      weight: 30,
      seoKey: "research-creation-project",
      section: "Research-Creation Project",
      pageTitle: "Research-Creation Project",
      sourceAnchor: "research-creation-project",
    },
  ],
});
