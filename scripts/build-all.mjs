import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN } from "./course-seo.mjs";
import { syncHugoLayouts } from "./sync-hugo-layouts.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const hugoBinDir = path.join(rootDir, "node_modules", ".bin");
const courses = JSON.parse(fs.readFileSync(path.join(rootDir, "courses.json"), "utf8"));

const HUB_TITLE = "Photography Courses — Adam Simms";
const HUB_DESCRIPTION =
  "Open course materials for undergraduate photography courses taught by Adam Simms at Concordia University.";
const HUB_URL = `${SITE_ORIGIN}/`;
const HUB_IMAGE = `${SITE_ORIGIN}/phot331/images/og-square.jpg`;

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

function writeCoursesIndex() {
  const items = courses
    .map((course) => {
      const term = course.term ? `<p class="term">${escapeHtml(course.term)}</p>` : "";
      return `<li>
  <a href="/${course.slug}/">
    <span class="code">${escapeHtml(course.code)}</span>
    <span class="title">${escapeHtml(course.title)}</span>
  </a>
  ${term}
  <p class="description">${escapeHtml(course.description)}</p>
</li>`;
    })
    .join("\n");

  const courseListJson = courses.map((course) => ({
    "@type": "Course",
    name: `${course.code} ${course.title}`,
    description: course.description,
    url: `${SITE_ORIGIN}/${course.slug}/`,
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Concordia University",
      url: "https://www.concordia.ca",
    },
    instructor: {
      "@type": "Person",
      name: "Adam Simms",
      url: "https://www.concordia.ca/faculty/adam-simms.html",
    },
  }));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(HUB_TITLE)}</title>
  <meta name="description" content="${escapeHtml(HUB_DESCRIPTION)}">
  <link rel="canonical" href="${HUB_URL}">
  <meta property="og:title" content="${escapeHtml(HUB_TITLE)}">
  <meta property="og:description" content="${escapeHtml(HUB_DESCRIPTION)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${HUB_URL}">
  <meta property="og:site_name" content="Photography Courses — Adam Simms">
  <meta property="og:locale" content="en">
  <meta property="og:image" content="${HUB_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="1200">
  <meta property="og:image:alt" content="Photography course materials by Adam Simms">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(HUB_TITLE)}">
  <meta name="twitter:description" content="${escapeHtml(HUB_DESCRIPTION)}">
  <meta name="twitter:image" content="${HUB_IMAGE}">
  <link rel="icon" href="/phot331/favicon.svg" type="image/svg+xml">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": ${JSON.stringify(HUB_TITLE)},
        "description": ${JSON.stringify(HUB_DESCRIPTION)},
        "url": ${JSON.stringify(HUB_URL)},
        "inLanguage": "en",
        "author": {
          "@type": "Person",
          "name": "Adam Simms",
          "url": "https://www.concordia.ca/faculty/adam-simms.html"
        },
        "hasPart": ${JSON.stringify(courseListJson)}
      }
    ]
  }
  </script>
  <style>
    :root {
      --text: rgba(0, 0, 0, 0.75);
      --muted: rgba(0, 0, 0, 0.5);
      --border: rgba(0, 0, 0, 0.12);
      --accent: #ec444a;
      --link-underline: rgba(0, 0, 0, 0.6);
      --max-width: 42rem;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 3rem 1.5rem 4rem;
      font: 17px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background: #fff;
    }

    main { max-width: var(--max-width); margin: 0 auto; }

    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .lede {
      margin: 0 0 2.5rem;
      color: var(--muted);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      padding: 1.25rem 0;
      border-top: 1px solid var(--border);
    }

    li:last-child { border-bottom: 1px solid var(--border); }

    a {
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid var(--link-underline);
    }

    a:hover { border-bottom-color: var(--accent); }

    .code {
      display: block;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.15rem;
    }

    .title {
      display: block;
      font-size: 1.15rem;
      font-weight: 500;
    }

    .term, .description {
      margin: 0.5rem 0 0;
      color: var(--muted);
      font-size: 0.95rem;
    }

    footer {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <main>
    <h1>Photography Courses</h1>
    <p class="lede">Open course materials for undergraduate photography courses taught by <a href="https://www.concordia.ca/faculty/adam-simms.html">Adam Simms</a> at <a href="https://www.concordia.ca">Concordia University</a>.</p>
    <ul>
${items}
    </ul>
    <footer>
      <a href="https://github.com/adamsimms/syllabi">Source on GitHub</a> ·
      <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
    </footer>
  </main>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, "index.html"), html);
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

writeCoursesIndex();
writeRobotsTxt();
writeSitemapIndex();
pruneOversizedFiles(distDir);

console.log(`\nBuilt ${courses.length} course sites in ${distDir}`);
