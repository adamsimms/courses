import { extractSection, readCourseFile, rewriteMdLinksMarkdown } from "./sections.js";

function splitDescription(description) {
  const objectiveMarker =
    "The objective of this course is for students to invest themselves in the creation of works which will exist solely online";
  const idx = description.indexOf(objectiveMarker);
  if (idx === -1) {
    const parts = description.split(/\n\n+/);
    return { courseDescription: parts[0] || "", overview: parts.slice(1).join("\n\n") };
  }

  const before = description.slice(0, idx).trim();
  const afterObjective = description.slice(idx);
  const overviewMarker = "This course will emphasize";
  const overviewIdx = afterObjective.indexOf(overviewMarker);

  if (overviewIdx === -1) {
    return { courseDescription: description, overview: "" };
  }

  return {
    courseDescription: `${before}\n\n${afterObjective.slice(0, overviewIdx).trim()}`,
    overview: afterObjective.slice(overviewIdx).trim(),
  };
}

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
  const descriptionBlock = extractSection(raw, "Description");
  const objectives = extractSection(descriptionBlock, "Objectives", { level: 3 });
  const descriptionBody = descriptionBlock.replace(/### Objectives[\s\S]*/m, "").trim();
  const { courseDescription, overview } = splitDescription(descriptionBody);
  const fees = extractSection(raw, "Fees + Materials");

  const markdown = `# Overview

## Course Description

${courseDescription}

## Overview

${overview}

## Objectives

${objectives}

## Materials & Fees

${fees}

${gradingTable(raw)}

${gradingSystem(raw)}
`;

  return rewriteMdLinksMarkdown(markdown);
}
