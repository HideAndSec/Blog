// BookStack's @icon() helper: inline SVG from src/icons with its standard attributes.
const svgs = import.meta.glob<string>('../icons/*.svg', { query: '?raw', import: 'default', eager: true });

export function icon(name: string, attrs: Record<string, string> = {}): string {
	const svg = svgs[`../icons/${name}.svg`];
	if (!svg) return '';
	const all = { class: 'svg-icon', 'data-icon': name, role: 'presentation', ...attrs };
	const attrString = Object.entries(all)
		.map(([key, value]) => `${key}="${value}" `)
		.join('');
	return svg.replace('<svg', `<svg ${attrString}`);
}
