import { MarkdownView, Plugin, TFile } from 'obsidian';
import { exportSelectedHeadings } from './commands/export-selected-headings';
import { SelectionStore } from './selection-store';
import {
	DEFAULT_SETTINGS,
	PdfSelectiveExportSettings,
	PdfSelectiveExportSettingTab,
} from './settings';

export default class PdfSelectiveExportPlugin extends Plugin {
	settings!: PdfSelectiveExportSettings;
	selections!: SelectionStore;

	async onload() {
		await this.loadSettings();
		this.selections = new SelectionStore(this);

		this.addCommand({
			id: 'export-pdf-select-headings',
			name: 'Export to PDF (select headings)',
			checkCallback: (checking) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view?.file) return false;
				if (!checking) void exportSelectedHeadings(this, view);
				return true;
			},
		});

		this.addSettingTab(new PdfSelectiveExportSettingTab(this.app, this));

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile) void this.selections.rename(oldPath, file.path);
			}),
		);
		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFile) void this.selections.delete(file.path);
			}),
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<PdfSelectiveExportSettings>,
		);
		this.settings.excludedByPath = { ...this.settings.excludedByPath };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
