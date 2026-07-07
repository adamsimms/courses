import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN } from "./course-seo.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const courses = JSON.parse(fs.readFileSync(path.join(rootDir, "courses.json"), "utf8"));

export function relatedCoursesFor(slug) {
  return courses
    .filter((course) => course.slug !== slug)
    .map((course) => ({
      code: course.code,
      title: course.title,
      url: `${SITE_ORIGIN}/${course.slug}/`,
    }));
}

export function writeRelatedCoursesData(sitePath, courseSlug) {
  const dataDir = path.join(sitePath, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "related_courses.json"),
    `${JSON.stringify(relatedCoursesFor(courseSlug), null, 2)}\n`
  );
}
