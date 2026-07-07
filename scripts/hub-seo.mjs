import { SITE_ORIGIN } from "./course-seo.mjs";

export const HUB_TITLE = "Syllabi — Adam Simms";
export const HUB_HEADING = "Syllabi";
export const HUB_LEDE = "Open-source materials for undergraduate courses.";
export const HUB_DESCRIPTION =
  "Open-source syllabi and course materials for undergraduate photography courses by Adam Simms.";
export const HUB_URL = `${SITE_ORIGIN}/`;
export const HUB_OG_IMAGE_PATH = "/images/og-square.jpg";
export const HUB_OG_IMAGE = `${SITE_ORIGIN}${HUB_OG_IMAGE_PATH}`;
export const HUB_OG_IMAGE_ALT =
  "Syllabi — open undergraduate photography course materials by Adam Simms";
export const HUB_OG_IMAGE_WIDTH = 1200;
export const HUB_OG_IMAGE_HEIGHT = 1200;
export const HUB_THEME_COLOR = "#ec444a";
export const HUB_SITE_NAME = "Syllabi — Adam Simms";

export const INSTRUCTOR_NAME = "Adam Simms";
export const INSTRUCTOR_URL = "https://www.concordia.ca/faculty/adam-simms.html";
export const INSTRUCTOR_BIO =
  "Artist-in-residence, Studio Arts · Photography, New Media, and Design";
export const INSTRUCTOR_IMAGE = `${SITE_ORIGIN}/images/adam-simms.jpg`;

export function hubJsonLd(courses) {
  const instructor = {
    "@type": "Person",
    name: INSTRUCTOR_NAME,
    url: INSTRUCTOR_URL,
    image: INSTRUCTOR_IMAGE,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: HUB_SITE_NAME,
        url: HUB_URL,
        description: HUB_DESCRIPTION,
        inLanguage: "en",
        author: instructor,
      },
      {
        "@type": "CollectionPage",
        name: HUB_TITLE,
        description: HUB_DESCRIPTION,
        url: HUB_URL,
        inLanguage: "en",
        image: {
          "@type": "ImageObject",
          url: HUB_OG_IMAGE,
          width: HUB_OG_IMAGE_WIDTH,
          height: HUB_OG_IMAGE_HEIGHT,
        },
        author: instructor,
        license: "https://creativecommons.org/licenses/by/4.0/",
        isPartOf: {
          "@type": "WebSite",
          name: HUB_SITE_NAME,
          url: HUB_URL,
        },
        hasPart: courses.map((course) => ({
          "@type": "Course",
          name: `${course.code} ${course.title}`,
          description: course.description,
          url: `${SITE_ORIGIN}/${course.slug}/`,
          ...(course.tags?.length ? { keywords: course.tags.join(", ") } : {}),
          provider: {
            "@type": "CollegeOrUniversity",
            name: "Concordia University",
            url: "https://www.concordia.ca",
          },
          instructor,
        })),
      },
    ],
  };
}
