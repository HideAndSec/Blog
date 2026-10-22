// Files kept next to the pages in src/content/books (images, attachments) are published
// under /books/, mirroring their folder, so a page can link them with a relative path.
import { cpSync, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

const SOURCE = resolve('src/content/books');

const TYPES: Record<string, string> = {
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.pdf': 'application/pdf',
	'.txt': 'text/plain; charset=utf-8',
	'.zip': 'application/zip',
};

const isAsset = (path: string) => extname(path).toLowerCase() !== '.md';

export default function contentAssets(): AstroIntegration {
	return {
		name: 'content-assets',
		hooks: {
			'astro:server:setup': ({ server }) => {
				server.middlewares.use((req, res, next) => {
					const path = decodeURIComponent((req.url ?? '').split('?')[0]);
					if (!path.startsWith('/books/') || !isAsset(path)) return next();
					const file = join(SOURCE, path.slice('/books/'.length));
					if (!file.startsWith(SOURCE + '/') || !existsSync(file) || !statSync(file).isFile()) return next();
					res.setHeader('Content-Type', TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream');
					res.end(readFileSync(file));
				});
			},
			'astro:build:done': ({ dir }) => {
				cpSync(SOURCE, join(fileURLToPath(dir), 'books'), {
					recursive: true,
					filter: (path) => statSync(path).isDirectory() || isAsset(path),
				});
			},
		},
	};
}
