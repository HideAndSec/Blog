import { loadSite } from '../../../../../../lib/bookstack';
import { exportRoute } from '../../../../../../lib/export';

export const { getStaticPaths, GET } = exportRoute(
	async () => (await loadSite()).pages,
	(page) => ({ book: page.book.slug, page: page.slug }),
);
