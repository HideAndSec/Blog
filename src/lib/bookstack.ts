// The content model: shelves, books, chapters and pages loaded from the content
// collections and linked together, with the listing rules BookStack uses
// (ordering, excerpts, activity, popularity, siblings).

import { existsSync, statSync } from 'node:fs';
import { getCollection, type CollectionEntry } from 'astro:content';
import usersData from '../data/users.json';
import activityData from '../data/activity.json';
import { fileHistory, type Commit } from './git';
import { renderPage } from './render';

export type EntityType = 'bookshelf' | 'book' | 'chapter' | 'page';

export interface Tag {
	name: string;
	value?: string;
}

export interface User {
	slug: string;
	name: string;
	url: string;
	createdAt: Date;
	avatar: { small: string; large: string } | null;
}

interface EntityBase {
	id: number;
	name: string;
	slug: string;
	url: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: User;
	updatedBy?: User;
	ownedBy?: User;
	restricted: boolean;
	tags: Tag[];
	views: number;
	/** Plain text used for excerpts and search, as BookStack's getText(). */
	text: string;
}

export interface Shelf extends EntityBase {
	type: 'bookshelf';
	description: string;
	cover?: string;
	books: Book[];
}

export interface Book extends EntityBase {
	type: 'book';
	description: string;
	cover?: string;
	shelves: Shelf[];
	chapters: Chapter[];
	pages: Page[];
	/** Chapters and chapter-less pages, in book order. */
	tree: (Chapter | Page)[];
}

export interface Chapter extends EntityBase {
	type: 'chapter';
	description: string;
	priority: number;
	book: Book;
	pages: Page[];
}

export interface NavItem {
	level: number;
	link: string;
	text: string;
}

export interface Page extends EntityBase {
	type: 'page';
	priority: number;
	book: Book;
	chapter?: Chapter;
	html: string;
	/** The page source: Markdown, or the WYSIWYG editor's HTML. */
	markdown: string;
	editor: 'markdown' | 'wysiwyg';
	revisionCount: number;
	navigation: NavItem[];
}

export type Entity = Shelf | Book | Chapter | Page;

export interface Activity {
	type: string;
	user?: User;
	/** Missing when the entity is in the recycle bin. */
	entity?: Entity;
	createdAt: Date;
}

// --- Helpers -----------------------------------------------------------------------

const enc = (slug: string) => encodeURIComponent(slug);

/** Str::slug() */
export const slugify = (text: string) =>
	text
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
		if (code[0] === '#') {
			const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
			return String.fromCodePoint(n);
		}
		return ENTITIES[code.toLowerCase()] ?? match;
	});
}

/** html_entity_decode(strip_tags($html)) */
export const htmlToText = (html: string) => decodeEntities(html.replace(/<[^>]*>/g, ''));

/** Entity::getExcerpt() */
export function excerpt(entity: Entity, length = 100): string {
	let text = entity.text;
	if ([...text].length > length) text = [...text].slice(0, length - 3).join('') + '...';
	return text.trim();
}

/** Entity::getShortName() */
export function shortName(entity: Entity, length = 25): string {
	const chars = [...entity.name];
	return chars.length <= length ? entity.name : chars.slice(0, length - 3).join('') + '...';
}

/** getBookCover(): resized cover, or BookStack's default one. */
export function coverUrl(entity: Shelf | Book, width = 440, height = 250): string {
	if (!entity.cover) return '/book_default_cover.png';
	const i = entity.cover.lastIndexOf('/');
	return `${entity.cover.slice(0, i)}/thumbs-${width}-${height}${entity.cover.slice(i)}`;
}

export const avatarUrl = (user: User | undefined, size: 'small' | 'large' = 'small') =>
	user?.avatar?.[size] ?? '/user_avatar.png';

/** PageContent::getNavigation() */
function navigationOf(html: string): NavItem[] {
	const items = [...html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g)]
		.map(([, level, attrs, inner]) => ({
			level: Number(level),
			link: '#' + (attrs.match(/\bid="([^"]*)"/)?.[1] ?? ''),
			text: [...htmlToText(inner).replace(/ /g, '').trim()].slice(0, 100).join(''),
		}))
		.filter((item) => item.text.length > 0);
	const shift = Math.min(...items.map((item) => item.level)) - 1;
	return items.map((item) => ({ ...item, level: item.level - shift }));
}

