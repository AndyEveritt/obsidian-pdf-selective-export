import { MarkdownView, Modal, TFile, Vault } from 'obsidian';

/*
 * Obsidian's "Export to PDF" is not part of the public API. Internally,
 * MarkdownView.printToPdf() opens a print modal whose print() method reads the
 * note with vault.cachedRead(), renders it with the standard markdown renderer
 * and hands the result to Electron. We reuse all of that and only swap the
 * source text that print() reads, for that one modal and that one file.
 *
 * Verified against Obsidian 1.13.7 and 1.14.4.
 */

interface PrintableMarkdownView extends MarkdownView {
	printToPdf?: () => void;
}

interface PrintModal extends Modal {
	file?: TFile;
	print?: (...args: unknown[]) => Promise<unknown>;
}

export class IncompatibleExportError extends Error {
	constructor() {
		super(
			"This version of Obsidian's PDF export isn't supported. Check for a plugin update.",
		);
	}
}

/**
 * Opens Obsidian's own PDF export dialog for the view's note. When the user
 * exports, the note source is passed through `transform` before rendering.
 */
export function openBuiltInPdfExport(
	view: MarkdownView,
	transform: (source: string) => string,
): void {
	const file = view.file;
	const printToPdf = (view as PrintableMarkdownView).printToPdf;
	if (!file || typeof printToPdf !== 'function') {
		throw new IncompatibleExportError();
	}

	const modal = captureOpenedModal(() => printToPdf.call(view));
	const originalPrint = modal?.print;
	if (!modal || typeof originalPrint !== 'function' || modal.file !== file) {
		modal?.close();
		throw new IncompatibleExportError();
	}

	modal.print = async function (this: PrintModal, ...args: unknown[]) {
		const restore = overrideCachedRead(this.app.vault, file, transform);
		try {
			return await originalPrint.apply(this, args);
		} finally {
			restore();
		}
	};
}

/** Runs `open` and returns the first modal it opens. */
function captureOpenedModal(open: () => void): PrintModal | null {
	const proto = Modal.prototype;
	// eslint-disable-next-line @typescript-eslint/unbound-method -- restored below and always called with the modal as `this`
	const originalOpen = proto.open;
	let captured: PrintModal | null = null;
	const capture = (modal: Modal) => {
		captured ??= modal;
	};
	proto.open = function (this: Modal) {
		capture(this);
		return originalOpen.call(this);
	};
	try {
		open();
	} finally {
		proto.open = originalOpen;
	}
	return captured;
}

/**
 * Makes the next cachedRead() of `target` return transformed content. The
 * override removes itself after that read so other readers of the note are
 * unaffected; the returned function removes it if the read never happens.
 */
function overrideCachedRead(
	vault: Vault,
	target: TFile,
	transform: (source: string) => string,
): () => void {
	const hadOwn = Object.prototype.hasOwnProperty.call(vault, 'cachedRead');
	// eslint-disable-next-line @typescript-eslint/unbound-method -- restored as-is and always called with the vault as `this`
	const original = vault.cachedRead;
	let restored = false;
	const restore = () => {
		if (restored) return;
		restored = true;
		if (hadOwn) vault.cachedRead = original;
		else delete (vault as Partial<Vault>).cachedRead;
	};
	vault.cachedRead = async function (this: Vault, file: TFile) {
		const source = await original.call(this, file);
		if (file.path !== target.path) return source;
		restore();
		return transform(source);
	};
	return restore;
}
