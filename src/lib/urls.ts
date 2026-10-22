// URLs of the static files standing in for BookStack's AJAX endpoints.
import type { Entity } from './bookstack';

/** SearchController::searchSiblings, pre-rendered for each entity. */
export const siblingsUrl = (entity: Entity) => `/search/entity/siblings/${entity.type}-${entity.id}.html`;

/** Export file of an entity, named as BookStack names its downloads. */
export const exportUrl = (entity: Entity, extension: 'html' | 'txt' | 'md') =>
	`${entity.url}export/${encodeURIComponent(entity.slug)}.${extension}`;
