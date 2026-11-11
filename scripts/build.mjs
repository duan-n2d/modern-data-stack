// Build the standalone deck: validate the content, then inline CSS, engine, diagrams and content into one HTML file.
//   node scripts/build.mjs            validate and build dist/
//   node scripts/build.mjs --watch    rebuild whenever something under src/ changes
import { mkdir, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { resolve } from 'node:path';
import { loadSources, root, src } from './lib.mjs';
import { validate, printReport } from './validate.mjs';

const outDir = resolve(root, 'dist');
// index.html is the site root; the second name keeps previously shared links working.
const outputs = ['index.html', 'modern-data-stack-deck.html'];
const script = (code) => `<script>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`;
// JSON is valid JavaScript once "<" and the two line separators are escaped.
const BS = String.fromCharCode(92); // backslash
const LINE_SEPARATORS =new RegExp('[' + String.fromCharCode(0x2028, 0x2029) + ']', 'g');
const embed = (value) => JSON.stringify(value).replace(/</g, BS + 'u003c').replace(LINE_SEPARATORS, (c) => BS + 'u' + c.charCodeAt(0).toString(16));

async function build() {
  const sources = await loadSources();
  const report = validate(sources);
  printReport(report);
  if (report.errors.length) return false;

  const once = (html, marker, replacement) => {
    if (html.split(marker).length !== 2) throw new Error(`src/index.html must contain ${marker} exactly once`);
    return html.replace(marker, () => replacement);
  };
  let html = once(sources.html, '<!-- build:css -->', `<style>\n${sources.css}\n</style>`);
  html = once(html, '<!-- build:js -->', [
    ...sources.engine.map((s) => script(s.code)),
    script(`LOAD_CONTENT(${embed(sources.docs)});`),
    script(sources.app)
  ].join('\n'));

  await mkdir(outDir, { recursive: true });
  for (const name of outputs) await writeFile(resolve(outDir, name), html);
  console.log(`Built dist/${outputs[0]} (${Math.round(html.length / 1024)} KB)`);
  return true;
}

if (process.argv.includes('--watch')) {
  let timer = null;
  const run = () => build().catch((err) => console.error(err.message));
  await run();
  watch(src, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(run, 150); });
  console.log('Watching src/ for changes. Open dist/index.html in a browser.');
} else {
  let ok = false;
  try { ok = await build(); } catch (err) { console.error('error: ' + err.message); }
  if (!ok) process.exit(1);
}
