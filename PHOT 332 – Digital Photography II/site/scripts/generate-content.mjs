import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCourseGenerator } from "../../../scripts/generate-course-content.mjs";
import { buildOverviewMarkdown } from "../lib/overview.js";
import { extractPageMarkdown, readCourseFile, rewriteMdLinksMarkdown } from "../lib/sections.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

runCourseGenerator({
  courseSlug: "phot332",
  siteDir: path.resolve(__dirname, ".."),
  assetSync: "filtered",
  includeReadingsPage: false,
  includeDeliveryPage: false,
  buildOverviewMarkdown,
  extractPageMarkdown,
  readCourseFile,
  rewriteMdLinksMarkdown,
  assignments: [
    {
      path: "assignments/group-presentations.md",
      title: "Group Presentations",
      weight: 10,
      seoKey: "group-presentations",
      section: "Assignment #1",
      pageTitle: "Group Presentations",
      sourceAnchor: "assignment-1-group-presentations-20",
    },
    {
      path: "assignments/triptyque.md",
      title: "Triptyque",
      weight: 20,
      seoKey: "triptyque",
      section: "Assignment #2",
      pageTitle: "Triptyque",
      sourceAnchor: "assignment-2-triptyque-30",
    },
    {
      path: "assignments/looking-through-the-screen.md",
      title: "Looking Through The Screen",
      weight: 30,
      seoKey: "looking-through-the-screen",
      section: "Assignment #3",
      pageTitle: "Looking Through The Screen",
      sourceAnchor: "assignment-3-looking-through-the-screen-40",
    },
  ],
});
