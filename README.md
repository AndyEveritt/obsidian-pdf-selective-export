# Selective PDF export

Choose which headings to include when you export a note to PDF.

The plugin uses Obsidian's own **Export to PDF**, so the PDF looks the same as a normal export: same theme, CSS snippets, embeds, maths, callouts and export options. The only difference is that the sections you leave out are removed before the note is rendered.

## Usage

1. Open a note.
2. Run **Export to PDF (select headings)** from the command palette.
3. Untick the sections you don't want. Ticking or unticking a heading does the same to its subheadings; you can then change any of them on their own without affecting the heading above. Content before the first heading is listed as **Content before the first heading**.
4. Select **Continue to export**, then use Obsidian's export dialog as usual.

Each heading controls its own text, up to the next heading of any level. Frontmatter is always kept, so `cssclasses` and properties still apply.

Your selection is remembered per note (it moves with the note when you rename it). Turn this off in **Settings → Selective PDF export**.

## Limitations

- Desktop only, like Obsidian's PDF export.
- Obsidian's PDF export is not a public API. The plugin hooks into its internals (tested on Obsidian 1.13.7 and 1.14.4). If a future Obsidian version changes them, the plugin shows a notice instead of exporting the wrong content.
- Footnotes and reference-style links are removed with the section that defines them.

## Development

```bash
npm install
npm run dev     # watch mode
npm run build   # type-check and production build
npm run lint
```

Every build also installs the plugin into `demo-vault/`. Open that folder as a vault in Obsidian and follow `Start here.md` to test it by hand.

## Privacy

The plugin works entirely offline. It stores only your heading selections, in its own `data.json`.
