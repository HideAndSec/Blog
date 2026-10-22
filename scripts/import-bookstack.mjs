#!/usr/bin/env bun
// One-shot import of a BookStack dump (see scripts/export-bookstack.php).
//
//   bun scripts/import-bookstack.mjs <dump.json> [private-output-dir]
//
// Writes shelves, books, chapters and pages to src/content, users and the
// activity log to src/data, and downloads every referenced upload into
// public/uploads. Content hidden from BookStack's guest role is skipped, except
// pages, which go to the private output dir (default ../hideandsec-private).
//
// Pages written with the Markdown editor keep their Markdown. Pages written with
// the WYSIWYG editor keep their HTML as the Markdown body: converting it would
// lose alignment, colours, image sizes and table styling.

import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://hideandsec.sh';
const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');
const DATA = path.join(ROOT, 'src/data');
const PUBLIC = path.join(ROOT, 'public');

const [dumpPath, privateArg] = process.argv.slice(2);
if (!dumpPath) {
	console.error('usage: import-bookstack.mjs <dump.json> [private-output-dir]');
	process.exit(1);
}
const PRIVATE = path.resolve(privateArg ?? path.join(ROOT, '../hideandsec-private'));
const dump = JSON.parse(await fs.readFile(dumpPath, 'utf8'));

const isPublic = (e) => String(e.public) === '1';
const byId = (list) => new Map(list.map((e) => [String(e.id), e]));
const users = byId(dump.users);
const books = byId(dump.books);
const chapters = byId(dump.chapters);

// --- Uploads -----------------------------------------------------------------------

const downloads = new Map(); // URL path -> destination root

function useUpload(urlPath, root = PUBLIC) {
	if (!downloads.has(urlPath) || root === PUBLIC) downloads.set(urlPath, root);
	return urlPath;
}

// BookStack serves resized copies from a sibling "thumbs-WxH" directory.
function thumb(url, w, h) {
	if (!url) return null;
	const p = new URL(url, ORIGIN).pathname;
	return useUpload(path.posix.join(path.posix.dirname(p), `thumbs-${w}-${h}`, path.posix.basename(p)));
}

