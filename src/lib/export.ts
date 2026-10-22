// ExportFormatter: the HTML, plain text and Markdown downloads of pages, chapters and books.
// Images in the HTML exports point to the site; public/js/hideandsec.js embeds them as
// base64 when the file is downloaded from the export menu, as containHtml() did.
import exportStyles from '../export-styles.css?raw';
import exportCustomHead from '../export-custom-head.html?raw';
import type { Book, Chapter, Page } from './bookstack';
import { decodeEntities } from './bookstack';
import { htmlToMarkdown } from './html-to-markdown';
import { icon } from './icons';

const SITE = 'https://hideandsec.sh';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const esc = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

/** formatLocalized('%e %B %Y %H:%M:%S') */
function localized(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${String(date.getUTCDate()).padStart(2, ' ')} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

/** The site's own links and images, absolute as BookStack stored them. */
const siteUrls = (text: string) => text.replace(/(?<![\w./-])\/(?=(?:uploads|books|shelves)\/)/g, `${SITE}/`);

const PHP_TRIM = /^[ \t\n\r\0\x0B]+|[ \t\n\r\0\x0B]+$/g;
const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, '');

/** Laravel's url() helper. */
function url(path: string): string {
	if (/^(#|\/\/|https?:\/\/|(mailto|tel|sms):)/.test(path) || /^[a-z][a-z0-9+.-]*:\/\/[^\s/]/i.test(path)) return path;
	const query = path.indexOf('?');
	const [route, tail] = query === -1 ? [path, ''] : [path.slice(0, query), path.slice(query)];
	return trimSlashes(`${SITE}/${trimSlashes(route + '/')}`) + tail;
}

/**
 * containHtml(), for links: those not starting with "http" go through url(). Images are
 * embedded by public/js/hideandsec.js when the file is downloaded.
 */
function containLinks(html: string): string {
	for (const [link, , src] of html.matchAll(/<a.*href=('|")(.*?)('|").*?>/gi)) {
		if (src === '' || src.replace(PHP_TRIM, '').startsWith('http')) continue;
		html = html.replaceAll(link, link.replaceAll(src, url(src)));
	}
	return html;
}

// The custom head as exports carry it: HtmlContentFilter::removeScripts() of the site setting.
const exportHead = exportCustomHead.replace(/\n$/, '');

// The Blade views below, as rendered: a line holding only a directive keeps its indent
// and loses its line break, and included views end without one.

/** layouts/export.blade.php */
const layout = (title: string, content: string) =>
	containLinks(`<!doctype html>
<html lang="en-GB">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>${esc(title)}</title>

    <style>
            ${exportStyles.replace(/\n$/, '')}

    </style>

    <!-- Custom user content -->
${exportHead}
<!-- End custom user content -->
</head>
<body>
<div class="page-content">
    ${siteUrls(content)}</div>
</body>
</html>`);

/** entities/export-meta.blade.php */
function exportMeta(page: Page): string {
	const created = page.createdBy ? `Created ${localized(page.createdAt)} by ${esc(page.createdBy.name)}` : `Created ${localized(page.createdAt)}`;
	const updated = page.updatedBy ? `Updated ${localized(page.updatedAt)} by ${esc(page.updatedBy.name)}` : `Updated ${localized(page.updatedAt)}`;
	return `<div class="entity-meta">
            ${icon('history')}Revision #${page.revisionCount} <br>
    
    ${icon('star')}${created}
    <br>

    ${icon('edit')}${updated}
</div>`;
}

/** pages/parts/page-display.blade.php */
const pageDisplay = (page: Page) => `<div dir="auto">

    <h1 class="break-text" id="bkmrk-page-title">${esc(page.name)}</h1>

    <div style="clear:left;"></div>

            ${page.html}
    </div>`;

/** pages/export.blade.php */
export const pageToContainedHtml = (page: Page) =>
	layout(
		page.name,
		`    ${pageDisplay(page)}
    <hr>

    <div class="text-muted text-small">
        ${exportMeta(page)}    </div>
`,
	);

/** chapters/export.blade.php */
export function chapterToContainedHtml(chapter: Chapter): string {
	let out = `    <h1 style="font-size: 4.8em">${esc(chapter.name)}</h1>\n\n    <p>${esc(chapter.description)}</p>\n\n    `;
	if (chapter.pages.length) {
		out += '        <ul class="contents">\n            ';
		for (const p of chapter.pages) out += `                <li><a href="#page-${p.id}">${esc(p.name)}</a></li>\n            `;
		out += '        </ul>\n    ';
	}
	out += '\n    ';
	for (const p of chapter.pages) out += `        <div class="page-break"></div>\n        <h1 id="page-${p.id}">${esc(p.name)}</h1>\n        ${p.html}\n    `;
	return layout(chapter.name, out);
}

/** books/export.blade.php */
export function bookToContainedHtml(book: Book): string {
	let out = `    <h1 style="font-size: 4.8em">${esc(book.name)}</h1>\n\n    <p>${esc(book.description)}</p>\n\n    `;
	if (book.tree.length) {
		out += '        <ul class="contents">\n            ';
		for (const child of book.tree) {
			out += `                <li><a href="#${child.type}-${child.id}">${esc(child.name)}</a></li>\n                `;
			if (child.type === 'chapter' && child.pages.length) {
				out += '                    <ul>\n                        ';
				for (const p of child.pages) out += `                            <li><a href="#page-${p.id}">${esc(p.name)}</a></li>\n                        `;
				out += '                    </ul>\n                ';
			}
			out += '            ';
		}
		out += '        </ul>\n    ';
	}
	out += '\n    ';
	for (const child of book.tree) {
		out += `        <div class="page-break"></div>\n        <h1 id="${child.type}-${child.id}">${esc(child.name)}</h1>\n\n        `;
		if (child.type === 'chapter') {
			out += `            <p>${esc(child.description)}</p>\n\n            `;
			if (child.pages.length) {
				out += '                ';
				for (const p of child.pages) {
					out += `                    <div class="page-break"></div>\n                    <div class="chapter-hint">${esc(child.name)}</div>\n                    <h1 id="page-${p.id}">${esc(p.name)}</h1>\n                    ${p.html}\n                `;
				}
				out += '            ';
			}
			out += '\n        ';
		} else {
			out += `            ${child.html}\n        `;
		}
		out += '\n    ';
	}
	return layout(book.name, out);
}

// --- Plain text ---------------------------------------------------------------------------

export function pageToPlainText(page: Page): string {
	let text = page.html.replace(/<[^>]*>/g, '');
	text = text.replace(/ {2,}/g, ' ');
	text = text.replace(/(\n| |\r){2,}/g, '\n\n');
	return `${page.name}\n\n${decodeEntities(text)}`;
}

export const chapterToPlainText = (chapter: Chapter) =>
	`${chapter.name}\n\n${chapter.description}\n\n${chapter.pages.map(pageToPlainText).join('')}`;

// Books load their pages without HTML (Page::$listAttributes): lone pages are only named.
export const bookToPlainText = (book: Book) =>
	`${book.name}\n\n${book.tree.map((c) => (c.type === 'chapter' ? chapterToPlainText(c) : `${c.name}\n\n`)).join('')}`;

// --- Markdown -------------------------------------------------------------------------------

// The page's Markdown when it has some. Books load their pages without it (Page::$contentAttributes)
// so their lone pages are always converted from HTML; chapters load theirs in full.
export function pageToMarkdown(page: Page, withSource = true): string {
	const body = withSource && page.editor === 'markdown' ? page.markdown : htmlToMarkdown(page.html);
	return `# ${page.name}\n\n${siteUrls(body)}`;
}

// BookStack v21.08 exports every page of the chapter here, drafts and restricted ones
// included; only the visible pages are published.
export const chapterToMarkdown = (chapter: Chapter) =>
	`# ${chapter.name}\n\n${chapter.description}\n\n${chapter.pages.map((p) => pageToMarkdown(p) + '\n\n').join('')}`;

export const bookToMarkdown = (book: Book) =>
	`# ${book.name}\n\n${book.tree.map((c) => (c.type === 'chapter' ? chapterToMarkdown(c) : pageToMarkdown(c, false))).join('')}`;

export function exportsOf(entity: Book | Chapter | Page) {
	switch (entity.type) {
		case 'book':
			return { html: () => bookToContainedHtml(entity), txt: () => bookToPlainText(entity), md: () => bookToMarkdown(entity) };
		case 'chapter':
			return { html: () => chapterToContainedHtml(entity), txt: () => chapterToPlainText(entity), md: () => chapterToMarkdown(entity) };
		case 'page':
			return { html: () => pageToContainedHtml(entity), txt: () => pageToPlainText(entity), md: () => pageToMarkdown(entity) };
	}
}

const TYPES = { html: 'text/html', txt: 'text/plain', md: 'text/markdown' } as const;

/** getStaticPaths() + GET for the export route of one entity type. */
export function exportRoute<T extends Book | Chapter | Page>(list: () => Promise<T[]>, params: (entity: T) => Record<string, string>) {
	return {
		async getStaticPaths() {
			return (await list()).flatMap((entity) =>
				(['html', 'txt', 'md'] as const).map((ext) => ({
					params: { ...params(entity), file: `${entity.slug}.${ext}` },
					props: { entity, ext },
				})),
			);
		},
		GET({ props }: { props: { entity: T; ext: keyof typeof TYPES } }) {
			const body = exportsOf(props.entity)[props.ext]();
			return new Response(body, { headers: { 'Content-Type': `${TYPES[props.ext]}; charset=utf-8` } });
		},
	};
}

