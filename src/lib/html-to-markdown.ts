// BookStack's HtmlToMarkdown: league/html-to-markdown 5.0.0 with the options and converters
// BookStack v21.08 sets, used for the Markdown export of pages written in the WYSIWYG editor.
// The converters run bottom-up on the DOM, each element being replaced by a text node
// holding its Markdown, as in the PHP library. Elements without a converter are written
// back as HTML (C14N); the escaping it and saveHTML() add is undone by html_entity_decode(),
// so text is copied as is.
import type { AnyNode, Element } from 'domhandler';
import { parseDocument } from 'htmlparser2';

interface Node {
	name: string; // tag name, '#text' or '#comment'
	data: string;
	attrs: Record<string, string>;
	children: Node[];
	parent: Node | null;
}

const newNode = (name: string, parent: Node | null, data = '', attrs: Record<string, string> = {}): Node => ({
	name,
	data,
	attrs,
	children: [],
	parent,
});

// libxml2's areBlanks(): whitespace between tags is dropped unless it follows text or
// one of these elements (or opens one of them).
const ALLOW_PCDATA = new Set(
	'a abbr acronym address applet b bdo big blockquote body button caption center cite code dd del dfn div dt em font form h1 h2 h3 h4 h5 h6 i iframe ins kbd label legend li noframes noscript object p pre q s samp small span strike strong td th tt u var'.split(
		' ',
	),
);

/** DOMDocument::loadHTML() of a fragment: <html><body>…</body></html>. */
function load(html: string): Node {
	const doc = parseDocument(html, { withStartIndices: true, withEndIndices: true, lowerCaseAttributeNames: true });
	const root = newNode('html', null);
	const body = newNode('body', root);
	root.children.push(body);
	let started = false;

	const add = (source: AnyNode, parent: Node) => {
		if (source.type === 'text') {
			const blank = /^[ \t\n\r]+$/.test(source.data);
			if (blank) {
				// Before the first element there is no current node, at the end nothing follows.
				if (!started || source.endIndex! + 1 >= html.length) return;
				if (html[source.endIndex! + 1] === '<') {
					let last = parent.children.at(-1);
					for (let i = parent.children.length - 1; last?.name === '#comment'; ) last = parent.children[--i];
					if (!last ? !ALLOW_PCDATA.has(parent.name) : last.name !== '#text' && !ALLOW_PCDATA.has(last.name)) return;
				}
			}
			parent.children.push(newNode('#text', parent, source.data));
		} else if (source.type === 'comment') {
			parent.children.push(newNode('#comment', parent, source.data));
		} else if (source.type === 'tag' || source.type === 'script' || source.type === 'style') {
			// htmlparser2 turns a stray </p> or </br> into an element, as browsers do; libxml drops it.
			if (html[source.startIndex! + 1] === '/') return;
			started = true;
			const element = newNode(source.name, parent, '', { ...source.attribs });
			parent.children.push(element);
			for (const child of source.children) add(child, element);
		}
	};
	for (const child of doc.children) add(child, body);
	return root;
}

// --- DOM helpers, as League\HTMLToMarkdown\Element ------------------------------------------

/** DOMNode::nodeValue: the text of an element, the data of a text node. */
const value = (node: Node): string =>
	node.name === '#text' || node.name === '#comment' ? node.data : node.children.map((c) => (c.name === '#comment' ? '' : value(c))).join('');

function nextNode(node: Node, checkChildren = true): Node | null {
	if (checkChildren && node.children.length) return node.children[0];
	const siblings = node.parent?.children;
	const next = siblings?.[siblings.indexOf(node) + 1];
	if (next) return next;
	return node.parent ? nextNode(node.parent, false) : null;
}

const nextSibling = (node: Node) => {
	const siblings = node.parent!.children;
	return siblings[siblings.indexOf(node) + 1] ?? null;
};

function isDescendantOf(node: Node, names: string[]): boolean {
	for (let p = node.parent; p; p = p.parent) if (names.includes(p.name)) return true;
	return false;
}

const BLOCKS = new Set(['blockquote', 'body', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'html', 'li', 'p', 'ol', 'ul']);

const PHP_TRIM = ' \t\n\r\0\x0B';
const trimChars = (s: string, chars: string, left = true, right = true) => {
	let start = 0;
	let end = s.length;
	while (left && start < end && chars.includes(s[start])) start++;
	while (right && end > start && chars.includes(s[end - 1])) end--;
	return s.slice(start, end);
};
const trim = (s: string, chars = PHP_TRIM) => trimChars(s, chars);
const ltrim = (s: string) => trimChars(s, PHP_TRIM, true, false);
const rtrim = (s: string) => trimChars(s, PHP_TRIM, false, true);
/** PHP truthiness of a string. */
const truthy = (s: string) => s !== '' && s !== '0';

