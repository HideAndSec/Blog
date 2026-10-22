// Laravel string helpers used in the templates.

/** Str::limit(): cut to a display width, trim the end and add "...". */
export function strLimit(value: string, limit = 100, end = '...'): string {
	const chars = [...value];
	if (chars.length <= limit) return value;
	return chars.slice(0, limit).join('').trimEnd() + end;
}

/** trans_choice() for the ":count Page|:count Pages" strings. */
export const countOf = (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`;

/** nl2br(e($text)) */
export const nl2br = (text: string) =>
	text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
		.replace(/(\r\n|\n\r|\r|\n)/g, '<br />$1');

/** PHP urlencode(): spaces as "+", everything but letters, digits and "-_." escaped. */
export const phpUrlencode = (text: string) =>
	encodeURIComponent(text)
		.replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
		.replace(/%20/g, '+');