const byPriority = <T extends { priority: number }>(a: T, b: T) => a.priority - b.priority;

const CONTENT = 'src/content/books';

/** Last change of a file that git doesn't know yet. */
function modified(filePath: string): Date {
	try {
		return statSync(filePath).mtime;
	} catch {
		return new Date();
	}
}

// --- Loading ---------------------------------------------------------------------------

export interface Site {
	users: User[];
	shelves: Shelf[];
	books: Book[];
	chapters: Chapter[];
	pages: Page[];
	activity: Activity[];
	userBySlug: (slug?: string) => User | undefined;
}

let site: Promise<Site> | undefined;
export const loadSite = () => (site ??= buildSite());

async function buildSite(): Promise<Site> {
	const users: User[] = usersData.map((u) => ({ ...u, url: `/user/${enc(u.slug)}/`, createdAt: new Date(u.createdAt) }));
	const userBySlug = (slug?: string) => users.find((u) => u.slug === slug);

	/** A user from a slug, a display name or a git identity. Unknown names become new users. */
	const resolveUser = (name: string, email = '', since = new Date()) => {
		const login = email.split('@')[0].split('+').pop()!.toLowerCase(); // GitHub's 123+login@users.noreply.github.com
		const known = users.find((u) => [u.slug, u.name.toLowerCase()].some((id) => id === name.toLowerCase() || id === login));
		if (known) return known;
		const slug = slugify(name) || 'user';
		const user: User = { slug, name, url: `/user/${enc(slug)}/`, createdAt: since, avatar: null };
		users.push(user);
		return user;
	};

	let nextId = 100000; // for entities added after the import without an id
	const base = (data: any, text: string) => ({
		id: data.id ?? nextId++,
		name: data.title,
		slug: data.slug,
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		createdBy: userBySlug(data.createdBy),
		updatedBy: userBySlug(data.updatedBy),
		ownedBy: userBySlug(data.ownedBy),
		restricted: data.restricted,
		tags: data.tags,
		views: data.views,
		text,
	});

	const books: Book[] = (await getCollection('books')).map(({ data }) => ({
		type: 'book',
		...base(data, data.description ?? ''),
		url: `/books/${enc(data.slug)}/`,
		description: data.description ?? '',
		cover: data.cover,
		shelves: [],
		chapters: [],
		pages: [],
		tree: [],
	}));
	const bookByDir = new Map(books.map((b) => [b.slug, b]));

	const chapters: Chapter[] = (await getCollection('chapters')).map(({ id, data }) => {
		const book = bookByDir.get(id.split('/')[0])!;
		return {
			type: 'chapter',
			...base(data, data.description ?? ''),
			url: `${book.url}chapter/${enc(data.slug)}/`,
			description: data.description ?? '',
			priority: data.priority,
			book,
			pages: [],
		};
	});

	const history = fileHistory(CONTENT);

	/** Fill in what a bare Markdown page leaves out of its frontmatter. */
	const withDefaults = ({ id, data, body = '', filePath = '' }: CollectionEntry<'pages'>) => {
		const file = id.split('/').pop()!;
		let title = data.title;
		if (!title && data.editor === 'markdown') {
			const heading = body.match(/^\s*# +(.*?)(?: +#+)? *(?:\n|$)/);
			if (heading) {
				title = heading[1];
				body = body.slice(heading[0].length).replace(/^\s*\n/, '');
			}
		}
		const commits = history.get(filePath) ?? [];
		// A page imported with its dates came in with its first commit: only later ones are edits.
		const edits = data.createdAt ? commits.slice(0, -1) : commits;
		const [last, first] = [edits[0], commits.at(-1)];
		const fromCommit = (commit?: Commit) => commit && resolveUser(commit.author, commit.email, commit.date).slug;
		const named = (name?: string) => name && resolveUser(name).slug;
		const createdAt = data.createdAt ?? first?.date ?? modified(filePath);
		const createdBy = named(data.createdBy ?? data.author) || fromCommit(first);
		const edit = last && (!data.updatedAt || last.date > data.updatedAt) ? last : undefined;
		return {
			id,
			filePath,
			body,
			data: {
				...data,
				title: title || file.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase()),
				slug: data.slug ?? slugify(file),
				createdAt,
				createdBy,
				updatedAt: edit?.date ?? data.updatedAt ?? createdAt,
				updatedBy: edit ? fromCommit(edit) : data.updatedAt ? data.updatedBy : createdBy,
				ownedBy: data.ownedBy ?? createdBy,
				// New pages go after the imported ones (priorities 0-30), oldest first.
				priority: data.priority ?? Math.floor(createdAt.getTime() / 1000),
				revisionCount: (data.revisionCount ?? 0) + edits.length || 1,
			},
		};
	};
	const pageEntries = (await getCollection('pages')).map(withDefaults);
	const bookOf = (id: string) => bookByDir.get(id.split('/')[0])!;
	const pageUrl = (entry: (typeof pageEntries)[number]) => `${bookOf(entry.id).url}page/${enc(entry.data.slug)}/`;
	const pageUrlByFile = new Map(pageEntries.map((entry) => [entry.filePath, pageUrl(entry)]));

	// Links and images relative to the Markdown file: other pages by their .md file, and
	// files kept next to the page (published under /books/ by integrations/content-assets).
	const resolveUrl = (value: string, filePath: string) => {
		if (!value || /^(?:[a-z][a-z\d+.-]*:|[/#?])/i.test(value)) return value;
		const url = new URL(value, `file:///${filePath}`);
		const target = decodeURIComponent(url.pathname.slice(1));
		const page = pageUrlByFile.get(target);
		if (page) return page + url.hash;
		if (!target.startsWith(CONTENT + '/') || !existsSync(target)) return value;
		return '/books/' + url.pathname.slice(`/${CONTENT}/`.length) + url.search + url.hash;
	};
	const resolveLinks = (html: string, filePath: string) =>
		html.replace(/(\s(?:src|href)=)(["'])(.*?)\2/gi, (_, attr: string, quote: string, value: string) =>
			attr + quote + resolveUrl(value, filePath) + quote,
		);
	// The same for the Markdown export: [text](target) and ![alt](target).
	const resolveMarkdownLinks = (markdown: string, filePath: string) =>
		markdown.replace(/(\]\(<?)([^)\s>]+)/g, (_, start: string, value: string) => start + resolveUrl(value, filePath));

	const pages: Page[] = pageEntries.map((entry) => {
		const { data, body } = entry;
		const book = bookOf(entry.id);
		const html = resolveLinks(renderPage(body, data.editor), entry.filePath);
		return {
			type: 'page',
			...base(data, htmlToText(html)),
			url: pageUrl(entry),
			priority: data.priority,
			book,
			chapter: chapters.find((c) => c.book === book && c.slug === data.chapter),
			html,
			markdown: data.editor === 'markdown' ? resolveMarkdownLinks(body, entry.filePath) : body,
			editor: data.editor,
			revisionCount: data.revisionCount,
			navigation: navigationOf(html),
		};
	});

	// BookContents::getTree(): chapters and loose pages share one priority order.
	const byId = <T extends { id: number }>(a: T, b: T) => a.id - b.id;
	for (const book of books) {
		book.chapters = chapters.filter((c) => c.book === book).sort(byId);
		book.pages = pages.filter((p) => p.book === book).sort(byId);
		const loose = book.pages.filter((p) => !p.chapter);
		book.tree = [...book.chapters, ...loose].sort(byPriority);
	}
	for (const chapter of chapters) {
		chapter.pages = pages.filter((p) => p.chapter === chapter).sort(byId).sort(byPriority);
	}

	const shelves: Shelf[] = (await getCollection('shelves')).map(({ data }) => ({
		type: 'bookshelf',
		...base(data, data.description ?? ''),
		url: `/shelves/${enc(data.slug)}/`,
		description: data.description ?? '',
		cover: data.cover,
		books: data.books.map((slug) => bookByDir.get(slug)).filter((b): b is Book => !!b),
	}));
	shelves.sort(byId);
	for (const shelf of shelves) for (const book of shelf.books) book.shelves.push(shelf);

	const all: Entity[] = [...shelves, ...books, ...chapters, ...pages];
	const activity = buildActivity(all, userBySlug);

	return { users, shelves, books: books.sort(byId), chapters: chapters.sort(byId), pages: pages.sort(byId), activity, userBySlug };
}

// --- Activity ---------------------------------------------------------------------------

// The imported history, plus create/update events for content changed after it.
function buildActivity(all: Entity[], userBySlug: Site['userBySlug']): Activity[] {
	const find = (type: string, id: number) => all.find((e) => e.type === type && e.id === id);
	const imported: Activity[] = activityData.map((a) => ({
		type: a.type,
		user: userBySlug(a.user ?? undefined),
		entity: find(a.entityType, a.entityId),
		createdAt: new Date(a.createdAt),
	}));

	const cutoff = Math.max(0, ...imported.map((a) => a.createdAt.getTime()));
	const derived: Activity[] = [];
	for (const entity of all) {
		if (entity.createdAt.getTime() > cutoff) {
			derived.push({ type: `${entity.type}_create`, user: entity.createdBy, entity, createdAt: entity.createdAt });
		}
		if (entity.updatedAt.getTime() > Math.max(cutoff, entity.createdAt.getTime())) {
			derived.push({ type: `${entity.type}_update`, user: entity.updatedBy, entity, createdAt: entity.updatedAt });
		}
	}
	return [...imported, ...derived].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** ActivityService::filterSimilar(): collapse consecutive repeats. */
function filterSimilar(list: Activity[]): Activity[] {
	return list.filter((a, i) => i === 0 || a.type !== list[i - 1].type || a.entity !== list[i - 1].entity);
}

export const latestActivity = (s: Site, count = 10) => filterSimilar(s.activity.slice(0, count));

export const userActivity = (s: Site, user: User, count = 20) =>
	filterSimilar(s.activity.filter((a) => a.user === user).slice(0, count));

/** ActivityService::entityActivity(): the entity and, for books and chapters, their contents. */
export function entityActivity(s: Site, entity: Entity, count = 20): Activity[] {
	const related = (e: Entity) =>
		e === entity ||
		(entity.type === 'book' && (e.type === 'chapter' || e.type === 'page') && e.book === entity) ||
		(entity.type === 'chapter' && e.type === 'page' && e.chapter === entity);
	return filterSimilar(s.activity.filter((a) => a.entity && related(a.entity)).slice(0, count));
}

// --- Listings ------------------------------------------------------------------------------

const newest = (a: EntityBase, b: EntityBase) => b.createdAt.getTime() - a.createdAt.getTime();
const latestUpdate = (a: EntityBase, b: EntityBase) => b.updatedAt.getTime() - a.updatedAt.getTime();
const mostViewed = (a: EntityBase, b: EntityBase) => b.views - a.views;

export const recentlyCreated = <T extends EntityBase>(list: T[], count: number) => [...list].sort(newest).slice(0, count);
export const recentlyUpdated = <T extends EntityBase>(list: T[], count?: number) =>
	[...list].sort(latestUpdate).slice(0, count);
export const popular = <T extends EntityBase>(list: T[], count: number) => [...list].sort(mostViewed).slice(0, count);
export const byName = <T extends EntityBase>(list: T[]) =>
	[...list].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

/** NextPreviousContentLocator: neighbours in the flattened book tree. */
export function siblingsInReadingOrder(entity: Chapter | Page) {
	const flat = entity.book.tree.flatMap((child) => (child.type === 'chapter' ? [child, ...child.pages] : [child]));
	const i = flat.indexOf(entity);
	return { previous: flat[i - 1], next: flat[i + 1] };
}

/** SiblingFetcher: what the breadcrumb dropdown lists for an entity. */
export function breadcrumbSiblings(s: Site, entity: Entity): Entity[] {
	switch (entity.type) {
		case 'page':
			return entity.chapter ? entity.chapter.pages : entity.book.tree;
		case 'chapter':
			return entity.book.tree;
		case 'book':
			return s.books;
		case 'bookshelf':
			return s.shelves;
	}
}

export const crumbsFor = (entity: Entity): Entity[] =>
	entity.type === 'page'
		? [entity.book, ...(entity.chapter ? [entity.chapter] : []), entity]
		: entity.type === 'chapter'
			? [entity.book, entity]
			: [entity];
