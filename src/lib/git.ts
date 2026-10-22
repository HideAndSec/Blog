// Dates and authors of content files from the git history, so a page needs no
// frontmatter.

import { execFileSync } from 'node:child_process';

export interface Commit {
	date: Date;
	author: string;
	email: string;
}

/** Commits touching each file under `dir`, newest first, keyed by repository path. */
export function fileHistory(dir: string): Map<string, Commit[]> {
	let log: string;
	try {
		log = execFileSync('git', ['-c', 'core.quotePath=false', 'log', '--format=%x00%aI%x1f%an%x1f%ae', '--name-only', '--', dir], {
			encoding: 'utf8',
			maxBuffer: 1 << 28,
			stdio: ['ignore', 'pipe', 'ignore'],
		});
	} catch {
		return new Map(); // not a git checkout
	}
	const history = new Map<string, Commit[]>();
	for (const entry of log.split('\0').slice(1)) {
		const [header, ...files] = entry.split('\n');
		const [date, author, email] = header.split('\x1f');
		const commit = { date: new Date(date), author, email };
		for (const file of files) {
			if (!file) continue;
			if (!history.has(file)) history.set(file, []);
			history.get(file)!.push(commit);
		}
	}
	return history;
}
