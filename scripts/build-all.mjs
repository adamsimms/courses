import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN } from "./course-seo.mjs";
import { syncHugoLayouts } from "./sync-hugo-layouts.mjs";
import {
  buildUmamiScriptTag,
  buildHeadersBlock,
  loadAnalyticsConfig,
  writeAnalyticsPartial,
} from "./analytics.mjs";
import {
  HUB_TITLE,
  HUB_HEADING,
  HUB_LEDE,
  HUB_DESCRIPTION,
  HUB_URL,
  HUB_OG_IMAGE,
  HUB_OG_IMAGE_ALT,
  HUB_OG_IMAGE_WIDTH,
  HUB_OG_IMAGE_HEIGHT,
  HUB_THEME_COLOR,
  HUB_SITE_NAME,
  INSTRUCTOR_NAME,
  INSTRUCTOR_URL,
  INSTRUCTOR_BIO,
  hubJsonLd,
} from "./hub-seo.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const hugoBinDir = path.join(rootDir, "node_modules", ".bin");
const courses = JSON.parse(fs.readFileSync(path.join(rootDir, "courses.json"), "utf8"));
const analyticsConfig = loadAnalyticsConfig(rootDir);

writeAnalyticsPartial(rootDir, analyticsConfig);
if (!analyticsConfig.umamiWebsiteId) {
  console.warn("Umami analytics skipped: set umamiWebsiteId in analytics.config.json or UMAMI_WEBSITE_ID");
}

const HUB_ASSETS_DIR = path.join(rootDir, "assets/hub");

