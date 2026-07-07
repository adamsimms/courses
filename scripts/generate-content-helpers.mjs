import { seoDescription } from "./course-seo.mjs";

export function seoMeta(slug, pageKey, extra = {}) {
  return {
    description: seoDescription(slug, pageKey),
    ...extra,
  };
}

export const longPageMeta = {
  bookToC: true,
};

export function sourceMeta(courseFolderName, sourceFile, anchor = null) {
  const path = anchor ? `${courseFolderName}/${sourceFile}#${anchor}` : `${courseFolderName}/${sourceFile}`;
  return { sourceFile: path };
}

export const sectionIndexMeta = {
  noindex: true,
  sitemap: { disable: true },
};

export const homeMeta = {
  sitemap: {
    priority: 0.9,
    changefreq: "monthly",
  },
  bookHidden: true,
  bookToC: false,
  bookSearchExclude: true,
};

export const appointmentsMeta = {
  noindex: true,
  sitemap: { disable: true },
  bookToC: false,
  bookSearchExclude: true,
};

export function contentSitemap(priority) {
  return {
    sitemap: {
      priority,
      changefreq: "monthly",
    },
  };
}
