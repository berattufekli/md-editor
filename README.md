# MD Editor

A local-first Markdown workspace built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Highlights

- Distraction-light split writing and live preview workspace
- Searchable document library with create, rename, delete, import, and export
- Selection-aware Markdown toolbar and keyboard-friendly native editor
- Local persistence under the existing `md-editor-documents`, `md-editor-settings`, and `md-editor-theme` keys
- Light, dark, and system themes plus typography, wrapping, spellcheck, and preview controls
- Responsive document drawer and Write/Preview tabs for phones
- GFM tables/tasks and syntax highlighting; raw HTML is intentionally not rendered

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm test
npm run lint
npm run build
```

Documents never leave your browser unless you explicitly export them.
