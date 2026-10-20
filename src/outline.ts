import type { CachedMetadata } from 'obsidian';

/** Key used for the content between the frontmatter and the first heading. */
export const INTRO_KEY = '\u0000intro';

/**
 * A selectable part of the note. Each node owns the lines from its heading up
 * to the next heading of any level, so excluding a node never removes its
 * subheadings on its own; the UI cascades selection to children instead.
 */
export interface OutlineNode {
	key: string;
	label: string;
	/** Heading level 1-6, or 0 for the intro. */
	level: number;
	/** Depth in the tree, used for indentation. */
	depth: number;
	/** First line owned by this node (inclusive). */
	startLine: number;
	/** Line after the last line owned by this node (exclusive). */
	endLine: number;
	children: OutlineNode[];
}

export interface Outline {
	roots: OutlineNode[];
	/** All nodes in document order. */
	nodes: OutlineNode[];
	headingCount: number;
}

const ATX_HEADING = /^(?:\s{0,3}>)*\s{0,3}#{1,6}(?:\s|$)/;
const SETEXT_UNDERLINE = /^(?:\s{0,3}>)*\s{0,3}(?:=+|-+)\s*$/;

/**
 * Builds the selectable outline of a note from its source and metadata cache.
 * Throws if the cache no longer matches the source, so a stale cache can never
 * cause the wrong lines to be dropped from an export.
 */
export function buildOutline(
	source: string,
	cache: CachedMetadata | null,
): Outline {
	const lines = source.split('\n');
	const headings = [...(cache?.headings ?? [])].sort(
		(a, b) => a.position.start.line - b.position.start.line,
	);

	for (const heading of headings) {
		const line = heading.position.start.line;
		const isAtx = ATX_HEADING.test(lines[line] ?? '');
		const isSetext = SETEXT_UNDERLINE.test(lines[line + 1] ?? '');
		if (!isAtx && !isSetext) {
			throw new Error(
				'The note changed while exporting. Wait a moment and try again.',
			);
		}
	}

	const contentStart = cache?.frontmatterPosition
		? cache.frontmatterPosition.end.line + 1
		: 0;
	const firstHeadingLine = headings[0]?.position.start.line ?? lines.length;

	const roots: OutlineNode[] = [];
	const nodes: OutlineNode[] = [];

	const introHasContent = lines
		.slice(contentStart, firstHeadingLine)
		.some((line) => line.trim() !== '');
	if (introHasContent) {
		const intro: OutlineNode = {
			key: INTRO_KEY,
			label: 'Content before the first heading',
			level: 0,
			depth: 0,
			startLine: contentStart,
			endLine: firstHeadingLine,
			children: [],
		};
		roots.push(intro);
		nodes.push(intro);
	}

	// Stack of open ancestors, plus how many times each child label has been
	// seen under them so duplicate headings get distinct keys.
	const stack: { node: OutlineNode; seen: Map<string, number> }[] = [];
	const rootSeen = new Map<string, number>();

	headings.forEach((heading, i) => {
		while (stack.length > 0 && stack[stack.length - 1]!.node.level >= heading.level) {
			stack.pop();
		}
		const parent = stack[stack.length - 1];
		const seen = parent?.seen ?? rootSeen;
		const occurrence = (seen.get(heading.heading) ?? 0) + 1;
		seen.set(heading.heading, occurrence);

		const segment =
			occurrence > 1 ? `${heading.heading}[${occurrence}]` : heading.heading;
		const node: OutlineNode = {
			key: parent ? `${parent.node.key}\n${segment}` : segment,
			label: heading.heading,
			level: heading.level,
			depth: stack.length,
			startLine: heading.position.start.line,
			endLine: headings[i + 1]?.position.start.line ?? lines.length,
			children: [],
		};

		(parent ? parent.node.children : roots).push(node);
		nodes.push(node);
		stack.push({ node, seen: new Map() });
	});

	return { roots, nodes, headingCount: headings.length };
}

/** Returns the note source with the lines of every excluded node removed. */
export function filterSource(
	source: string,
	cache: CachedMetadata | null,
	excluded: ReadonlySet<string>,
): string {
	const lines = source.split('\n');
	const keep = lines.map(() => true);
	for (const node of buildOutline(source, cache).nodes) {
		if (!excluded.has(node.key)) continue;
		for (let line = node.startLine; line < node.endLine; line++) {
			keep[line] = false;
		}
	}
	return lines.filter((_, i) => keep[i]).join('\n');
}

/** Collects a node and all of its descendants. */
export function subtree(node: OutlineNode): OutlineNode[] {
	return [node, ...node.children.flatMap(subtree)];
}
