import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCourseGenerator } from "../../../scripts/generate-course-content.mjs";
import { buildOverviewMarkdown } from "../lib/overview.js";
import { extractPageMarkdown, readCourseFile, rewriteMdLinksMarkdown } from "../lib/sections.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

runCourseGenerator({
  courseSlug: "phot300",
  siteDir: path.resolve(__dirname, ".."),
  assetSync: "full",
  includeReadingsPage: false,
  includeDeliveryPage: false,
  buildOverviewMarkdown,
  extractPageMarkdown,
  readCourseFile,
  rewriteMdLinksMarkdown,
  assignments: [
    {
      path: "assignments/proposal.md",
      title: "Proposal",
      weight: 10,
      seoKey: "proposal",
      section: "Proposal",
      pageTitle: "Proposal",
      sourceAnchor: "proposal",
    },
    {
      path: "assignments/mid-term-presentation.md",
      title: "Mid-Term Presentation",
      weight: 20,
      seoKey: "mid-term-presentation",
      section: "Mid-Term Presentation",
      pageTitle: "Mid-Term Presentation",
      sourceAnchor: "mid-term-presentation",
    },
    {
      path: "assignments/end-of-term-presentation-and-critique.md",
      title: "End-of-Term Presentation and Critique",
      weight: 30,
      seoKey: "end-of-term-presentation-and-critique",
      section: "End-of-Term Presentation and Critique",
      pageTitle: "End-of-Term Presentation and Critique",
      sourceAnchor: "end-of-term-presentation-and-critique",
    },
    {
      path: "assignments/class-participation.md",
      title: "Class Participation",
      weight: 40,
      seoKey: "class-participation",
      section: "Class Participation",
      pageTitle: "Class Participation",
      sourceAnchor: "class-participation",
    },
  ],
});
