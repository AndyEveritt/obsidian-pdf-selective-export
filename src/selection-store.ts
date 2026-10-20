import type PdfSelectiveExportPlugin from './main';
import type { Outline } from './outline';

/** Persists which outline keys each note leaves out of its export. */
export class SelectionStore {
	constructor(private readonly plugin: PdfSelectiveExportPlugin) {}

	private get byPath(): Record<string, string[]> {
		return this.plugin.settings.excludedByPath;
	}

	get(path: string, outline: Outline): Set<string> {
		const known = new Set(outline.nodes.map((n) => n.key));
		return new Set((this.byPath[path] ?? []).filter((key) => known.has(key)));
	}

	async set(path: string, outline: Outline, excluded: ReadonlySet<string>): Promise<void> {
		if (!this.plugin.settings.rememberSelections) return;
		// Only keep keys that still exist, so renamed or deleted headings don't pile up.
		const keys = outline.nodes.map((n) => n.key).filter((key) => excluded.has(key));
		if (keys.length > 0) this.byPath[path] = keys;
		else delete this.byPath[path];
		await this.plugin.saveSettings();
	}

	async rename(oldPath: string, newPath: string): Promise<void> {
		const keys = this.byPath[oldPath];
		if (!keys) return;
		delete this.byPath[oldPath];
		this.byPath[newPath] = keys;
		await this.plugin.saveSettings();
	}

	async delete(path: string): Promise<void> {
		if (!(path in this.byPath)) return;
		delete this.byPath[path];
		await this.plugin.saveSettings();
	}
}
