// Content checks. Run by the build; also usable on its own:
//   node scripts/validate.mjs                      check everything
//   node scripts/validate.mjs src/content/x.yaml   check one file (plus the curriculum)
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import { loadSources, loadDeck, allSlides, render, textOf } from './lib.mjs';

/* The ten modules every technology deep dive is measured against. */
export const MODULES = ['overview', 'fundamentals', 'architecture', 'internals', 'config', 'implementation', 'operations', 'troubleshooting', 'performance', 'lab'];

const COMMON = ['id', 'k', 'mod', 't', 'lead', 'n', 'cap', 'refs', 'after'];
const KINDS = {
  cards: { req: ['cards'], opt: ['cols', 'plain'] },
  list: { req: ['items'] },
  table: { req: ['head', 'rows'] },
  code: { req: ['blocks'], opt: ['points'] },
  svg: { req: ['svg'] },
  check: { req: ['left', 'right'] },
  pit: { req: ['rows'] },
  stack: { req: ['parts'] },
  lab: { req: ['scenario', 'input', 'tasks', 'expected', 'rubric', 'design'] },
  model: { req: ['how', 'use', 'input', 'output', 'learned', 'hyper', 'code'] },
  lifecycle: { req: ['steps'] },
  components: { req: ['comps', 'flow', 'ops'] },
  incident: { req: ['sym', 'impact', 'causes', 'evidence', 'diag', 'fix', 'prev', 'post'] },
  coverage: { req: [] }
};
const PART_KEYS = ['table', 'code', 'cards', 'svg', 'split', 'links', 'list', 'text', 'note'];
/* Keys whose values are never shown as prose, so they are not checked for a translation. */
const NEUTRAL = new Set(['id', 'k', 'mod', 'tag', 'lang', 'title', 'code', 'cols', 'color', 'fn', 'refs', 'links', 'plain', 'svg', 'layer', 'layers', 'from', 'to', 'slide', 'requires', 'n_']);
const ID = /^[a-z0-9][a-z0-9-]*$/;
const isBi = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'vi' in v);

/* English prose that should have had a Vietnamese translation: three or more plain lowercase words including
   a function word. Lists of terms ("acks, retries, idempotence") are language-neutral and pass. */
