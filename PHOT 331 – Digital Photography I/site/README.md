# PHOT 331 static site

[Hugo Book](https://github.com/alex-shpak/hugo-book) static site generated from the course Markdown files in this folder's parent directory.

## Prerequisites

- [Hugo](https://gohugo.io/installation/) (extended edition not required)
- Node.js (for the content generator only)

## Build

```bash
cd site
npm run build
```

Output is written to `site/_site/`.

Preview locally:

```bash
npm run serve
```

Then open http://localhost:1313

## How it works

- **Content source:** `../README.md`, `../assignments.md`, `../schedule.md`, `../resources.md`
- **Generator:** `scripts/generate-content.mjs` splits and rewrites Markdown into Hugo `content/`
- **Theme:** [hugo-book](https://github.com/alex-shpak/hugo-book) (git submodule in `themes/hugo-book`)
- **Custom styles:** `assets/_custom.scss` — typography and layout overrides
- **Site structure:**
  - `/` — home (hero image only)
  - `/course/` — overview, schedule, rules, student services, appointments
  - `/assignments/` — assignment briefs

Edit the Markdown files in the parent course folder, then run `npm run build` to regenerate the site.

## Deployment

Built files in `_site/` can be copied to `syllabi.adamsimms.xyz/phot331/` when ready.

## Updating the theme

```bash
git submodule update --remote themes/hugo-book
```

## Hugo compatibility note

Hugo 0.164+ requires `assets/normalize.scss` in this project (copied from the theme's `normalize.css`) so the theme's SCSS import resolves correctly.
