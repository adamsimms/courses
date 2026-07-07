import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const coursesDir = path.join(distDir, "courses");
const courses = JSON.parse(fs.readFileSync(path.join(rootDir, "courses.json"), "utf8"));
const hugoBinDir = path.join(rootDir, "node_modules", ".bin");

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

function writeCoursesIndex() {
  const items = courses
    .map((course) => {
      const term = course.term ? `<p class="term">${course.term}</p>` : "";
      return `<li>
  <a href="/courses/${course.slug}/">
    <span class="code">${course.code}</span>
    <span class="title">${course.title}</span>
  </a>
  ${term}
  <p class="description">${course.description}</p>
</li>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Photography Courses — Adam Simms</title>
  <meta name="description" content="Open course materials for undergraduate photography courses taught by Adam Simms at Concordia University.">
  <link rel="icon" href="/courses/phot331/favicon.svg" type="image/svg+xml">
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

  fs.writeFileSync(path.join(coursesDir, "index.html"), html);
}

function writeRedirects() {
  const redirects = ["/courses /courses/ 301", "/ /courses/ 302"].join("\n");
  fs.writeFileSync(path.join(distDir, "_redirects"), `${redirects}\n`);
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
fs.mkdirSync(coursesDir, { recursive: true });

for (const course of courses) {
  const sitePath = path.join(rootDir, course.siteDir);
  if (!fs.existsSync(sitePath)) {
    throw new Error(`Missing site directory: ${course.siteDir}`);
  }

  console.log(`Building ${course.code} → /courses/${course.slug}/`);
  run("npm run build", sitePath);

  const output = path.join(sitePath, "_site");
  const destination = path.join(coursesDir, course.slug);
  fs.cpSync(output, destination, { recursive: true });
}

writeCoursesIndex();
writeRedirects();
pruneOversizedFiles(distDir);

console.log(`\nBuilt ${courses.length} course sites in ${distDir}`);
