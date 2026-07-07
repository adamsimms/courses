import { seoDescription } from "./course-seo.mjs";

export function seoMeta(slug, pageKey, extra = {}) {
  return {
    description: seoDescription(slug, pageKey),
    ...extra,
  };
}

export const sectionIndexMeta = {
  noindex: true,
  sitemap: { disable: true },
  bookHidden: true,
};

export const homeMeta = {
  noindex: true,
  sitemap: { disable: true },
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
