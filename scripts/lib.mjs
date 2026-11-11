// Shared by build, validate and check-links: find the source files, parse the YAML content,
// and load the deck engine in a sandbox so slides can be rendered without a browser.
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import YAML from 'yaml';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const src = resolve(root, 'src');

const read = async (rel) => (await readFile(resolve(src, rel), 'utf8')).replace(/\r\n/g, '\n');

/* Recursive, sorted listing of files under src/<dir> with the given extension (posix-style relative paths). */
async function list(dir, ext) {
  let entries;
  try { entries = await readdir(resolve(src, dir), { withFileTypes: true }); } catch { return []; }
  const out = [];
  for (const e of entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) out.push(...await list(rel, ext));
    else if (e.name.endsWith(ext)) out.push(rel);
  }
  return out;
}

/* Content load order: the curriculum first, then each section in reading order, the graph last.
   Inside a section files load in path order, so numeric prefixes control the sequence. */
const SECTIONS = ['layers', 'tech', 'practice', 'closing'];
export async function contentFiles() {
  const all = await list('content', '.yaml');
  const known = new Set(['content/curriculum.yaml', 'content/graph.yaml']);
  const out = ['content/curriculum.yaml'];
  for (const s of SECTIONS) out.push(...all.filter((f) => f.startsWith(`content/${s}/`)));
  out.push('content/graph.yaml');
  const stray = all.filter((f) => !known.has(f) && !SECTIONS.some((s) => f.startsWith(`content/${s}/`)));
  if (stray.length) throw new Error(`Content files outside ${SECTIONS.join(', ')}: ${stray.join(', ')}`);
  return out;
}

/* Engine scripts that run before the content is registered, in order. */
export async function engineFiles() {
  return ['engine/core.js', ...await list('diagrams', '.js'), 'engine/intro.js'];
}

export async function parseContent(files) {
  const docs = [];
  for (const file of files) {
    let data;
    try { data = YAML.parse(await read(file), { prettyErrors: true }); } catch (err) { throw new Error(`${file}: ${err.message}`); }
    if (!data || typeof data !== 'object') throw new Error(`${file}: empty or not a mapping`);
    docs.push({ file, data });
  }
  return docs;
}

/* Everything the bundle needs. `only` limits content to the given files (plus curriculum), for checking one file. */
export async function loadSources({ only } = {}) {
  let files = await contentFiles();
  if (only && only.length) {
    const want = new Set(only.map((f) => f.replace(/\\/g, '/').replace(/^src\//, '')));
    const missing = [...want].filter((f) => !files.includes(f));
    if (missing.length) throw new Error(`Not a content file: ${missing.join(', ')}`);
    files = files.filter((f) => f === 'content/curriculum.yaml' || want.has(f));
  }
  const engine = [];
  for (const path of await engineFiles()) engine.push({ path, code: await read(path) });
  return {
    html: await read('index.html'), css: await read('styles/deck.css'), app: await read('engine/app.js'),
    engine, docs: await parseContent(files)
  };
}

/* Run the engine and register the content in a sandbox. Returns the vm context. */
export function loadDeck(sources) {
  const ctx = vm.createContext({ console });
  for (const s of sources.engine) vm.runInContext(s.code, ctx, { filename: s.path });
  ctx.__content = JSON.stringify(sources.docs);
  vm.runInContext('LOAD_CONTENT(JSON.parse(__content));', ctx);
  return ctx;
}

/* Every slide with its address. `key` is the stable id used in URLs. */
export function allSlides(ctx) {
  const g = (name) => vm.runInContext(name, ctx);
  const out = [];
  const push = (slides, group, file) => slides.forEach((slide, index) => out.push({ slide, index, group, key: group + '/' + slide.id, file }));
  g('DATA').forEach((d, i) => { if (d) push(d.slides, 'l' + String(i + 1).padStart(2, '0')); });
  g('ARCH').forEach((a) => push(a.slides, 'tech/' + a.id));
  g('PRACTICE').forEach((a) => push(a.slides, 'practice/' + a.id));
  push(g('CLOSING'), 'closing');
  return out;
}

export function render(ctx, slide, lang) {
  ctx.__slide = slide; ctx.__lang = lang;
  return vm.runInContext('LANG = __lang; slideHTML(__slide, null)', ctx);
}

export const textOf = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