function localiseUrls(text, root) {
	return text
		.replace(/(?<![\w.\/-])(?:https?:\/\/hideandsec\.sh)?(\/uploads\/[^\s"'()<>\]]+)/g, (_, p) => useUpload(p, root))
		.replace(/https?:\/\/hideandsec\.sh(\/(?:books|shelves|link|user|search)\b)/g, '$1');
}

// --- Frontmatter -----------------------------------------------------------------------

const userSlug = (id) => users.get(String(id))?.slug ?? null;
const iso = (date) => date.replace(' ', 'T') + 'Z';

function tagsOf(type, id) {
	return dump.tags
		.filter((t) => t.entity_type === `BookStack\\${type}` && String(t.entity_id) === String(id))
		.map((t) => (t.value ? { name: t.name, value: t.value } : { name: t.name }));
}

function frontmatter(fields) {
	const lines = ['---'];
	for (const [key, value] of Object.entries(fields)) {
		if (value === null || value === undefined || (Array.isArray(value) && !value.length)) continue;
		lines.push(`${key}: ${JSON.stringify(value)}`); // JSON is valid YAML
	}
	lines.push('---', '');
	return lines.join('\n');
}

const entityMeta = (e, type) => ({
	id: Number(e.id),
	createdAt: iso(e.created_at),
	createdBy: userSlug(e.created_by),
	updatedAt: iso(e.updated_at),
	updatedBy: userSlug(e.updated_by),
	ownedBy: userSlug(e.owned_by),
	restricted: e.restricted === '1' || undefined,
	tags: tagsOf(type, e.id),
	views: Number(e.views),
});

async function write(file, content) {
	await fs.mkdir(path.dirname(file), { recursive: true });
	await fs.writeFile(file, content);
}

// --- Page bodies -------------------------------------------------------------------------

// Raw HTML in Markdown ends at the first blank line, so blank lines must go.
// Inside <pre> they are significant: encode the line break instead.
function pageBody(p, root) {
	// Pages written in the WYSIWYG editor keep their HTML as is (HTML is valid Markdown).
	const body = p.markdown?.trim() ? p.markdown : p.html;
	return localiseUrls(body, root).trim() + '\n';
}

// --- Write content ---------------------------------------------------------------------

const published = { book: new Set(), chapter: new Set(), page: new Set(), bookshelf: new Set() };

for (const b of books.values()) {
	if (!isPublic(b)) continue;
	published.book.add(b.id);
	await write(
		path.join(CONTENT, 'books', b.slug, 'index.md'),
		frontmatter({
			title: b.name,
			slug: b.slug,
			description: b.description || undefined,
			cover: b.cover ? useUpload(new URL(b.cover).pathname) : undefined,
			...entityMeta(b, 'Book'),
		}),
	);
	if (b.cover) thumb(b.cover, 440, 250);
}

for (const c of chapters.values()) {
	if (!isPublic(c) || !published.book.has(c.book_id)) continue;
	published.chapter.add(c.id);
	await write(
		path.join(CONTENT, 'books', books.get(c.book_id).slug, 'chapter', `${c.slug}.md`),
		frontmatter({
			title: c.name,
			slug: c.slug,
			description: c.description || undefined,
			priority: Number(c.priority),
			...entityMeta(c, 'Chapter'),
		}),
	);
}

let privateCount = 0;
for (const p of dump.pages) {
	const book = books.get(p.book_id);
	const chapter = chapters.get(p.chapter_id);
	const fields = {
		title: p.name,
		slug: p.slug,
		chapter: chapter && published.chapter.has(chapter.id) ? chapter.slug : undefined,
		priority: Number(p.priority),
		editor: p.markdown?.trim() ? 'markdown' : 'wysiwyg',
		revisionCount: Number(p.revision_count),
		...entityMeta(p, 'Page'),
	};
	if (isPublic(p) && published.book.has(book.id)) {
		published.page.add(p.id);
		await write(path.join(CONTENT, 'books', book.slug, 'page', `${p.slug}.md`), frontmatter(fields) + pageBody(p, PUBLIC));
	} else {
		privateCount++;
		const dir = path.join(PRIVATE, book.slug, chapter ? chapter.slug : '');
		await write(path.join(dir, `${p.slug}.md`), frontmatter(fields) + pageBody(p, PRIVATE));
	}
}

for (const s of dump.shelves) {
	if (!isPublic(s)) continue;
	published.bookshelf.add(s.id);
	await write(
		path.join(CONTENT, 'shelves', `${s.slug}.md`),
		frontmatter({
			title: s.name,
			slug: s.slug,
			description: s.description || undefined,
			cover: s.cover ? useUpload(new URL(s.cover).pathname) : undefined,
			books: (s.book_ids ?? '').split(',').filter((id) => published.book.has(id)).map((id) => books.get(id).slug),
			...entityMeta(s, 'Bookshelf'),
		}),
	);
	if (s.cover) thumb(s.cover, 440, 250);
}

// --- Users and activity ------------------------------------------------------------------

await write(
	path.join(DATA, 'users.json'),
	JSON.stringify(
		dump.users.map((u) => ({
			slug: u.slug,
			name: u.name,
			createdAt: iso(u.created_at),
			avatar: u.avatar ? { small: thumb(u.avatar, 30, 30), large: thumb(u.avatar, 120, 120) } : null,
		})),
		null,
		'\t',
	) + '\n',
);

// BookStack only lists activity on entities the viewer can currently see. Entities in the
// recycle bin are not in the dump but still listed, without a link ("deleted page").
const ENTITY_TYPES = { 'BookStack\\Bookshelf': 'bookshelf', 'BookStack\\Book': 'book', 'BookStack\\Chapter': 'chapter', 'BookStack\\Page': 'page' };
const dumped = {
	bookshelf: new Set(dump.shelves.map((e) => String(e.id))),
	book: new Set(dump.books.map((e) => String(e.id))),
	chapter: new Set(dump.chapters.map((e) => String(e.id))),
	page: new Set(dump.pages.map((e) => String(e.id))),
};
const activity = dump.activities
	.filter((a) => {
		const type = ENTITY_TYPES[a.entity_type];
		const id = String(a.entity_id);
		return type && (published[type].has(id) || !dumped[type].has(id));
	})
	.map((a) => ({
		type: a.type,
		user: userSlug(a.user_id),
		entityType: ENTITY_TYPES[a.entity_type],
		entityId: Number(a.entity_id),
		createdAt: iso(a.created_at),
	}));
await write(path.join(DATA, 'activity.json'), JSON.stringify(activity, null, '\t') + '\n');

// --- Downloads -------------------------------------------------------------------------------

for (const asset of ['/book_default_cover.png', '/user_avatar.png', '/favicon.ico']) useUpload(asset);
useUpload('/uploads/images/system/2022-09/z4KDmyBtUP2wlHeh-logo-banner-try.png');

const failed = [];
const queue = [...downloads];
await Promise.all(
	Array.from({ length: 8 }, async () => {
		for (let job; (job = queue.shift()); ) {
			const [urlPath, root] = job;
			const res = await fetch(ORIGIN + urlPath);
			if (!res.ok) {
				failed.push(`${res.status} ${urlPath}`);
				continue;
			}
			await write(path.join(root, decodeURIComponent(urlPath)), Buffer.from(await res.arrayBuffer()));
		}
	}),
);

console.log(
	`shelves ${published.bookshelf.size}, books ${published.book.size}, chapters ${published.chapter.size}, ` +
		`pages ${published.page.size} (+${privateCount} private), activity ${activity.length}, ` +
		`files ${downloads.size - failed.length}/${downloads.size}`,
);
if (failed.length) console.log('failed downloads:\n' + failed.join('\n'));
