import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCourseGenerator } from "../../../scripts/generate-course-content.mjs";
import { buildOverviewMarkdown } from "../lib/overview.js";
import { extractPageMarkdown, readCourseFile, rewriteMdLinksMarkdown } from "../lib/sections.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

runCourseGenerator({
  courseSlug: "phot331",
  siteDir: path.resolve(__dirname, ".."),
  assetSync: "full",
  buildOverviewMarkdown,
  extractPageMarkdown,
  readCourseFile,
  rewriteMdLinksMarkdown,
  assignments: [
    {
      path: "assignments/inputs.md",
      title: "Inputs",
      weight: 10,
      seoKey: "inputs",
      section: "Assignment #1",
      pageTitle: "Inputs",
      sourceAnchor: "assignment-1-inputs-30",
    },
    {
      path: "assignments/printing.md",
      title: "Printing",
      weight: 20,
      seoKey: "printing",
      section: "Assignment #2",
      pageTitle: "Printing",
      sourceAnchor: "assignment-2-printing-30",
    },
    {
      path: "assignments/composite-triptych.md",
      title: "Composite Triptych",
      weight: 30,
      seoKey: "composite-triptych",
      section: "Assignment #3",
      pageTitle: "Composite Triptych",
      sourceAnchor: "assignment-3-composite-triptych-30",
    },
  ],
});
