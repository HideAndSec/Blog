#!/usr/bin/env bun
// Smoke test of a running site: visits every page of the build and reports
// broken images, failed requests and console errors.
//
//   bun scripts/check-site.mjs [base-url] [screenshot-dir]
//
// Pages are listed from dist/, so run `bun run build` first.

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');
const shotDir = process.argv[3];
const DIST = path.resolve(import.meta.dirname, '../dist');

const pages = [];
for (const file of await fs.readdir(DIST, { recursive: true })) {
	if (!file.endsWith('index.html')) continue;
	const html = await fs.readFile(path.join(DIST, file), 'utf8');
	if (html.includes('http-equiv="refresh"')) continue; // redirect stubs
	pages.push('/' + encodeURI(file.slice(0, -'index.html'.length)));
}
pages.sort();

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const problems = [];
let imageCount = 0;

for (const url of pages) {
	const page = await context.newPage();
	page.on('console', (msg) => msg.type() === 'error' && problems.push(`${url}  console: ${msg.text()}`));
	page.on('response', (res) => res.status() >= 400 && problems.push(`${url}  HTTP ${res.status()} ${res.url()}`));

	await page.goto(base + url, { waitUntil: 'load' });
	// Lazy images only load once scrolled into view.
	await page.evaluate(async () => {
		for (const img of document.images) img.loading = 'eager';
		await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
	});
	const broken = await page.$$eval('img', (imgs) =>
		imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
	);
	imageCount += await page.$$eval('img', (imgs) => imgs.length);
	for (const src of broken) problems.push(`${url}  broken image ${src}`);

	if (shotDir && ['/', '/books/windows-sNL/page/in-the-potato-family-i-want-them-all/'].includes(url)) {
		await page.screenshot({ path: path.join(shotDir, url === '/' ? 'home.png' : 'article.png'), fullPage: false });
	}
	await page.close();
}
await browser.close();

console.log(`${pages.length} pages, ${imageCount} images checked against ${base}`);
if (problems.length) {
	console.log(problems.join('\n'));
	process.exit(1);
}
console.log('no problems found');
