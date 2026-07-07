import { seoDescription } from "./course-seo.mjs";
import { siteUrl } from "./site-path.mjs";

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

export function overviewUtilsBanner(hugoSiteDir) {
  const printUrl = siteUrl(hugoSiteDir, "/course/print/");
  const textUrl = siteUrl(hugoSiteDir, "/course/overview/index.txt");
  return `<p class="page-utils"><a href="${printUrl}">Print syllabus</a> · <a href="${textUrl}">Plain text</a></p>\n\n`;
}

export const sectionIndexMeta = {
  noindex: true,
  sitemap: { disable: true },
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
