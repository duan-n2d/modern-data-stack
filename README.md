# Modern Data Engineering Deck

Live site: https://duan-n2d.github.io/modern-data-stack/

This repository contains a browser-based presentation deck on modern data engineering, from fundamentals through senior-level architecture and platform design. The editable source lives in `src/`. The build writes a standalone presentation to `dist/index.html` and a copy at `dist/modern-data-stack-deck.html` so older links keep working. `dist/` is not committed; GitHub Actions builds and deploys it on every push to `main`.

## Overview

The deck is built as a static HTML/CSS/JavaScript project:

- `src/index.html` is the source document
- `src/styles/` contains the deck styling
- `src/js/` contains the application logic and rendering code
- `src/content/` contains the slide and knowledge graph data
- `scripts/build.mjs` bundles the source into self-contained HTML files

## Requirements

- Node.js 20 or newer

## Build

From the repository root, run:

```sh
node scripts/build.mjs
```

The build inlines the stylesheet and ordered JavaScript source files into the standalone HTML files. Edit files under `src/` and rebuild; do not edit the generated HTML. Open `dist/index.html` in a browser to preview.

## Development workflow

- Edit content under `src/`
- Rebuild after changes with `node scripts/build.mjs`
- Do not modify only the generated HTML files as the source of truth

To preview the deck locally, serve the generated output:

```sh
python -m http.server 8000 --directory dist
```

Then open `http://localhost:8000/`.

## Interactive knowledge graph

The graph data is in `src/content/graph.yaml`, separate from the renderer. Add a node with a stable `id`, a zero-based `sec` matching its destination layer (`0` is layer 1), and bilingual `label` and `description` values. Add a relationship with `from`, `to`, and a bilingual `relation`. Both endpoints must match existing node IDs. The graph validates against the 23 learning layers at build/test time; no external RAG service is required.

Slides use stable hashes such as `#/l03/storage-formats` rather than numeric slide URLs. Content is loaded from YAML and rendered only when a slide is first opened; search and the built-in translation audit may intentionally render all slides when invoked.

## Project purpose

The deck is designed as a practical learning resource for data engineers and platform builders, covering topics such as data architecture, warehousing, pipelines, orchestration, governance, reliability, and senior-level engineering practices.
