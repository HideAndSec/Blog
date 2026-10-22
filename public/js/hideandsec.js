// What the BookStack server used to do for the site, done in the browser instead:
// relative dates, list sorting and views (kept per browser rather than per user),
// expanded details, searches, pagination and self-contained HTML exports.
(function () {
	'use strict';

	var SITE = 'https://hideandsec.sh';

	function store(key, value) {
		try {
			if (value === undefined) return localStorage.getItem(key);
			localStorage.setItem(key, value);
		} catch (e) {
			return null;
		}
	}

	function esc(text) {
		return String(text)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	/** PHP urlencode() */
	function urlencode(text) {
		return encodeURIComponent(text)
			.replace(/[!'()*~]/g, function (c) {
				return '%' + c.charCodeAt(0).toString(16).toUpperCase();
			})
			.replace(/%20/g, '+');
	}

	// --- Relative dates (Carbon::diffForHumans, as in src/lib/time.ts) ------------------------

	function interval(from, to) {
		var past = from <= to;
		var a = past ? from : to;
		var b = past ? to : from;
		var y = b.getUTCFullYear() - a.getUTCFullYear();
		var m = b.getUTCMonth() - a.getUTCMonth();
		var d = b.getUTCDate() - a.getUTCDate();
		var secs =
			(b.getUTCHours() - a.getUTCHours()) * 3600 + (b.getUTCMinutes() - a.getUTCMinutes()) * 60 + (b.getUTCSeconds() - a.getUTCSeconds());
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
		return { y: y, m: m, d: d, h: Math.floor(secs / 3600), i: Math.floor((secs % 3600) / 60), s: secs % 60, past: past };
	}

	function diffForHumans(date, absolute) {
		var iv = interval(date, new Date());
		var units = [
			[iv.y, 'year'],
			[iv.m, 'month'],
			[Math.floor(iv.d / 7), 'week'],
			[iv.d, 'day'],
			[iv.h, 'hour'],
			[iv.i, 'minute'],
			[iv.s, 'second'],
		];
		var unit = [1, 'second'];
		for (var i = 0; i < units.length; i++) {
			if (units[i][0] > 0) {
				unit = units[i];
				break;
			}
		}
		var text = unit[0] + ' ' + unit[1] + (unit[0] === 1 ? '' : 's');
		if (absolute) return text;
		return iv.past ? text + ' ago' : text + ' from now';
	}

	function refreshTimes() {
		document.querySelectorAll('[data-hs-time]').forEach(function (el) {
			var text = diffForHumans(new Date(el.getAttribute('data-hs-time')), el.hasAttribute('data-hs-absolute'));
			el.textContent = (el.getAttribute('data-hs-format') || ':time').replace(':time', text);
		});
	}

	// --- Sorting (entities/sort.blade.php) ----------------------------------------------------------

	function iconHtml(name) {
		var template = document.querySelector('template[data-hs-icon="' + name + '"]');
		return template ? template.innerHTML : '';
	}

	function sortContainer(container, sort, order) {
		var children = Array.prototype.slice.call(container.children);
		var groups = [];
		var separator = null;
		children.forEach(function (child) {
			if (child.hasAttribute('data-hs-sort-default')) groups.push([child]);
			else if (child.tagName === 'HR') separator = separator || child.cloneNode(false);
			else if (groups.length) groups[groups.length - 1].push(child);
		});
		var key = function (group) {
			return group[0].getAttribute('data-hs-sort-' + sort) || '';
		};
		groups.sort(function (a, b) {
			if (sort === 'default') return Number(key(a)) - Number(key(b));
			if (sort === 'name') return key(a).localeCompare(key(b), 'en', { sensitivity: 'base' });
			return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0;
		});
		if (order === 'desc') groups.reverse();
		children.forEach(function (child) {
			if (child.hasAttribute('data-hs-sort-default') || child.tagName === 'HR' || groups.some((g) => g.indexOf(child) > 0)) {
				child.remove();
			}
		});
		var anchor = container.firstChild;
		groups.forEach(function (group, i) {
			if (separator && i > 0) container.insertBefore(separator.cloneNode(false), anchor);
			group.forEach(function (el) {
				container.insertBefore(el, anchor);
			});
		});
	}

	function setupSort(control) {
		var type = control.getAttribute('data-hs-sort-type');
		var sortInput = control.querySelector('input[name="sort"]');
		var orderInput = control.querySelector('input[name="order"]');
		var toggle = control.querySelector('[refs="dropdown@toggle"]');
		var dirButton = control.querySelector('[data-sort-dir]');
		var initial = { sort: sortInput.value, order: orderInput.value };

		function apply(state, save) {
			sortInput.value = state.sort;
			orderInput.value = state.order;
			control.querySelectorAll('[data-sort-value]').forEach(function (link) {
				var active = link.getAttribute('data-sort-value') === state.sort;
				link.parentElement.classList.toggle('active', active);
				if (active) toggle.textContent = link.textContent.trim();
			});
			dirButton.setAttribute(
				'aria-label',
				'Sort Direction Toggle - ' + (state.order === 'asc' ? 'Sort Ascending' : 'Sort Descending'),
			);
			dirButton.innerHTML = iconHtml(state.order === 'desc' ? 'sort-up' : 'sort-down');
			document.querySelectorAll('[data-hs-sortable="' + type + '"]').forEach(function (container) {
				sortContainer(container, state.sort, state.order);
			});
			if (save) store('hs-sort-' + type, JSON.stringify(state));
		}

		control.addEventListener('click', function (event) {
			var link = event.target.closest('[data-sort-value]');
			if (link) {
				event.preventDefault();
				apply({ sort: link.getAttribute('data-sort-value'), order: orderInput.value }, true);
			} else if (event.target.closest('[data-sort-dir]')) {
				event.preventDefault();
				apply({ sort: sortInput.value, order: orderInput.value === 'asc' ? 'desc' : 'asc' }, true);
			}
		});

		var saved = null;
		try {
			saved = JSON.parse(store('hs-sort-' + type) || 'null');
		} catch (e) {}
		if (saved && (saved.sort !== initial.sort || saved.order !== initial.order)) {
			if (control.querySelector('[data-sort-value="' + saved.sort + '"]')) apply(saved, false);
		}
	}

	// --- List / grid views and expanded details -------------------------------------------------------

	function setupViewToggle(form) {
		var type = form.getAttribute('data-hs-view-type');
		form.addEventListener('click', function (event) {
			var button = event.target.closest('[data-hs-switch-to]');
			if (!button) return;
			var view = button.getAttribute('data-hs-switch-to');
			document.documentElement.classList.toggle('hs-grid-' + type, view === 'grid');
			store('hs-view-' + type, view);
		});
	}

	function setupExpandToggle(button) {
		var key = button.getAttribute('data-hs-expand-key');
		var className = 'hs-expanded-' + key;
		var root = document.documentElement;
		button.addEventListener('click', function (event) {
			event.preventDefault();
			var opening = !root.classList.contains(className);
			var targets = document.querySelectorAll(button.getAttribute('hs-expand-toggle'));
			if (opening) root.classList.add(className);
			var done = function () {
				if (!opening) root.classList.remove(className);
			};
			if (!targets.length || !targets[0].animate) return done();
			targets.forEach(function (el, i) {
				var height = el.scrollHeight + 'px';
				var frames = [
					{ height: '0px', overflow: 'hidden' },
					{ height: height, overflow: 'hidden' },
				];
				var animation = el.animate(opening ? frames : frames.reverse(), { duration: 200, easing: 'ease-in-out' });
				if (i === targets.length - 1) animation.onfinish = done;
			});
			store('hs-expand-' + key, opening ? 'yes' : 'no');
		});
	}

	// --- Search (SearchOptions + SearchRunner) --------------------------------------------------------

	var indexPromise = null;
	function loadIndex() {
		indexPromise =
			indexPromise ||
			fetch('/search/index.json').then(function (resp) {
				return resp.json();
			});
		return indexPromise;
	}

	var TYPE_ORDER = ['bookshelf', 'book', 'chapter', 'page'];
	var SEARCH_FACTOR = { bookshelf: 3, book: 2, chapter: 1.3, page: 1 };
	var OPERATORS = ['<=', '>=', '=', '<', '>', 'like', '!='];

	/** SearchOptions::decode() */
	function parseSearch(text) {
		var opts = { searches: [], exacts: [], tags: [], filters: {} };
		var patterns = { exacts: /"(.*?)"/g, tags: /\[(.*?)\]/g, filters: /\{(.*?)\}/g };
		Object.keys(patterns).forEach(function (key) {
			var found = [];
			text = text.replace(patterns[key], function (_, inner) {
				found.push(inner);
				return '';
			});
			if (key === 'filters') {
				found.forEach(function (filter) {
					var i = filter.indexOf(':');
					if (i === -1) opts.filters[filter] = '';
					else opts.filters[filter.slice(0, i)] = filter.slice(i + 1);
				});
			} else opts[key] = found;
		});
		text
			.trim()
			.split(' ')
			.forEach(function (term) {
				if (term !== '') opts.searches.push(term);
			});
		return opts;
	}

	/** SearchOptions::fromRequest() */
	function searchFromQuery(params) {
		if (!params.has('search') && !params.has('term')) return parseSearch('');
		if (params.has('term')) return parseSearch(params.get('term'));
		var opts = { searches: (params.get('search') || '').split(' '), exacts: [], tags: [], filters: {} };
		opts.exacts = params.getAll('exact[]').filter(Boolean);
		opts.tags = params.getAll('tags[]').filter(Boolean);
		params.forEach(function (value, key) {
			var match = key.match(/^filters\[(.+)\]$/);
			if (match && value) opts.filters[match[1]] = value === 'true' ? '' : value;
		});
		var types = params.getAll('types[]');
		if (params.has('types[]') && types.length < 4) opts.filters.type = types.join('|');
		return opts;
	}

	/** SearchOptions::toString() */
	function searchToString(opts) {
		var text = opts.searches.join(' ');
		opts.exacts.forEach(function (term) {
			text += ' "' + term + '"';
		});
		opts.tags.forEach(function (term) {
			text += ' [' + term + ']';
		});
		Object.keys(opts.filters).forEach(function (name) {
			var value = opts.filters[name];
			text += ' {' + name + (value ? ':' + value : '') + '}';
		});
		return text;
	}

	// MySQL's utf8mb4_unicode_ci comparisons ignore case and accents.
	function fold(text) {
		return String(text)
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase();
	}

	function likeToRegExp(pattern) {
		var source = fold(pattern)
			.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
			.replace(/%/g, '.*')
			.replace(/_/g, '.');
		return new RegExp('^' + source + '$', 's');
	}

	/** SearchIndex::generateTermArrayFromText() */
	function termScores(text, adjustment, scores) {
		text.split(/[ \n\t.,!?:;()[\]{}<>`'"]+/).forEach(function (token) {
			if (!token) return;
			var term = fold(token);
			scores.push([term, adjustment]);
		});
	}

	function entityTerms(entity) {
		if (!entity._terms) {
			var factor = SEARCH_FACTOR[entity.type];
			var terms = [];
			termScores(entity.name, Math.trunc(5 * factor), terms);
			termScores(entity.text, Math.trunc(1 * factor), terms);
			entity._terms = terms;
		}
		return entity._terms;
	}

	function compareTag(tagValue, operator, value) {
		var numeric = value !== '' && !isNaN(Number(value)) && operator !== 'like';
		if (numeric) {
			var a = Number(tagValue);
			var b = Number(value);
			if (isNaN(a)) a = 0;
			switch (operator) {
				case '<=':
					return a <= b;
				case '>=':
					return a >= b;
				case '=':
					return a === b;
				case '<':
					return a < b;
				case '>':
					return a > b;
				case '!=':
					return a !== b;
			}
		}
		var x = fold(tagValue);
		var y = fold(value);
		switch (operator) {
			case 'like':
				return likeToRegExp(value).test(x);
			case '=':
				return x === y;
			case '!=':
				return x !== y;
			case '<':
				return x < y;
			case '>':
				return x > y;
			case '<=':
				return x <= y;
			case '>=':
				return x >= y;
		}
		return false;
	}

	/** SearchRunner::applyTagSearch() */
	function tagMatches(entity, tagTerm) {
		var escaped = OPERATORS.map(function (op) {
			return op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}).join('|');
		var split = tagTerm.match(new RegExp('^(.*?)((' + escaped + ')(.*?))?$')) || [tagTerm, tagTerm];
		var name = split[1] || '';
		var operator = split[3] || '';
		var value = split[4] || '';
		return entity.tags.some(function (tag) {
			if (operator && value) {
				if (name && fold(tag.name) !== fold(name)) return false;
				return compareTag(tag.value || '', operator, value);
			}
			return fold(tag.name) === fold(name);
		});
	}

	function dateFilter(input) {
		var date = new Date(input.length <= 10 ? input + 'T00:00:00Z' : input);
		return isNaN(date.getTime()) ? null : date;
	}

	/** SearchRunner::buildEntitySearchQuery() for one entity: null when it does not match. */
	function scoreEntity(entity, opts, users) {
		var score = 0;
		if (opts.searches.length) {
			var prefixes = opts.searches.map(fold);
			entityTerms(entity).forEach(function (row) {
				for (var i = 0; i < prefixes.length; i++) {
					if (row[0].indexOf(prefixes[i]) === 0) {
						score += row[1];
						return;
					}
				}
			});
			if (score === 0) return null;
		}
		for (var i = 0; i < opts.exacts.length; i++) {
			var exact = fold(opts.exacts[i]);
			if (fold(entity.name).indexOf(exact) === -1 && fold(entity.text).indexOf(exact) === -1) return null;
		}
		for (var j = 0; j < opts.tags.length; j++) {
			if (!tagMatches(entity, opts.tags[j])) return null;
		}
		var filters = opts.filters;
		for (var name in filters) {
			var value = filters[name];
			var date;
			switch (name) {
				case 'updated_after':
					if ((date = dateFilter(value)) && new Date(entity.updatedAt) < date) return null;
					break;
				case 'updated_before':
					if ((date = dateFilter(value)) && new Date(entity.updatedAt) >= date) return null;
					break;
				case 'created_after':
					if ((date = dateFilter(value)) && new Date(entity.createdAt) < date) return null;
					break;
				case 'created_before':
					if ((date = dateFilter(value)) && new Date(entity.createdAt) >= date) return null;
					break;
				case 'created_by':
				case 'updated_by':
				case 'owned_by':
					var slug = value === 'me' ? 'guest' : value.trim();
					var field = name === 'created_by' ? 'createdBy' : name === 'updated_by' ? 'updatedBy' : 'ownedBy';
					if (users.has(slug) && entity[field] !== slug) return null;
					break;
				case 'in_name':
				case 'in_title':
					if (fold(entity.name).indexOf(fold(value)) === -1) return null;
					break;
				case 'in_body':
					if (fold(entity.text).indexOf(fold(value)) === -1) return null;
					break;
				case 'is_restricted':
					if (!entity.restricted) return null;
					break;
				case 'viewed_by_me':
					return null;
			}
		}
		return score;
	}

	function runQuery(index, opts, types, where) {
		var users = new Set();
		index.entities.forEach(function (e) {
			['createdBy', 'updatedBy', 'ownedBy'].forEach(function (k) {
				if (e[k]) users.add(e[k]);
			});
		});
		var byType = {};
		types.forEach(function (type) {
			byType[type] = [];
		});
		index.entities.forEach(function (entity) {
			if (!byType[entity.type] || (where && !where(entity))) return;
			var score = scoreEntity(entity, opts, users);
			if (score !== null) byType[entity.type].push({ entity: entity, score: score });
		});
		types.forEach(function (type) {
			byType[type].sort(function (a, b) {
				return opts.searches.length ? b.score - a.score || a.entity.id - b.entity.id : a.entity.id - b.entity.id;
			});
		});
		return byType;
	}

	/** SearchRunner::searchEntities() */
	function searchEntities(index, opts, page, count) {
		var types = TYPE_ORDER;
		if (opts.filters.type !== undefined) types = opts.filters.type.split('|').filter((t) => TYPE_ORDER.indexOf(t) !== -1);
		var byType = runQuery(index, opts, types);
		var results = [];
		var total = 0;
		var hasMore = false;
		types.forEach(function (type) {
			var list = byType[type];
			total += list.length;
			if (list.length > page * count) hasMore = true;
			results = results.concat(list.slice((page - 1) * count, page * count));
		});
		results.sort(function (a, b) {
			return b.score - a.score;
		});
		return { total: total, hasMore: hasMore, results: results.map((r) => r.entity) };
	}

	// --- Entity list markup (entities/list.blade.php) -----------------------------------------------------

	function listItem(entity, icons, showPath, showTags) {
		var path = '';
		if (showPath && entity.book) {
			path = '<span class="text-book">' + esc(entity.book.name) + '</span>';
			if (entity.chapter) {
				path +=
					' <span class="text-muted entity-list-item-path-sep">' +
					icons['chevron-right'] +
					'</span> <span class="text-chapter">' +
					esc(entity.chapter.name) +
					'</span>';
			}
		}
		var tags = '';
		if (showTags && entity.tags.length) {
			tags =
				'<div class="entity-item-tags mt-xs">' +
				entity.tags
					.map(function (tag) {
						return (
							'<div class="tag-item primary-background-light"><div class="tag-name"><span>' +
							icons.tag +
							esc(tag.name) +
							'</span></div>' +
							(tag.value ? '<div class="tag-value"><span>' + esc(tag.value) + '</span></div>' : '') +
							'</div>'
						);
					})
					.join('') +
				'</div>';
		}
		return (
			'<a href="' + esc(entity.url) + '" class="' + entity.type + '  entity-list-item" data-entity-type="' + entity.type +
			'" data-entity-id="' + entity.id + '"><span role="presentation" class="icon text-' + entity.type + '">' + icons[entity.type] +
			'</span><div class="content"><h4 class="entity-list-item-name break-text">' + esc(entity.name) +
			'</h4><div class="entity-item-snippet">' + path + '<p class="text-muted break-text">' + esc(entity.excerpt) + '</p></div>' +
			tags + '</div></a>'
		);
	}

	function entityList(entities, icons, showPath, showTags) {
		if (!entities.length) return '<p class="text-muted empty-text">No items available</p>';
		return (
			'<div class="entity-list ">' +
			entities
				.map(function (e) {
					return listItem(e, icons, showPath, showTags);
				})
				.join('') +
			'</div>'
		);
	}

	// --- The search page (search/all.blade.php) ------------------------------------------------------

	function setupSearchPage(root) {
		var params = new URLSearchParams(location.search);
		var opts = searchFromQuery(params);
		var full = searchToString(opts);
		var page = parseInt(params.get('page') || '0', 10) || 1;

		document.title = 'Search for ' + full + ' | HideAndSec';
		document.querySelectorAll('input[name="term"]').forEach(function (input) {
			input.value = full;
		});
		var form = root.querySelector('form[method="get"]');
		form.querySelector('input[name="search"]').value = opts.searches.join(' ');
		var types = opts.filters.type !== undefined ? opts.filters.type.split('|') : null;
		form.querySelectorAll('input[name="types[]"]').forEach(function (input) {
			input.checked = !types || types[0] === '' || types.indexOf(input.value) !== -1;
		});
		[
			['exact', opts.exacts],
			['tags', opts.tags],
		].forEach(function (list) {
			var table = form.querySelector('[data-hs-term-list="' + list[0] + '"]');
			var model = table.querySelector('[refs="add-remove-rows@model"]');
			list[1].forEach(function (term) {
				var row = model.cloneNode(true);
				row.classList.remove('hidden');
				row.removeAttribute('refs');
				row.querySelector('input').value = term;
				model.parentNode.insertBefore(row, model);
			});
		});
		['updated_after', 'updated_before', 'created_after', 'created_before'].forEach(function (name) {
			var value = opts.filters[name];
			if (!value) return;
			var input = form.querySelector('input[name="filters[' + name + ']"]');
			var row = input.closest('tr');
			input.value = value;
			input.classList.remove('hidden');
			row.querySelector('[refs="optional-input@show"]').classList.add('hidden');
			row.querySelector('[refs="optional-input@remove"]').classList.remove('hidden');
		});

		loadIndex().then(function (index) {
			var found = searchEntities(index, opts, page, 20);
			root.querySelector('[data-hs-search-total]').textContent =
				found.total === 1 ? '1 result found' : found.total + ' total results found';
			root.querySelector('[data-hs-search-results]').innerHTML = entityList(found.results, index.icons, true, true);
			var more = root.querySelector('[data-hs-search-more]');
			more.hidden = !found.hasMore;
			more.querySelector('a').href = '/search/?term=' + urlencode(full) + '&page=' + (page + 1);
		});
	}

	// --- "Search this book / chapter" (entity-search component) ----------------------------------------------

	function setupEntitySearch(container) {
		var ref = function (name) {
			return container.querySelector('[refs="entity-search@' + name + '"]');
		};
		var entityId = Number(container.getAttribute('data-hs-entity-id'));
		var entityType = container.getAttribute('data-hs-entity-type');
		var input = ref('searchInput');

		function clear() {
			ref('searchView').classList.add('hidden');
			ref('contentView').classList.remove('hidden');
			ref('loadingBlock').classList.add('hidden');
			input.value = '';
		}

		function run() {
			var term = input.value.trim();
			if (!term) return clear();
			ref('searchView').classList.remove('hidden');
			ref('contentView').classList.add('hidden');
			ref('loadingBlock').classList.remove('hidden');
			loadIndex().then(function (index) {
				var opts = parseSearch(term);
				var results;
				if (entityType === 'book') {
					var byType = runQuery(index, opts, ['page', 'chapter'], function (e) {
						return e.book && e.book.id === entityId;
					});
					results = byType.page.slice(0, 20).concat(byType.chapter.slice(0, 20));
					results.sort(function (a, b) {
						return b.score - a.score;
					});
					results = results.slice(0, 20);
				} else {
					results = runQuery(index, opts, ['page'], function (e) {
						return e.chapter && e.chapter.id === entityId;
					}).page.slice(0, 20);
				}
				ref('searchResults').innerHTML = entityList(
					results.map(function (r) {
						return r.entity;
					}),
					index.icons,
					false,
					false,
				);
				ref('loadingBlock').classList.add('hidden');
			});
		}

		input.addEventListener('change', run);
		ref('searchForm').addEventListener('submit', function (event) {
			event.preventDefault();
			run();
		});
		ref('clearButton').addEventListener('click', clear);
	}

	// --- Paginated listings -------------------------------------------------------------------------------

	function showListingPage() {
		var blocks = document.querySelectorAll('[data-hs-page]');
		if (!blocks.length) return;
		var page = String(parseInt(new URLSearchParams(location.search).get('page') || '1', 10) || 1);
		var exists = Array.prototype.some.call(blocks, function (el) {
			return el.getAttribute('data-hs-page') === page;
		});
		blocks.forEach(function (el) {
			el.hidden = el.getAttribute('data-hs-page') !== (exists ? page : '1');
		});
	}

	// --- Self-contained HTML exports (ExportFormatter::containHtml) ----------------------------------------

	function toDataUri(url) {
		return fetch(url)
			.then(function (resp) {
				if (!resp.ok) throw new Error(resp.status);
				return resp.blob();
			})
			.then(function (blob) {
				return new Promise(function (resolve) {
					var reader = new FileReader();
					reader.onload = function () {
						resolve(reader.result);
					};
					reader.readAsDataURL(blob);
				});
			});
	}

	function containHtml(html) {
		var sources = {};
		html.replace(/<img[^>]*?src=(["'])(.*?)\1/gi, function (_, q, src) {
			if (src.indexOf(SITE + '/') === 0) sources[src] = null;
			return _;
		});
		var jobs = Object.keys(sources).map(function (src) {
			return toDataUri(src.replace(SITE, location.origin))
				.then(function (uri) {
					sources[src] = uri;
				})
				.catch(function () {});
		});
		return Promise.all(jobs).then(function () {
			return html.replace(/(<img[^>]*?src=)(["'])(.*?)\2/gi, function (match, start, q, src) {
				return sources[src] ? start + q + sources[src] + q : match;
			});
		});
	}

	function setupHtmlExport(link) {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			fetch(link.href)
				.then(function (resp) {
					return resp.text();
				})
				.then(containHtml)
				.then(function (html) {
					var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
					var a = document.createElement('a');
					a.href = url;
					a.download = decodeURIComponent(link.pathname.split('/').pop());
					document.body.appendChild(a);
					a.click();
					a.remove();
					setTimeout(function () {
						URL.revokeObjectURL(url);
					}, 1000);
				});
		});
	}

	// --- Setup --------------------------------------------------------------------------------------------------

	refreshTimes();
	setInterval(refreshTimes, 60000);
	document.querySelectorAll('[hs-list-sort-control]').forEach(setupSort);
	document.querySelectorAll('[hs-view-toggle]').forEach(setupViewToggle);
	document.querySelectorAll('[hs-expand-toggle]').forEach(setupExpandToggle);
	document.querySelectorAll('[hs-entity-search]').forEach(setupEntitySearch);
	document.querySelectorAll('[hs-search-page]').forEach(setupSearchPage);
	document.querySelectorAll('#export-menu a[href$=".html"]').forEach(setupHtmlExport);
	showListingPage();
})();
