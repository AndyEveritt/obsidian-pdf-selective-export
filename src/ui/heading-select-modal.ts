import { App, ButtonComponent, Modal, Setting } from 'obsidian';
import { Outline, OutlineNode, subtree } from '../outline';

const MAX_INDENT = 5;

/**
 * Lets the user tick which parts of a note to export. Each checkbox shows only
 * its own heading's state. Ticking or unticking a heading also applies to all
 * of its subheadings, which can then be changed individually without
 * affecting their parents.
 */
export class HeadingSelectModal extends Modal {
	private readonly excluded: Set<string>;
	private readonly checkboxes = new Map<OutlineNode, HTMLInputElement>();
	private summaryEl!: HTMLElement;
	private continueButton!: ButtonComponent;

	constructor(
		app: App,
		private readonly noteName: string,
		private readonly outline: Outline,
		excluded: ReadonlySet<string>,
		private readonly onSubmit: (excluded: Set<string>) => void,
	) {
		super(app);
		this.excluded = new Set(excluded);
	}

	onOpen(): void {
		this.titleEl.setText('Select headings to export');
		this.modalEl.addClass('pdf-selective-export-modal');
		const { contentEl } = this;

		contentEl.createEl('p', {
			cls: 'pdf-selective-export-caption',
			text: `Choose which parts of “${this.noteName}” to include in the PDF.`,
		});

		new Setting(contentEl)
			.addButton((button) =>
				button.setButtonText('Select all').onClick(() => this.setAll(true)),
			)
			.addButton((button) =>
				button.setButtonText('Select none').onClick(() => this.setAll(false)),
			);

		const listEl = contentEl.createDiv('pdf-selective-export-list');
		for (const node of this.outline.nodes) this.renderRow(listEl, node);

		this.summaryEl = contentEl.createDiv('pdf-selective-export-summary');

		new Setting(contentEl)
			.addButton((button) =>
				button.setButtonText('Cancel').onClick(() => this.close()),
			)
			.addButton((button) => {
				this.continueButton = button
					.setButtonText('Continue to export')
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(this.excluded);
					});
			});

		this.refresh();
	}

	onClose(): void {
		this.contentEl.empty();
		this.checkboxes.clear();
	}

	private renderRow(listEl: HTMLElement, node: OutlineNode): void {
		const row = listEl.createEl('label', {
			cls: [
				'pdf-selective-export-row',
				`pdf-selective-export-depth-${Math.min(node.depth, MAX_INDENT)}`,
			],
		});
		if (node.level === 0) row.addClass('pdf-selective-export-intro');

		const checkbox = row.createEl('input', { type: 'checkbox' });
		checkbox.addEventListener('change', () => {
			for (const n of subtree(node)) {
				if (checkbox.checked) this.excluded.delete(n.key);
				else this.excluded.add(n.key);
			}
			this.refresh();
		});
		this.checkboxes.set(node, checkbox);

		if (node.level > 0) {
			row.createSpan({
				cls: 'pdf-selective-export-level',
				text: `H${node.level}`,
			});
		}
		row.createSpan({ cls: 'pdf-selective-export-label', text: node.label });
	}

	private setAll(included: boolean): void {
		for (const node of this.outline.nodes) {
			if (included) this.excluded.delete(node.key);
			else this.excluded.add(node.key);
		}
		this.refresh();
	}

	private refresh(): void {
		for (const [node, checkbox] of this.checkboxes) {
			checkbox.checked = !this.excluded.has(node.key);
		}

		const total = this.outline.nodes.length;
		const included = this.outline.nodes.filter(
			(n) => !this.excluded.has(n.key),
		).length;
		this.summaryEl.setText(`${included} of ${total} sections selected`);
		this.continueButton.setDisabled(included === 0);
	}
}
