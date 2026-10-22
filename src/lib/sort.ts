// Data attributes read by public/js/hideandsec.js to sort lists in the browser, in
// place of BookStack's per-user sort preference stored on the server.
import { byName, type Entity } from './bookstack';

export const sortAttrs = (entity: Entity, index: number) => ({
	'data-hs-sort-default': index,
	'data-hs-sort-name': entity.name,
	'data-hs-sort-created_at': entity.createdAt.toISOString(),
	'data-hs-sort-updated_at': entity.updatedAt.toISOString(),
});

export type SortKey = 'default' | 'name' | 'created_at' | 'updated_at';

/** The order the server would have sent for a sort setting. */
export function sorted<T extends Entity>(list: T[], sort: SortKey, order: 'asc' | 'desc' = 'asc'): T[] {
	let result: T[];
	if (sort === 'name') result = byName(list);
	else if (sort === 'default') result = [...list];
	else {
		const key = sort === 'created_at' ? 'createdAt' : 'updatedAt';
		result = [...list].sort((a, b) => a[key].getTime() - b[key].getTime());
	}
	return order === 'desc' ? result.reverse() : result;
}
