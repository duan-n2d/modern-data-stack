import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { root, src } from './lib.mjs';

const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (['.yaml', '.yml', '.js'].includes(extname(file))) files.push(file);
  }
}
await walk(src);

const found = new Map();
const urlPattern = /https?:\/\/[A-Za-z0-9._~:/?#\[\]@!$&'*+,;=%-]+/g;
for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(urlPattern)) {
    const value = match[0].replace(/[.,;:\]]+$/, '');
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      if (url.hostname.endsWith('.example') || url.hostname === 'example.com' || url.hostname === 'api.example.com' || url.hostname === 'api.crm.example.com' || ['localhost','polaris','minio','schema-registry'].includes(url.hostname)) continue;
      const list = found.get(url.href) || [];
      list.push(relative(root, file)); found.set(url.href, list);
    } catch { console.error(`Invalid URL in ${relative(root, file)}: ${value}`); process.exitCode = 1; }
  }
}

const urls = [...found.keys()];
const concurrency = 8, timeoutMs = 12000;
let next = 0;
const failures = [];
async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: {'user-agent':'modern-data-stack-link-check/1.0'} });
    if ([403, 405, 501].includes(response.status)) {
      response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: {'user-agent':'modern-data-stack-link-check/1.0','range':'bytes=0-0'} });
      if (response.body) await response.body.cancel();
    }
    if (!response.ok) failures.push(`${response.status} ${url} (${found.get(url).join(', ')})`);
  } catch (err) {
    failures.push(`${err.name === 'AbortError' ? 'timeout' : err.message} ${url} (${found.get(url).join(', ')})`);
  } finally { clearTimeout(timer); }
}
async function worker() { while (next < urls.length) await check(urls[next++]); }
await Promise.all(Array.from({length:Math.min(concurrency, urls.length)}, worker));
if (failures.length) {
  failures.forEach((failure) => console.error(`Unreachable link: ${failure}`));
  process.exitCode = 1;
} else console.log(`Links OK: checked ${urls.length} unique URLs from ${files.length} source files.`);
