# Start here

This vault is for testing the **Selective PDF export** plugin by hand.

## Setup

1. Run `npm run build` (or `npm run dev`) in the plugin repo. The build copies `main.js`, `manifest.json` and `styles.css` into `.obsidian/plugins/pdf-selective-export/` in this vault.
2. Open this folder as a vault in Obsidian.
3. When asked, select **Trust author and enable plugins**. Otherwise, go to **Settings → Community plugins**, turn off restricted mode and enable **Selective PDF export**.
4. After rebuilding, reload the plugin (turn it off and on) or run **Reload app without saving**.

## How to export

1. Open a note from `Test notes/`.
2. Open the command palette and run **Selective PDF export: Export to PDF (select headings)**.
3. Untick the sections you want to leave out, then select **Continue to export**.
4. Obsidian's normal **Export to PDF** dialog opens. Choose the options and select **Export to PDF**.

Exported PDFs saved inside this vault are ignored by git.

## Test checklist

### Selection

- [ ] Unticking a heading unticks all of its subheadings.
- [ ] Ticking or unticking a subheading leaves its parent heading unchanged.
- [ ] **Select all** and **Select none** work, and **Continue to export** is disabled when nothing is ticked.
- [ ] The section count under the list updates.
- [ ] `No headings` shows a notice instead of the picker.

### Output (compare with the built-in **Export to PDF**)

- [ ] [[Project report]]: excluded sections are missing; everything else looks the same as the built-in export (theme, callouts, table, code, maths, image, embeds).
- [ ] [[Project report]]: the **Include file name as title** option still works.
- [ ] [[Deep nesting]]: excluding an H2 removes its H3–H6 content; re-ticking an H4 keeps only that H4 (and its own children).
- [ ] [[Duplicate headings]]: excluding the second "Notes" leaves the first and third.
- [ ] [[Tricky syntax]]: `#` lines in code blocks are not listed as headings, and setext headings are.
- [ ] [[Project report]]: the intro ("Content before the first heading") can be left out on its own.
- [ ] [[Tricky syntax]]: H2s stay purple in the PDF (frontmatter `cssclasses` still applies with sections excluded).
- [ ] Headings inside embedded notes are not listed; embeds render in full when their section is included.

### Persistence

- [ ] Re-running the command on the same note restores the last selection.
- [ ] Renaming a note keeps its selection.
- [ ] Turning off **Remember selections** in the plugin settings resets to everything ticked.
- [ ] Running the built-in **Export to PDF** afterwards exports the whole note (nothing stays filtered).