const isWhitespace = (node: Node) => node.name === '#text' && trim(node.data) === '';

function siblingPosition(node: Node): number {
	let position = 0;
	for (const current of node.parent!.children) {
		if (!isWhitespace(current)) position++;
		if (current === node) break;
	}
	return position;
}

function listItemLevel(node: Node): number {
	let level = 0;
	for (let p = node.parent; p && p.parent; p = p.parent) if (p.name === 'li') level++;
	return level;
}

/** C14N() then html_entity_decode(): the element as HTML, attributes sorted, no comments. */
function c14n(node: Node): string {
	if (node.name === '#text') return node.data;
	if (node.name === '#comment') return '';
	const attrs = Object.keys(node.attrs)
		.sort()
		.map((name) => ` ${name}="${node.attrs[name]}"`)
		.join('');
	return `<${node.name}${attrs}>${node.children.map(c14n).join('')}</${node.name}>`;
}

// --- Converters ---------------------------------------------------------------------------

// PCRE \s with the u modifier (PHP sets UCP).
const UNICODE_SPACES = new RegExp(`[${[9, 10, 11, 12, 13, 32, 0x85, 0xa0, 0x1680, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000].map((c) => String.fromCharCode(c)).join('')}${String.fromCharCode(0x2000)}-${String.fromCharCode(0x200a)}]+`, 'g');
const htmlspecialchars = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function text(node: Node): string {
	let markdown = node.data.replace(/^\n+/, '').replace(UNICODE_SPACES, ' ');
	if (node.parent && node.parent.name !== 'div') markdown = markdown.replace(/([*_[\]\\])/g, '\\$1');
	markdown = markdown.replace(/^#/, '\\#');
	if (markdown === ' ') {
		const next = nextNode(node);
		if (!next || BLOCKS.has(next.name)) markdown = '';
	}
	return htmlspecialchars(markdown);
}

function emphasisTag(node: Node | null): string {
	if (!node || node.name === '#text') return '';
	if (node.name === 'i' || node.name === 'em') return 'em';
	if (node.name === 'b' || node.name === 'strong') return 'strong';
	return '';
}

function emphasis(node: Node, previous: Node | null): string {
	const tag = emphasisTag(node);
	const v = value(node);
	if (!truthy(trim(v))) return v;
	const style = tag === 'em' ? '*' : '**';
	const prefix = ltrim(v) !== v ? ' ' : '';
	const suffix = rtrim(v) !== v ? ' ' : '';
	const preStyle = emphasisTag(previous) === tag ? '' : style;
	const postStyle = emphasisTag(nextSibling(node)) === tag ? '' : style;
	return prefix + preStyle + trim(v) + postStyle + suffix;
}

function hardBreak(node: Node): string {
	let result = '  \n';
	const next = nextNode(node);
	if (next) {
		const nextValue = value(next);
		if (truthy(nextValue) && ['- ', '* ', '+ '].includes(nextValue.slice(0, 2)) && node.parent?.name === 'li') result += '\\';
	}
	return result;
}

function header(node: Node): string {
	const v = value(node);
	if (v.length === 0) return '\n';
	return '#'.repeat(Number(node.name[1])) + ' ' + v + '\n\n';
}

function blockquote(node: Node): string {
	const lines = trim(value(node)).split(/\r\n|\r|\n/);
	return lines.map((line, i) => '> ' + line + '\n' + (i + 1 === lines.length ? '\n' : '')).join('');
}

function code(node: Node): string {
	let language = '';
	const classes = node.attrs.class ?? '';
	if (classes) {
		const found = classes.split(' ').find((c) => c.includes('language-'));
		if (found !== undefined) language = found.replaceAll('language-', '');
	}
	const content = c14n(node).replace(/<code\b[^>]*>/g, '').replaceAll('</code>', '');
	if (node.parent?.name === 'pre' || /[^\t\n\v\f\r ]` `/.test(content)) return '```' + language + '\n' + content + '\n```';
	return '`' + content.replace(/\r\n|\r|\n/g, '') + '`';
}

function preformatted(node: Node): string {
	let content = c14n(node).replaceAll('<pre>', '').replaceAll('</pre>', '');
	const trimmed = trim(content);
	if (trimmed.indexOf('`') === 0 && trimmed.lastIndexOf('`') === trimmed.length - 1) return content + '\n\n';
	if (content === '') return '```\n```\n\n';
	content = content.replace(/\r\n|\r|\n/g, '\n');
	if (!content.endsWith('\n')) content += '\n';
	return '```\n' + content + '```\n\n';
}

function link(node: Node): string {
	const href = node.attrs.href ?? '';
	const title = node.attrs.title ?? '';
	const label = trim(value(node), '\t\n\r\0\x0B');
	if (!truthy(href)) return c14n(node);
	if (title !== '') return `[${label}](${href} "${title}")`;
	// use_autolinks is off, but mailto: links to their own text still become <address>.
	if (href === 'mailto:' + label && /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(label)) return `<${label}>`;
	return `[${label}](${href.includes(' ') ? `<${href}>` : href})`;
}

function image(node: Node): string {
	const { src = '', alt = '', title = '' } = node.attrs;
	return title !== '' ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
}

function listItem(node: Node): string {
	const parent = node.parent;
	const listType = parent ? parent.name : 'ul';
	const level = listItemLevel(node);
	const v = trim(trim(value(node)).split('\n').join('\n  '));
	const prefix = level > 0 && siblingPosition(node) === 1 ? '\n' : '';
	if (listType === 'ul') return prefix + '- ' + v + '\n';
	const start = listType === 'ol' ? parseInt(parent?.attrs.start ?? '', 10) || 0 : 0;
	const number = start ? start + siblingPosition(node) - 1 : siblingPosition(node);
	return prefix + number + '. ' + v + '\n';
}

const FIRST_ESCAPES = ['>', '- ', '+ ', '--', '~~~', '---', '- - -'];
function escapeLine(line: string): string {
	if (FIRST_ESCAPES.some((e) => ltrim(line).startsWith(e))) line = '\\' + ltrim(line);
	const comment = line.indexOf('<!--');
	if (comment !== -1) line = line.slice(0, comment) + '\\' + line.slice(comment);
	const number = line.match(/^[0-9]+(?=(\)|\.)( |$))/);
	if (number) line = line.slice(0, number[0].length) + '\\' + line.slice(number[0].length);
	return line;
}

