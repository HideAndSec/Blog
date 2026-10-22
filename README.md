# HideAndSec

A static [Astro](https://astro.build) site that replaces hideandsec.sh's old BookStack (v21.08). It is deployed on GitHub Pages.

It keeps BookStack's interface as is: its CSS and JavaScript (MIT licence, in `public/dist/`), its views ported to Astro components, and the site's custom dark theme. Everything that needed a server is either redone in the browser or removed:

| BookStack | Here |
| --- | --- |
| Search (`/search`, search within a book) | Same syntax and ranking, in JS over an index generated at build time (`/search/index.json`) |
| Sorting, list/grid view, home page "details" | Preferences kept in the browser's `localStorage` |
| Shelf context in the breadcrumb | `localStorage` (2 h, like the BookStack session) |
| HTML / plain text / Markdown exports | Files generated at build time. The HTML export embeds images on download. |
| PDF export, login, editing, comments | Removed |

There is no server and no database: `dist/` is a folder of static files.

## Development

```sh
bun install
bun run dev      # http://localhost:4321
bun run build    # output in dist/
bun run preview  # serves dist/ on http://localhost:4321
```

Open the site with `bun run preview` (or any HTTP server serving `dist/` at the root), not by opening `dist/index.html` directly: paths are absolute (`/uploads/…`, `/dist/…`).

### Checking

Run `bun run preview`, then `bun run check:site`. The script crawls every page with Playwright and reports broken images, failed requests and console errors. The first time, install Chromium with `bunx playwright install chromium`.

## Publishing an article

Drop a `.md` file in the `page/` folder of the book, for example `src/content/books/web-03c/page/waf-bypass.md`:

```md
# WAF bypass

The content, in plain Markdown (tables, task lists, code blocks…).

![Diagram](images/diagram.png)

See also [Cache Poisoning](cache-poisoning.md).
```

That's it. No frontmatter is needed:

- **Title**: the file's first `# Title` (removed from the body), otherwise the file name.
- **URL**: the file name → `/books/web-03c/page/waf-bypass/`.
- **Dates and author**: taken from the git history (the file's first and last commits). The author is matched by git name, nickname or GitHub login; an unknown author becomes a new user of the site.
- **Order in the book**: after the existing pages, by creation date.
- **Images and files**: put them next to the page (here `page/images/diagram.png`) and link them with a relative path. A link to another `.md` points to that page.

The home page, recent activity, search, the author's profile and the exports are updated automatically.

To set a value yourself, add a frontmatter. Every field is optional:

```md
---
title: "WAF bypass"
author: "mxrch"        # displayed nickname, if the git name isn't the right one
chapter: "attacks"     # slug of a chapter of the book (src/content/books/<book>/chapter/)
priority: 5            # position in the book
tags: [{ name: "web" }]
---
```

### From GitHub, without installing anything

1. Open the `src/content/books/<book>/page/` folder on GitHub, then **Add file → Upload files**.
2. Drop the `.md` (and its images), then commit.
3. Without write access, GitHub opens a pull request: the site is built there as a check, then published once merged. With write access, the commit on `main` publishes directly (about 1 min).

## Content

- Pages: `src/content/books/<book>/page/<page>.md`. The frontmatter keeps the BookStack metadata (id, authors, dates, tags, order).
  - Pages written with the Markdown editor (`editor: "markdown"`): the body is the original Markdown. It is rendered the way BookStack did, `bkmrk-…` anchors included.
  - Pages written with the WYSIWYG editor (`editor: "wysiwyg"`): the body is the original HTML, shown as is.
- Books, chapters and shelves: `src/content/books/<book>/index.md`, `…/chapter/<chapter>.md`, `src/content/shelves/`.
- Users and recent activity: `src/data/`.
- Images and files: `public/uploads/`.
- Custom theme (BookStack's "custom head"): `src/custom-head.html`.

Imported pages keep their BookStack history in the frontmatter, so the commit that adds them doesn't count as an edit; only later commits update their date.

To create a book: a `src/content/books/<slug>/` folder with an `index.md` (`title`, `slug`, `createdAt`, `updatedAt`, `description`). To show it on a shelf, add its slug to `books:` in the shelf's file in `src/content/shelves/`.
