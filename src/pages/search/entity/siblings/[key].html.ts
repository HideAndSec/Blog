// SearchController::searchSiblings (entities/list-basic.blade.php), pre-rendered as the
// HTML fragments the breadcrumb dropdowns load.
import type { APIRoute } from 'astro';
import { breadcrumbSiblings, loadSite, type Entity } from '../../../../lib/bookstack';
import { icon } from '../../../../lib/icons';

export async function getStaticPaths() {
	const site = await loadSite();
	const all: Entity[] = [...site.shelves, ...site.books, ...site.chapters, ...site.pages];
	return all.map((entity) => ({ params: { key: `${entity.type}-${entity.id}` }, props: { entity } }));
}

const esc = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

/** entities/list-item-basic.blade.php */
export const listItemBasic = (entity: Entity, classes = '', inner = '') =>
	`<a href="${esc(entity.url)}" class="${entity.type} ${classes} entity-list-item" data-entity-type="${entity.type}" data-entity-id="${entity.id}">
    <span role="presentation" class="icon text-${entity.type}">${icon(entity.type)}</span>
    <div class="content">
            <h4 class="entity-list-item-name break-text">${esc(entity.name)}</h4>
            ${inner}
    </div>
</a>`;

export const GET: APIRoute = async ({ props }) => {
	const site = await loadSite();
	const items = breadcrumbSiblings(site, props.entity as Entity);
	const body =
		items.length > 0
			? items.map((e) => listItemBasic(e)).join('\n')
			: '<p class="text-muted empty-text">\n            No items available\n        </p>';
	return new Response(`<div class="entity-list compact">\n${body}\n</div>`, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
};
