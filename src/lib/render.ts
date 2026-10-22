// Page HTML as BookStack stored it. For Markdown pages BookStack renders the Markdown on
// save with league/commonmark (tables, task lists and <s> strikethrough), then
// formatHtml() parses it with libxml and adds ids. markdown-it parses the same CommonMark;
// the blocks are written out here with league's line breaks, which the plain text
// export and excerpts keep. WYSIWYG pages already hold the saved HTML.
import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token';
import { formatHtml } from './bookstack-ids';

const markdown = new MarkdownIt({ html: true });
const { escapeHtml, unescapeAll } = markdown.utils;

interface Block {
	token: Token;
	children: Block[];
}

/** Nest markdown-it's flat block tokens. */
function blockTree(tokens: Token[]): Block[] {
	const root: Block[] = [];
	const stack: Block[][] = [root];
	for (const token of tokens) {
		if (token.nesting === -1) {
			stack.pop();
			continue;
		}
		const block = { token, children: [] };
		stack.at(-1)!.push(block);
		if (token.nesting === 1) stack.push(block.children);
	}
	return root;
}

const inline = (block: Block | undefined) =>
	block?.token.type === 'inline' ? markdown.renderer.renderInline(block.token.children ?? [], markdown.options, {}) : '';

const attrs = (token: Token, extra: [string, string][] = []) =>
	[...(token.attrs ?? []), ...extra].map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join('');

// TaskListExtension: "[ ]" or "[x]" opening a list item's first paragraph.
const TASK = /^\[([ xX])\](?=\s)/;
function taskMarker(item: Block): boolean | null {
	const first = item.children[0];
	const text = first?.token.type === 'paragraph_open' ? first.children[0]?.token.children?.[0] : undefined;
	const match = text?.type === 'text' ? text.content.match(TASK) : null;
	if (!match) return null;
	text!.content = text!.content.slice(match[0].length);
	return match[1] !== ' ';
}

const renderBlocks = (blocks: Block[]) => blocks.map(renderBlock).join('\n');

function renderBlock(block: Block): string {
	const { token, children } = block;
	switch (token.type) {
		case 'paragraph_open':
			return token.hidden ? inline(children[0]) : `<p>${inline(children[0])}</p>`;
		case 'heading_open':
			return `<${token.tag}>${inline(children[0])}</${token.tag}>`;
		case 'blockquote_open': {
			const filling = renderBlocks(children);
			return filling ? `<blockquote>\n${filling}\n</blockquote>` : '<blockquote>\n</blockquote>';
		}
		case 'bullet_list_open':
		case 'ordered_list_open':
			return `<${token.tag}${attrs(token)}>\n${renderBlocks(children)}\n</${token.tag}>`;
		case 'list_item_open': {
			const checked = taskMarker(block);
			let contents = renderBlocks(children);
			if (checked !== null) {
				contents = `<input${checked ? ' checked=""' : ''} disabled="" type="checkbox" />${contents}`;
			} else if (contents.startsWith('<')) contents = '\n' + contents;
			if (contents.endsWith('>')) contents += '\n';
			return `<li${checked !== null ? ' class="task-list-item"' : ''}>${contents}</li>`;
		}
		case 'fence': {
			const language = unescapeAll(token.info).trim().split(/\s+/)[0];
			const cls = language ? ` class="language-${escapeHtml(language)}"` : '';
			return `<pre><code${cls}>${escapeHtml(token.content)}</code></pre>`;
		}
		case 'code_block':
			return `<pre><code>${escapeHtml(token.content)}</code></pre>`;
		case 'html_block':
			return token.content.replace(/\n$/, '');
		case 'hr':
			return '<hr />';
		case 'table_open':
		case 'thead_open':
		case 'tbody_open':
		case 'tr_open':
			return `<${token.tag}>\n${renderBlocks(children)}\n</${token.tag}>`;
		case 'th_open':
		case 'td_open': {
			const align = token.attrGet('style')?.match(/text-align:(\w+)/)?.[1];
			return `<${token.tag}${align ? ` align="${align}"` : ''}>${inline(children[0])}</${token.tag}>`;
		}
		case 'inline':
			return inline(block);
		default:
			return renderBlocks(children);
	}
}

export function renderPage(body: string, editor: 'markdown' | 'wysiwyg'): string {
	if (editor === 'wysiwyg') return body;
	const html = renderBlocks(blockTree(markdown.parse(body, {})));
	return formatHtml(html ? html + '\n' : '');
}
