import { extractSection, readCourseFile, rewriteMdLinksMarkdown } from "./sections.js";

function gradingTable(raw) {
  const section = extractSection(raw, "Grading");
  const tableEnd = section.search(/\n\*\*A\+/);
  const table = tableEnd > -1 ? section.slice(0, tableEnd).trim() : section.split("\n").slice(0, 6).join("\n");
  return `## Grading\n\n${table}`;
}

function gradingSystem(raw) {
  const section = extractSection(raw, "Grading");
  const scale = section
    .split("\n")
    .filter((line) => /^[A-F]/.test(line.trim()) || line.includes("90–100") || line.includes("90-100"))
    .join("\n");
  const descriptions = section
    .split("\n")
    .filter((line) => line.startsWith("**A") || line.startsWith("**B") || line.startsWith("**C") || line.startsWith("**D") || line.startsWith("**F"))
    .join("\n\n");

  return `## Grading System

${descriptions}

${scale}

Please refer to the [Concordia Academic Calendar, section 16.3.3](https://www.concordia.ca/academics/undergraduate/calendar.html) for additional information on the grading system.`;
}

export function buildOverviewMarkdown() {
  const raw = readCourseFile("README.md");
  const courseDescription = extractSection(raw, "Description");
  const overviewBlock = extractSection(raw, "Overview");
  const objectives = extractSection(overviewBlock, "Objectives", { level: 3 });
  const overviewBody = overviewBlock.replace(/### Objectives[\s\S]*/m, "").trim();
  const fees = extractSection(raw, "Fees + Materials");

  const markdown = `# Overview

## Course Description

${courseDescription}

## Overview

${overviewBody}

## Objectives

${objectives}

## Materials & Fees

${fees}

${gradingTable(raw)}

${gradingSystem(raw)}
`;

  return rewriteMdLinksMarkdown(markdown);
}
