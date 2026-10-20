import { MarkdownView, Notice } from 'obsidian';
import type PdfSelectiveExportPlugin from '../main';
import { openBuiltInPdfExport } from '../export/builtin-pdf-export';
import { buildOutline, filterSource } from '../outline';
import { HeadingSelectModal } from '../ui/heading-select-modal';

export async function exportSelectedHeadings(
	plugin: PdfSelectiveExportPlugin,
	view: MarkdownView,
): Promise<void> {
	const { app } = plugin;
	const file = view.file;
	if (!file) return;

	let outline;
	try {
		const source = await app.vault.cachedRead(file);
		outline = buildOutline(source, app.metadataCache.getFileCache(file));
	} catch (error) {
		showError(error);
		return;
	}
	if (outline.headingCount === 0) {
		new Notice('This note has no headings to select.');
		return;
	}

	const saved = plugin.selections.get(file.path, outline);
	new HeadingSelectModal(app, file.basename, outline, saved, (excluded) => {
		void plugin.selections.set(file.path, outline, excluded);
		try {
			openBuiltInPdfExport(view, (source) => {
				try {
					return filterSource(
						source,
						app.metadataCache.getFileCache(file),
						excluded,
					);
				} catch (error) {
					showError(error);
					throw error;
				}
			});
		} catch (error) {
			showError(error);
		}
	}).open();
}

function showError(error: unknown): void {
	console.error(error);
	new Notice(error instanceof Error ? error.message : String(error));
}
