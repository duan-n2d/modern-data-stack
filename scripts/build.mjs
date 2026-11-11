import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'src/index.html');
const outputPath = resolve(root, 'modern-data-stack-deck.html');
const graphContext = { L: (en, vi) => ({ en, vi }) };
runInNewContext(await readFile(resolve(root, 'src/js/intro.js'), 'utf8'), graphContext);
runInNewContext(await readFile(resolve(root, 'src/js/knowledge-graph.js'), 'utf8'), graphContext);
const graphIds = new Set(graphContext.GRAPH_NODES.map((node) => node.id));
if (graphIds.size !== graphContext.GRAPH_NODES.length) throw new Error('Knowledge graph node IDs must be unique');
const layerIds = new Set(graphContext.PATHS.flatMap((path) => path.layers));
for (const node of graphContext.GRAPH_NODES) {
  if (!node.id || !Number.isInteger(node.sec) || !layerIds.has(node.sec)) {
    throw new Error(`Invalid knowledge graph node or layer: ${node.id}`);
  }
}
if ([...layerIds].some((layer) => !graphContext.GRAPH_NODES.some((node) => node.sec === layer))) {
  throw new Error('Every learning layer must have at least one knowledge graph node');
}
for (const edge of graphContext.GRAPH_EDGES) {
  if (!graphIds.has(edge.from) || !graphIds.has(edge.to)) {
    throw new Error(`Knowledge graph edge references an unknown node: ${edge.from} -> ${edge.to}`);
  }
}
const scriptFiles = [
  'core.js',
  'intro.js',
  'sections/layers-01-02.js',
  'sections/layers-03-04.js',
  'sections/layers-05-06.js',
  'sections/layers-07-08.js',
  'sections/layers-09-11.js',
  'sections/layers-12-13.js',
  'sections/layer-14.js',
  'knowledge-graph.js',
  'appendix.js',
  'i18n.js',
  'advanced-topics.js',
  'extensions.js',
  'sections/layer-20.js',
  'practice-scenarios.js',
  'sections/layers-21-23.js',
  'coverage-audit.js',
  'app.js'
];

let html = await readFile(sourcePath, 'utf8');
let styleCount = 0;
const css = await readFile(resolve(root, 'src/styles/deck.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="./styles/deck.css">', () => {
  styleCount++;
  return `<style>\n${css}\n</style>`;
});
if (styleCount !== 1) throw new Error('Expected exactly one stylesheet link in src/index.html');

const scriptTags = [...html.matchAll(/<script src="\.\/js\/([^"]+)"><\/script>/g)];
if (scriptTags.length !== scriptFiles.length) {
  throw new Error(`Expected ${scriptFiles.length} script references, found ${scriptTags.length}`);
}
for (let index = 0; index < scriptTags.length; index++) {
  const expected = `./js/${scriptFiles[index]}`;
  if (scriptTags[index][1] !== scriptFiles[index]) {
    throw new Error(`Script order mismatch at ${index + 1}: expected ${expected}`);
  }
  const code = await readFile(resolve(root, 'src/js', scriptFiles[index]), 'utf8');
  html = html.replace(scriptTags[index][0], () => `<script>\n${code}\n</script>`);
}

if (/<(?:link rel="stylesheet" href="\.\/styles\/|script src="\.\/js\/)/.test(html)) {
  throw new Error('Unbundled source references remain in generated HTML');
}
await writeFile(outputPath, html);
console.log(`Built ${outputPath}`);
