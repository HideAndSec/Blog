// Date formatting as done by Carbon in BookStack. Shared with the browser script
// (public/js/hideandsec.js keeps relative times current after the build).

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Carbon::toDayDateTimeString(), e.g. "Tue, May 5, 2020 10:02 PM" (UTC, like the old server). */
export function dayDateTime(date: Date): string {
	const h = date.getUTCHours();
	const minutes = String(date.getUTCMinutes()).padStart(2, '0');
	return `${DAYS[date.getUTCDay()]}, ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()} ${h % 12 || 12}:${minutes} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Calendar difference between two dates, like PHP's DateTime::diff(). */
function interval(from: Date, to: Date) {
	let [a, b] = from <= to ? [from, to] : [to, from];
	let y = b.getUTCFullYear() - a.getUTCFullYear();
	let m = b.getUTCMonth() - a.getUTCMonth();
	let d = b.getUTCDate() - a.getUTCDate();
	let secs = (b.getUTCHours() - a.getUTCHours()) * 3600 + (b.getUTCMinutes() - a.getUTCMinutes()) * 60 + (b.getUTCSeconds() - a.getUTCSeconds());
	if (secs < 0) {
		secs += 86400;
		d--;
	}
	if (d < 0) {
		d += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate();
		m--;
	}
	if (m < 0) {
		m += 12;
		y--;
	}
	return { y, m, d, h: Math.floor(secs / 3600), i: Math.floor((secs % 3600) / 60), s: secs % 60, past: from <= to };
}

/** Carbon::diffForHumans() with a single part: "6 years ago", "9 hours ago". */
export function diffForHumans(date: Date, now = new Date(), absolute = false): string {
	const iv = interval(date, now);
	const units: [number, string][] = [
		[iv.y, 'year'],
		[iv.m, 'month'],
		[Math.floor(iv.d / 7), 'week'],
		[iv.d, 'day'],
		[iv.h, 'hour'],
		[iv.i, 'minute'],
		[iv.s, 'second'],
	];
	const [count, unit] = units.find(([n]) => n > 0) ?? [1, 'second'];
	const text = `${count} ${unit}${count === 1 ? '' : 's'}`;
	if (absolute) return text;
	return iv.past ? `${text} ago` : `${text} from now`;
}
