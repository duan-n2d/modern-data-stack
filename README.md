# Modern Data Engineering Deck

The editable source lives in `src/`. The generated standalone presentation is `modern-data-stack-deck.html`.

## Build

Requires Node.js 20 or newer. From the repository root, run:

```sh
node scripts/build.mjs
```

The build inlines the stylesheet and ordered JavaScript source files into the standalone HTML. Edit files under `src/` and rebuild; do not make source changes only in the generated HTML.

## Interactive knowledge graph

The graph data is in `src/js/knowledge-graph.js`, separate from the renderer. Add a node with a stable `id`, a zero-based `sec` matching its destination layer (`0` is layer 1), and bilingual `label` and `description` values using `L(en, vi)`. Add a relationship with `from`, `to`, and a bilingual `relation`. Both endpoints must match existing node IDs. The graph validates against the 23 learning layers at build/test time; no external RAG service is required.
