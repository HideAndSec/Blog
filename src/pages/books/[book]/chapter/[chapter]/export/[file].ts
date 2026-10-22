import { loadSite } from '../../../../../../lib/bookstack';
import { exportRoute } from '../../../../../../lib/export';

export const { getStaticPaths, GET } = exportRoute(
	async () => (await loadSite()).chapters,
	(chapter) => ({ book: chapter.book.slug, chapter: chapter.slug }),
);