function run(command, cwd) {
  execSync(command, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      PATH: `${hugoBinDir}${path.delimiter}${process.env.PATH ?? ""}`,
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTags(tags) {
  if (!tags?.length) return "";
  const chips = tags
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");
  return `<span class="tags">${chips}</span>`;
}

function writeHubAssets() {
  const imagesDir = path.join(distDir, "images");
  fs.mkdirSync(imagesDir, { recursive: true });

  for (const entry of fs.readdirSync(HUB_ASSETS_DIR, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const sourcePath = path.join(HUB_ASSETS_DIR, entry.name);
    if (entry.name === "favicon.svg") {
      fs.copyFileSync(sourcePath, path.join(distDir, "favicon.svg"));
      continue;
    }
    fs.copyFileSync(sourcePath, path.join(imagesDir, entry.name));
  }
}

function writeCoursesIndex() {
  const items = courses
    .map(
      (course) => `<li>
  <a class="course-card" href="/${course.slug}/">
    <img
      class="course-thumb"
      src="/${course.slug}/images/og-square.jpg"
      alt=""
      width="120"
      height="120"
      loading="lazy"
      decoding="async"
    >
    <span class="course-text">
      <span class="code">${escapeHtml(course.code)}</span>
      <span class="title">${escapeHtml(course.title)}</span>
      <span class="description">${escapeHtml(course.description)}</span>
      ${renderTags(course.tags)}
    </span>
  </a>
</li>`
    )
    .join("\n");

  const jsonLd = hubJsonLd(courses);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(HUB_TITLE)}</title>
  <meta name="description" content="${escapeHtml(HUB_DESCRIPTION)}">
  <meta name="author" content="${escapeHtml(INSTRUCTOR_NAME)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="${HUB_THEME_COLOR}">
  <meta name="color-scheme" content="light">
  <link rel="canonical" href="${HUB_URL}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/images/og-square.jpg">
  <meta property="og:title" content="${escapeHtml(HUB_TITLE)}">
  <meta property="og:description" content="${escapeHtml(HUB_DESCRIPTION)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${HUB_URL}">
  <meta property="og:site_name" content="${escapeHtml(HUB_SITE_NAME)}">
  <meta property="og:locale" content="en">
  <meta property="og:image" content="${HUB_OG_IMAGE}">
  <meta property="og:image:width" content="${HUB_OG_IMAGE_WIDTH}">
  <meta property="og:image:height" content="${HUB_OG_IMAGE_HEIGHT}">
  <meta property="og:image:alt" content="${escapeHtml(HUB_OG_IMAGE_ALT)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(HUB_TITLE)}">
  <meta name="twitter:description" content="${escapeHtml(HUB_DESCRIPTION)}">
  <meta name="twitter:image" content="${HUB_OG_IMAGE}">
  <meta name="twitter:image:alt" content="${escapeHtml(HUB_OG_IMAGE_ALT)}">
  ${buildUmamiScriptTag(analyticsConfig)}
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>
  <style>
    :root {
      --text: rgba(0, 0, 0, 0.75);
      --muted: rgba(0, 0, 0, 0.5);
      --border: rgba(0, 0, 0, 0.12);
      --accent: #ec444a;
      --link-underline: rgba(0, 0, 0, 0.6);
      --max-width: 56rem;
      --sidebar-width: 10.5rem;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 3rem 1.5rem 4rem;
      font: 17px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background: #fff;
    }

    main {
      max-width: var(--max-width);
      margin: 0 auto;
      display: grid;
      grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
      gap: 2.5rem 3rem;
      align-items: start;
    }

    .sidebar {
      position: sticky;
      top: 2rem;
    }

    .content {
      min-width: 0;
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .lede {
      margin: 0 0 2rem;
      color: var(--muted);
    }

    .instructor {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      color: inherit;
      border-bottom: none;
    }

    .instructor:hover,
    .instructor:focus-visible {
      color: inherit;
      border-bottom-color: transparent;
    }

    .instructor:hover .instructor-name,
    .instructor:focus-visible .instructor-name {
      color: var(--accent);
    }

    .instructor-photo {
      display: block;
      width: 5rem;
      height: 5rem;
      object-fit: cover;
      border-radius: 50%;
    }

    .instructor-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .instructor-name {
      font-weight: 500;
      line-height: 1.3;
      transition: color 0.15s ease;
    }

    .instructor-bio {
      color: var(--muted);
      font-size: 0.85rem;
      line-height: 1.45;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      border-top: 1px solid var(--border);
    }

    a {
      color: var(--text);
      text-decoration: none;
      border-bottom: 1px solid var(--link-underline);
      transition: color 0.15s ease, border-bottom-color 0.15s ease;
    }

    a:hover,
    a:focus-visible {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    .course-card {
      display: grid;
      grid-template-columns: 7.5rem minmax(0, 1fr);
      gap: 1.35rem;
      align-items: start;
      padding: 1.35rem 0;
      color: inherit;
      border-bottom: none;
    }

    .course-card:hover,
    .course-card:focus-visible {
      color: inherit;
      border-bottom-color: transparent;
    }

    .course-card:hover .title,
    .course-card:focus-visible .title {
      color: var(--accent);
    }

    .course-thumb {
      display: block;
      width: 7.5rem;
      height: 7.5rem;
      object-fit: cover;
    }

    .course-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .code {
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.15rem;
    }

    .title {
      font-size: 1.15rem;
      font-weight: 500;
      line-height: 1.35;
      transition: color 0.15s ease;
    }

    .description {
      margin: 0.5rem 0 0;
      color: var(--muted);
      font-size: 0.95rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.75rem;
    }

    .tag {
      font-size: 0.72rem;
      letter-spacing: 0.02em;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 0.12rem 0.45rem;
      line-height: 1.35;
    }

    footer {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 0.9rem;
    }

    footer a {
      color: var(--muted);
    }

    @media (max-width: 720px) {
      main {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .sidebar {
        position: static;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border);
      }

      .instructor {
        flex-direction: row;
        align-items: center;
      }

      .instructor-bio {
        font-size: 0.9rem;
      }
    }
  </style>
</head>
<body>
  <main>
    <aside class="sidebar">
      <a class="instructor" href="${INSTRUCTOR_URL}">
        <img
          class="instructor-photo"
          src="/images/adam-simms.jpg"
          alt="${escapeHtml(INSTRUCTOR_NAME)}"
          width="80"
          height="80"
          loading="lazy"
          decoding="async"
        >
        <span class="instructor-text">
          <span class="instructor-name">${escapeHtml(INSTRUCTOR_NAME)}</span>
          <span class="instructor-bio">${escapeHtml(INSTRUCTOR_BIO)}</span>
        </span>
      </a>
    </aside>
    <div class="content">
      <h1>${escapeHtml(HUB_HEADING)}</h1>
      <p class="lede">${escapeHtml(HUB_LEDE)}</p>
      <ul>
${items}
      </ul>
      <footer>
        <a href="https://github.com/adamsimms/syllabi">Source on GitHub</a> ·
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
      </footer>
    </div>
  </main>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, "index.html"), html);
}

function writeHeaders() {
  fs.writeFileSync(path.join(distDir, "_headers"), buildHeadersBlock());
}

function writeRedirects() {
  const rules = courses.flatMap((course) => [
    `/${course.slug}/ /${course.slug}/index.html 200`,
    `/${course.slug} /${course.slug}/index.html 200`,
  ]);

  fs.writeFileSync(path.join(distDir, "_redirects"), `${rules.join("\n")}\n`);
}

function writeRobotsTxt() {
  const body = `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, "robots.txt"), body);
}

function writeSitemapIndex() {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    `<sitemap><loc>${SITE_ORIGIN}/hub-sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`,
    ...courses.map(
      (course) =>
        `<sitemap><loc>${SITE_ORIGIN}/${course.slug}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`
    ),
  ];

  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>
`;
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), index);

  const hubUrls = [
    `<url><loc>${HUB_URL}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
    ...courses.map(
      (course) =>
        `<url><loc>${SITE_ORIGIN}/${course.slug}/</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>`
    ),
  ];

  const hubSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${hubUrls.join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, "hub-sitemap.xml"), hubSitemap);
}

function pruneOversizedFiles(dir, maxBytes = 24 * 1024 * 1024) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pruneOversizedFiles(entryPath, maxBytes);
      continue;
    }

    if (fs.statSync(entryPath).size > maxBytes) {
      console.warn(`Removing ${path.relative(distDir, entryPath)} from deploy output (>24 MiB)`);
      fs.rmSync(entryPath);
    }
  }
}

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

for (const course of courses) {
  const sitePath = path.join(rootDir, course.siteDir);
  if (!fs.existsSync(sitePath)) {
    throw new Error(`Missing site directory: ${course.siteDir}`);
  }

  syncHugoLayouts(sitePath);

  console.log(`Building ${course.code} → /${course.slug}/`);
  run("npm run build", sitePath);

  const output = path.join(sitePath, "_site");
  const destination = path.join(distDir, course.slug);
  fs.cpSync(output, destination, { recursive: true });
}

writeHubAssets();
writeCoursesIndex();
writeRedirects();
writeHeaders();
writeRobotsTxt();
writeSitemapIndex();
pruneOversizedFiles(distDir);

console.log(`\nBuilt ${courses.length} course sites in ${distDir}`);
