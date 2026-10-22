// PageContent::formatHtml(): the "bkmrk-…" ids BookStack gives page content on save, so
// old links to sections keep working and the page navigation and section pointer
// behave as before. BookStack parses with libxml, which keeps the markup as written;
// htmlparser2 does the same, and the changes are made to the original string.
import type { AnyNode, Element, Text } from 'domhandler';
import { textContent } from 'domutils';
import { DomHandler } from 'domhandler';
import { Parser } from 'htmlparser2';

/** PHP urlencode(): everything but [A-Za-z0-9_.-] is percent-encoded, spaces become "+". */
const phpUrlencode = (s: string) =>
	encodeURIComponent(s)
		.replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
		.replace(/%20/g, '+');

/** The id BookStack derives from an element's text. PHP's trim(), \s and strtolower() only know ASCII. */
function contentId(element: Element): string {
	const text = textContent(element)
		.replace(/^[ \t\n\r\0\x0B]+|[ \t\n\r\0\x0B]+$/g, '')
		.replace(/[ \t\n\v\f\r]+/g, '-')
		.replace(/[A-Z]/g, (c) => c.toLowerCase());
	return 'bkmrk-' + [...text].slice(0, 20).join('');
}

// libxml2's areBlanks(): whitespace between tags is dropped unless it follows text or
// one of these elements (or opens one of them).
const ALLOW_PCDATA = new Set(
	'a abbr acronym address applet b bdo big blockquote body button caption center cite code dd del dfn div dt em font form h1 h2 h3 h4 h5 h6 i iframe ins kbd label legend li noframes noscript object p pre q s samp small span strike strong td th tt u var'.split(
		' ',
	),
);

function isDroppedBlank(node: Text, html: string, isElement: (n: AnyNode) => n is Element): boolean {
	if (!/^[ \t\n\r]+$/.test(node.data)) return false;
	// The content is parsed inside <body>…</body>, so a "<" always follows at the end.
	if ((html[node.endIndex! + 1] ?? '<') !== '<') return false;
	let previous = node.prev;
	while (previous && (previous.type === 'comment' || isStray(previous, html))) previous = previous.prev;
	if (!previous) {
		const parent = node.parent && isElement(node.parent) ? node.parent.name : 'body';
		return !ALLOW_PCDATA.has(parent);
	}
	if (previous.type === 'text') return false;
	return !(isElement(previous) && ALLOW_PCDATA.has(previous.name));
}

// htmlparser2 turns a stray </p> or </br> into an element, as browsers do; libxml drops it.
const isStray = (node: AnyNode, html: string) => node.type === 'tag' && html[node.startIndex! + 1] === '/';

const VOID = new Set('area base basefont br col embed frame hr img input isindex link meta param source track wbr'.split(' '));

/** Where libxml writes the end tag of an element closed without its own. */
function impliedEnd(element: Element, html: string): number | null {
	if (VOID.has(element.name)) return null;
	const end = element.endIndex!;
	const own = `</${element.name}`;
	if (html.slice(end + 1 - own.length - 1, end + 1).toLowerCase().startsWith(own) && html[end] === '>') return null;
	if (html[end] !== '>') return end + 1;
	const closer = html.lastIndexOf('<', end);
	return html[closer + 1] === '/' ? closer : end + 1;
}

export function formatHtml(html: string): string {
	const options = { withStartIndices: true, withEndIndices: true, lowerCaseAttributeNames: true };
	const handler = new DomHandler(undefined, options);
	const parser = new Parser(handler, options);
	// End tags that close nothing: libxml ignores them.
	const strays: [number, number][] = [];
	const onclosetag = parser.onclosetag.bind(parser);
	parser.onclosetag = (start, end) => {
		const stack = (parser as unknown as { stack: string[] }).stack;
		if (!stack.includes(html.slice(start, end).trim().toLowerCase())) strays.push([start - 2, end]);
		onclosetag(start, end);
	};
	parser.end(html);
	const doc = handler.root;
	const isElement = (node: AnyNode): node is Element =>
		(node.type === 'tag' || node.type === 'script' || node.type === 'style') && !isStray(node, html);
	const idMap = new Set<string>();
	const edits: { at: number; remove: number; text: string }[] = [];
	const renamed: [string, string][] = [];

	const setUniqueId = (element: Element) => {
		const existing = element.attribs.id ?? '';
		if (existing.startsWith('bkmrk') && !idMap.has(existing)) {
			idMap.add(existing);
			return;
		}
		const base = contentId(element);
		let id = phpUrlencode(base);
		for (let i = 0; idMap.has(id); i++) id = phpUrlencode(`${base}-${i}`);
		idMap.add(id);

		const start = element.startIndex!;
		const tag = html.slice(start, html.indexOf('>', start) + 1);
		const attr = tag.match(/\sid\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
		if (attr) {
			edits.push({ at: start + attr.index!, remove: attr[0].length, text: ` id="${id}"` });
			if (existing) renamed.push([existing, id]);
		} else {
			const end = tag.endsWith('/>') ? tag.length - 2 : tag.length - 1;
			edits.push({ at: start + end, remove: 0, text: ` id="${id}"` });
		}
	};

	const topLevel = doc.children.filter(isElement);
	topLevel.forEach(setUniqueId);

	// Nested elements that already carry an id must not clash with others.
	const visit = (element: Element) => {
		for (const child of element.children.filter(isElement)) {
			if (child.attribs.id !== undefined) setUniqueId(child);
			visit(child);
		}
	};
	topLevel.forEach(visit);

	const blanks = (node: AnyNode) => {
		if (node.type === 'text' && isDroppedBlank(node as Text, html, isElement)) {
			edits.push({ at: node.startIndex!, remove: node.endIndex! - node.startIndex! + 1, text: '' });
		} else if (node.type === 'text') {
			// saveHTML() only escapes &, < and > in text.
			const source = html.slice(node.startIndex!, node.endIndex! + 1);
			const text = (node as Text).data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			if (text !== source) edits.push({ at: node.startIndex!, remove: source.length, text });
		}
		if (isElement(node) && !['textarea', 'script', 'style'].includes(node.name)) node.children.forEach(blanks);
	};
	doc.children.forEach(blanks);

	for (const [start, end] of strays) edits.push({ at: start, remove: end - start + 1, text: '' });
	// libxml closes elements left open (e.g. a <p> inside <pre><code>) where their parent
	// closes, and writes the end tags there.
	const ends = (node: AnyNode) => {
		if (isElement(node)) {
			const at = impliedEnd(node, html);
			if (at !== null) edits.push({ at, remove: 0, text: `</${node.name}>` });
			node.children.forEach(ends);
		}
	};
	doc.children.forEach(ends);

	let result = html;
	for (const edit of edits.sort((a, b) => b.at - a.at)) {
		result = result.slice(0, edit.at) + edit.text + result.slice(edit.at + edit.remove);
	}
	// updateLinks(): links to a renamed id follow it.
	for (const [from, to] of renamed) result = result.split(`href="#${from}"`).join(`href="#${to}"`);
	return result;
}
