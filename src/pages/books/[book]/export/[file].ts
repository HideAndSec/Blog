import { loadSite } from '../../../../lib/bookstack';
import { exportRoute } from '../../../../lib/export';

export const { getStaticPaths, GET } = exportRoute(
	async () => (await loadSite()).books,
	(book) => ({ book: book.slug }),
);
