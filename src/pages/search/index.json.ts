// Everything the in-browser search needs (public/js/hideandsec.js): the text BookStack
// indexed for each entity, what list items show, and the icons they use.
import type { APIRoute } from 'astro';
import { excerpt, loadSite, shortName, type Entity } from '../../lib/bookstack';
import { icon } from '../../lib/icons';

export const GET: APIRoute = async () => {
	const site = await loadSite();
	const all: Entity[] = [...site.pages, ...site.chapters, ...site.books, ...site.shelves];
	const entities = all.map((e) => ({
		type: e.type,
		id: e.id,
		name: e.name,
		url: e.url,
		text: e.text,
		excerpt: excerpt(e),
		book: e.type === 'page' || e.type === 'chapter' ? { id: e.book.id, name: shortName(e.book, 42) } : undefined,
		chapter: e.type === 'page' && e.chapter ? { id: e.chapter.id, name: shortName(e.chapter, 42) } : undefined,
		tags: e.tags,
		createdAt: e.createdAt.toISOString(),
		updatedAt: e.updatedAt.toISOString(),
		createdBy: e.createdBy?.slug,
		updatedBy: e.updatedBy?.slug,
		ownedBy: e.ownedBy?.slug,
		restricted: e.restricted,
	}));
	const icons = Object.fromEntries(
		['page', 'chapter', 'book', 'bookshelf', 'tag', 'chevron-right', 'close'].map((name) => [name, icon(name)]),
	);
	return new Response(JSON.stringify({ entities, icons }), { headers: { 'Content-Type': 'application/json' } });
};