function paragraph(node: Node): string {
	const cls = node.attrs.class ?? '';
	if (cls.includes('callout')) return `<p class="${cls}">${value(node)}</p>\n\n`;
	const markdown = value(node)
		.split(/\r\n|\r|\n/)
		.map((line) => escapeLine(line) + '\n')
		.join('');
	return trim(markdown) !== '' ? rtrim(markdown) + '\n\n' : '';
}

function convertNode(node: Node, previous: Node | null): string {
	switch (node.name) {
		case '#text':
			return text(node);
		case '#comment':
			return '';
		case 'blockquote':
			return blockquote(node);
		case 'code':
			return code(node);
		case 'div':
			return c14n(node);
		case 'em':
		case 'i':
		case 'strong':
		case 'b':
			return emphasis(node, previous);
		case 'br':
			return hardBreak(node);
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
			return header(node);
		case 'hr':
			return '- - - - - -\n\n';
		case 'img':
			return image(node);
		case 'a':
			return link(node);
		case 'ol':
		case 'ul':
			return value(node) + '\n';
		case 'li':
			return listItem(node);
		case 'p':
			return paragraph(node);
		case 'pre':
			return preformatted(node);
		default:
			return c14n(node) + (node.name === 'table' ? '\n\n' : '');
	}
}

function convertChildren(node: Node, previous: Node | null) {
	// HTML inside <pre> and <code> stays as it is.
	if (isDescendantOf(node, ['pre', 'code']) && node.name !== 'code') return;
	// Each child is wrapped (and its previous sibling remembered) before any is converted.
	const children = [...node.children];
	children.forEach((child, i) => convertChildren(child, children[i - 1] ?? null));
	const markdown = convertNode(node, previous);
	const replacement = newNode('#text', node.parent, markdown);
	if (node.parent) node.parent.children[node.parent.children.indexOf(node)] = replacement;
	else node.data = markdown;
}

/** HtmlConverter::convert() as configured by BookStack. */
export function htmlToMarkdown(html: string): string {
	// HtmlToMarkdown::prepareHtml()
	html = html.replaceAll('\r\n', '\n').replace(/<pre .*?>/g, '<pre>');
	if (trim(html) === '') return '';
	const root = load(html);
	const document = newNode('#document', null);
	document.children.push(root);
	root.parent = document;
	convertChildren(root, null);

	// sanitize()
	let markdown = trim('<?xml encoding="UTF-8">' + document.children[0].data);
	for (const tag of ['<?xml encoding="UTF-8">', '<html>', '</html>', '<body>', '</body>', '<head>', '</head>', '&#xD;']) {
		// strpos(): only the first occurrence counts.
		if (!tag.includes('/')) {
			if (markdown.indexOf(tag) === 0) markdown = markdown.slice(tag.length);
		} else if (markdown.includes(tag) && markdown.indexOf(tag) === markdown.length - tag.length) markdown = markdown.slice(0, -tag.length);
	}
	return trim(markdown, '\n\r\0\x0B');
}
