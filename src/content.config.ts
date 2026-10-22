import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Content mirrors BookStack's structure:
//   src/content/shelves/<shelf>.md
//   src/content/books/<book>/index.md
//   src/content/books/<book>/chapter/<chapter>.md
//   src/content/books/<book>/page/<page>.md

const tag = z.object({ name: z.string(), value: z.string().optional() });

// Fields shared by every entity. `id` is the old BookStack id; it is used in
// /link/<id> permalinks and for the imported activity history.
const entity = z.object({
	title: z.string(),
	slug: z.string(),
	id: z.number().optional(),
	createdAt: z.coerce.date(),
	createdBy: z.string().optional(),
	updatedAt: z.coerce.date(),
	updatedBy: z.string().optional(),
	ownedBy: z.string().optional(),
	restricted: z.boolean().default(false),
	tags: z.array(tag).default([]),
	views: z.number().default(0),
});

// Ids are file paths: slugs are only unique within a book.
const byPath = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

export const collections = {
	shelves: defineCollection({
		loader: glob({ pattern: '*.md', base: './src/content/shelves', generateId: byPath }),
		schema: entity.extend({
			description: z.string().optional(),
			cover: z.string().optional(),
			books: z.array(z.string()).default([]),
		}),
	}),
	books: defineCollection({
		loader: glob({ pattern: '*/index.md', base: './src/content/books', generateId: ({ entry }) => entry.split('/')[0] }),
		schema: entity.extend({
			description: z.string().optional(),
			cover: z.string().optional(),
		}),
	}),
	chapters: defineCollection({
		loader: glob({ pattern: '*/chapter/*.md', base: './src/content/books', generateId: byPath }),
		schema: entity.extend({
			description: z.string().optional(),
			priority: z.number().default(0),
		}),
	}),
	// A page can be a bare Markdown file: whatever the frontmatter leaves out is filled
	// in by src/lib/bookstack.ts (title from the first "# " heading, slug from the file
	// name, dates and authors from git, order by creation date).
	pages: defineCollection({
		loader: glob({ pattern: '*/page/*.md', base: './src/content/books', generateId: byPath }),
		schema: entity.extend({
			title: z.string().optional(),
			slug: z.string().optional(),
			createdAt: z.coerce.date().optional(),
			updatedAt: z.coerce.date().optional(),
			/** Shorthand for createdBy: a user slug or a display name. */
			author: z.string().optional(),
			chapter: z.string().optional(),
			priority: z.number().optional(),
			editor: z.enum(['markdown', 'wysiwyg']).default('markdown'),
			revisionCount: z.number().optional(),
		}),
	}),
};
