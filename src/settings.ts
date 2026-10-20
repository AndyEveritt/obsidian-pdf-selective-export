import { App, PluginSettingTab, Setting } from 'obsidian';
import type PdfSelectiveExportPlugin from './main';

export interface PdfSelectiveExportSettings {
	rememberSelections: boolean;
	/** Outline keys left out of the export, by note path. */
	excludedByPath: Record<string, string[]>;
}

export const DEFAULT_SETTINGS: PdfSelectiveExportSettings = {
	rememberSelections: true,
	excludedByPath: {},
};

export class PdfSelectiveExportSettingTab extends PluginSettingTab {
	plugin: PdfSelectiveExportPlugin;

	constructor(app: App, plugin: PdfSelectiveExportPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Remember selections')
			.setDesc(
				'Keep each note’s heading selection for its next export. Turning this off forgets all saved selections.',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.rememberSelections)
					.onChange(async (value) => {
						this.plugin.settings.rememberSelections = value;
						if (!value) this.plugin.settings.excludedByPath = {};
						await this.plugin.saveSettings();
						this.display();
					}),
			);

		const savedCount = Object.keys(this.plugin.settings.excludedByPath).length;
		new Setting(containerEl)
			.setName('Saved selections')
			.setDesc(`${savedCount} note(s) have a saved selection.`)
			.addButton((button) =>
				button
					.setButtonText('Forget all')
					.setDisabled(savedCount === 0)
					.onClick(async () => {
						this.plugin.settings.excludedByPath = {};
						await this.plugin.saveSettings();
						this.display();
					}),
			);
	}
}