const FUNCTION_WORDS = new Set('the a an and or of to in on for with is are be by from that this it as at not when how what why your you can per into than then each every one no'.split(' '));
export function looksLikeProse(s) {
  const words = String(s).replace(/`[^`]*`/g, ' ').split(/[^A-Za-z']+/).filter(Boolean);
  return words.filter((w) => /^[a-z]{3,}$/.test(w)).length >= 3 && words.some((w) => FUNCTION_WORDS.has(w));
}

const MOJIBAKE = /\u00c3[\u0080-\u00bf\u00a0-\u00bf]|\u00c2[\u0080-\u00bf\u00a0-\u00bf]|\u00e1[\u0080-\u00bf\u00a0-\u00bf]|\u00c4[\u0080-\u00bf\u00a0-\u00bf]|\u00c6[\u0080-\u00bf\u00a0-\u00bf]|\ufffd/;

function checkStrings(v, key, where, errors) {
  if (v == null || NEUTRAL.has(key)) return;
  if (typeof v === 'string') {
    if (MOJIBAKE.test(v)) errors.push(`${where}: text appears mojibaked; repair the source encoding`);
    else if (looksLikeProse(v) && !/[à-ỹÀ-Ỹ]/.test(v)) errors.push(`${where}: "${v.slice(0, 70)}" has no Vietnamese text (write it as {en: ..., vi: ...})`);
  } else if (isBi(v)) {
    const extra = Object.keys(v).filter((k) => k !== 'en' && k !== 'vi');
    if (extra.length || typeof v.en !== 'string' || typeof v.vi !== 'string' || !v.en.trim() || !v.vi.trim()) errors.push(`${where}: bilingual text must be exactly {en, vi} with both filled in`);
    else if (MOJIBAKE.test(v.vi)) errors.push(`${where}.vi: text appears mojibaked; repair the source encoding`);
  } else if (Array.isArray(v)) v.forEach((x, i) => checkStrings(x, key, `${where}[${i}]`, errors));
  else if (typeof v === 'object') for (const k of Object.keys(v)) checkStrings(v[k], k, `${where}.${k}`, errors);
}

function checkParts(parts, where, errors) {
  if (!Array.isArray(parts)) { errors.push(`${where}: must be a list of parts`); return; }
  parts.forEach((p, i) => {
    const kind = PART_KEYS.filter((k) => p && p[k] !== undefined);
    if (kind.length !== 1) { errors.push(`${where}[${i}]: a part needs exactly one of ${PART_KEYS.join(', ')}`); return; }
    if (p.split) p.split.forEach((col, j) => checkParts(col, `${where}[${i}].split[${j}]`, errors));
    if (p.table) checkTable(p.table, `${where}[${i}].table`, errors);
    if (p.code && (typeof p.code.code !== 'string' || !p.code.lang)) errors.push(`${where}[${i}].code: needs lang and code`);
  });
}
function checkTable(t, where, errors) {
  if (!Array.isArray(t.head) || !Array.isArray(t.rows)) { errors.push(`${where}: needs head and rows`); return; }
  t.rows.forEach((r, i) => { if (!Array.isArray(r) || r.length !== t.head.length) errors.push(`${where}: row ${i + 1} has ${Array.isArray(r) ? r.length : 0} cells, the header has ${t.head.length}`); });
}

function checkSlide(s, where, errors) {
  if (!s || typeof s !== 'object') { errors.push(`${where}: slide must be a mapping`); return; }
  if (!s.id || !ID.test(s.id)) errors.push(`${where}: id must be lowercase letters, digits and dashes`);
  const kind = KINDS[s.k];
  if (!kind) { errors.push(`${where}: unknown kind "${s.k}" (use one of ${Object.keys(KINDS).join(', ')})`); return; }
  if (!s.t) errors.push(`${where}: missing title (t)`);
  if (!s.n) errors.push(`${where}: missing speaker notes (n)`);
  for (const k of kind.req) if (s[k] === undefined) errors.push(`${where}: kind "${s.k}" needs "${k}"`);
  const allowed = new Set([...COMMON, ...kind.req, ...(kind.opt || [])]);
  for (const k of Object.keys(s)) if (!allowed.has(k)) errors.push(`${where}: unexpected key "${k}" for kind "${s.k}"`);
  if (s.mod !== undefined) for (const m of [].concat(s.mod)) if (!MODULES.includes(m)) errors.push(`${where}: unknown module "${m}" (use ${MODULES.join(', ')})`);
  if (s.k === 'table') checkTable(s, where, errors);
  if (s.k === 'stack') checkParts(s.parts, `${where}.parts`, errors);
  if (s.after !== undefined) checkParts(s.after, `${where}.after`, errors);
  if (s.k === 'code' && Array.isArray(s.blocks)) s.blocks.forEach((b, i) => { if (typeof b.code !== 'string' || !b.lang) errors.push(`${where}.blocks[${i}]: needs lang and code`); });
  if (s.k === 'lifecycle' && Array.isArray(s.steps)) s.steps.forEach((x, i) => { if (!Array.isArray(x) || x.length !== 3) errors.push(`${where}.steps[${i}]: needs [title, text, where to observe]`); });
  if (s.refs !== undefined && !(Array.isArray(s.refs) && s.refs.every((r) => Array.isArray(r) && r.length === 2 && /^https?:\/\//.test(r[1])))) errors.push(`${where}: refs must be a list of [label, url]`);
  checkStrings(s, null, where, errors);
}

export function validate(sources, { partial = false } = {}) {
  const errors = [], warnings = [];
  const docs = sources.docs;
  const cur = docs.find((d) => d.data.curriculum);
  if (!cur) return { errors: ['content/curriculum.yaml: missing curriculum'], warnings, stats: {} };
  const layerCount = cur.data.curriculum.layers.length;

  /* 1. structure of every file */
  const groups = new Map(); // group key -> { ids:Set, firstFile }
  const techDefs = new Map();
  for (const { file, data } of docs) {
    const heads = ['curriculum', 'graph', 'layer', 'tech', 'practice', 'closing'].filter((k) => data[k] !== undefined);
    if (heads.length !== 1) { errors.push(`${file}: needs exactly one of curriculum, graph, layer, tech, practice, closing`); continue; }
    const head = heads[0];
    if (head === 'curriculum' || head === 'graph') { checkStrings(data[head], null, file, errors); continue; }
    let key;
    if (head === 'layer') {
      if (!Number.isInteger(data.layer) || data.layer < 1 || data.layer > layerCount) { errors.push(`${file}: layer must be 1..${layerCount}`); continue; }
      key = 'l' + String(data.layer).padStart(2, '0');
    } else if (head === 'closing') key = 'closing';
    else {
      const def = data[head];
      if (!def || !def.id || !ID.test(def.id)) { errors.push(`${file}: ${head}.id must be lowercase letters, digits and dashes`); continue; }
      key = head + '/' + def.id;
      if (!groups.has(key) && (!def.name || !def.color)) errors.push(`${file}: the first file of ${key} must set name and color`);
      checkStrings(def, null, `${file} ${head}`, errors);
      if (head === 'tech' && !techDefs.has(def.id)) techDefs.set(def.id, def);
    }
    if (!Array.isArray(data.slides) || !data.slides.length) { errors.push(`${file}: needs a non-empty slides list`); continue; }
    const g = groups.get(key) || { ids: new Map() };
    groups.set(key, g);
    data.slides.forEach((s, i) => {
      const where = `${file} #${(s && s.id) || i + 1}`;
      checkSlide(s, where, errors);
      if (s && s.id) { if (g.ids.has(s.id)) errors.push(`${where}: id is already used in ${g.ids.get(s.id)}`); else g.ids.set(s.id, file); }
    });
  }

  /* 2. curriculum: every layer is on exactly one learning path and has content */
  const onPath = cur.data.curriculum.paths.flatMap((p) => p.layers);
  for (let n = 1; n <= layerCount; n++) {
    const times = onPath.filter((x) => x === n).length;
    if (times !== 1) errors.push(`content/curriculum.yaml: layer ${n} appears on ${times} learning paths (expected 1)`);
    if (!partial && !groups.has('l' + String(n).padStart(2, '0'))) errors.push(`layer ${n} has no content file`);
  }
  if (errors.length) return { errors, warnings, stats: {} };

  /* 3. render every slide in both languages */
  let ctx;
  try { ctx = loadDeck(sources); } catch (err) { return { errors: [`loading content: ${err.message}`], warnings, stats: {} }; }
  const untranslated = new Map();
  ctx.__miss = (s) => { if (looksLikeProse(s) && !/[\u00e0-\u1ef9]/.test(s)) untranslated.set(s, ctx.__where); };
  vm.runInContext('var __tx = tx; tx = function(v){ var r = __tx(v); if(LANG === "vi" && typeof v === "string" && r === v) __miss(v); return r; };', ctx);
  const slides = allSlides(ctx);
  let chars = 0;
  for (const s of slides) {
    ctx.__where = s.key;
    for (const lang of ['en', 'vi']) {
      let html;
      try { html = render(ctx, s.slide, lang); } catch (err) { errors.push(`${s.key}: does not render (${lang}): ${err.message}`); break; }
      const text = textOf(html);
      if (lang === 'en') chars += text.length;
      const bad = /\[object Object\]|\bundefined\b/.exec(text);
      if (bad) errors.push(`${s.key}: rendered text contains "${bad[0]}" (${lang})`);
    }
  }
  for (const [s, where] of untranslated) errors.push(`${where}: diagram or template text "${s.slice(0, 70)}" has no Vietnamese text (use L(en, vi) in the diagram function)`);

  /* 4. knowledge graph */
  if (!partial) {
    const g = (n) => vm.runInContext(n, ctx);
    const nodes = g('GRAPH_NODES'), edges = g('GRAPH_EDGES'), concepts = g('CONCEPTS');
    const ids = new Set();
    for (const n of nodes) {
      if (ids.has(n.id)) errors.push(`graph: duplicate node id ${n.id}`); ids.add(n.id);
      if (!(n.sec >= 0 && n.sec < layerCount)) errors.push(`graph: node ${n.id} points at a layer that does not exist`);
    }
    for (let i = 0; i < layerCount; i++) if (!nodes.some((n) => n.sec === i)) errors.push(`graph: layer ${i + 1} has no node`);
    for (const e of edges) if (!ids.has(e.from) || !ids.has(e.to)) errors.push(`graph: edge ${e.from} -> ${e.to} references an unknown node`);
    const keys = new Set(slides.map((s) => s.key)), cids = new Map();
    for (const n of nodes) for (const k of ['label','description']) if (!n[k] || typeof n[k].en !== 'string' || typeof n[k].vi !== 'string') errors.push(`graph: node ${n.id} needs bilingual ${k}`);
    for (const c of concepts) {
      if (!c.id || !ID.test(c.id)) { errors.push(`graph: concept id "${c.id}" must be lowercase letters, digits and dashes`); continue; }
      if (ids.has(c.id)) errors.push(`graph: concept id ${c.id} duplicates an existing graph node`);
      if (cids.has(c.id)) errors.push(`graph: duplicate concept id ${c.id}`); cids.set(c.id, c);
      if (!(c.layer >= 1 && c.layer <= layerCount)) errors.push(`graph: concept ${c.id} needs a layer 1..${layerCount}`);
      if (!c.slide || !keys.has(c.slide)) errors.push(`graph: concept ${c.id} points at slide "${c.slide}", which does not exist`);
      for (const k of ['label','description']) if (!c[k] || typeof c[k].en !== 'string' || typeof c[k].vi !== 'string') errors.push(`graph: concept ${c.id} needs bilingual ${k}`);
    }
    for (const c of concepts) for (const r of c.requires || []) if (!cids.has(r) && !ids.has(r)) errors.push(`graph: concept ${c.id} requires unknown concept ${r}`);
    const state = new Map();
    const visit = (id, trail) => {
      if (state.get(id) === 2) return; if (state.get(id) === 1) { errors.push(`graph: prerequisite cycle ${[...trail, id].join(' -> ')}`); return; }
      state.set(id, 1); for (const r of (cids.get(id) || {}).requires || []) if (cids.has(r)) visit(r, [...trail, id]); state.set(id, 2);
    };
    for (const id of cids.keys()) visit(id, []);
  }

  /* 5. technology module coverage */
  const coverage = [];
  for (const [id, def] of techDefs) {
    const have = new Set(slides.filter((s) => s.group === 'tech/' + id).flatMap((s) => [].concat(s.slide.mod || [])));
    const missing = MODULES.filter((m) => !have.has(m));
    coverage.push({ id, slides: slides.filter((s) => s.group === 'tech/' + id).length, missing });
    if (id !== 'overview' && missing.length) errors.push(`tech/${id}: missing required module(s): ${missing.join(', ')}`);
  }
  return { errors, warnings, stats: { slides: slides.length, files: docs.length, chars, coverage } };
}

export function printReport(r) {
  for (const w of r.warnings) console.warn('warning: ' + w);
  for (const e of r.errors) console.error('error: ' + e);
  if (r.errors.length) { console.error(`\n${r.errors.length} content error(s).`); return; }
  console.log(`Content OK: ${r.stats.slides} slides in ${r.stats.files} files, ${Math.round(r.stats.chars / 1000)}k characters of English text, both languages complete.`);
  const partial = r.stats.coverage.filter((c) => c.missing.length && c.id !== 'overview');
  if (partial.length) {
    console.log('Technology deep dives still missing template modules:');
    for (const c of partial) console.log(`  ${c.id.padEnd(18)} ${String(c.slides).padStart(2)} slides, missing: ${c.missing.join(', ')}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const only = process.argv.slice(2);
  const report = validate(await loadSources({ only }), { partial: only.length > 0 });
  printReport(report);
  if (report.errors.length) process.exit(1);
}
