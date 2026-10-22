// @ts-check
import { defineConfig } from 'astro/config';
import contentAssets from './src/integrations/content-assets';

export default defineConfig({
	site: 'https://hideandsec.sh',
	trailingSlash: 'ignore',
	// Keep the whitespace between tags: BookStack's inline-block layouts depend on it.
	compressHTML: false,
	// Page bodies are rendered by src/lib/render.ts, the way BookStack rendered them.
	markdown: { syntaxHighlight: false },
	integrations: [contentAssets()],
});
