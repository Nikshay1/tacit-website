import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';

const root = resolve('dist');
async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (path.endsWith('.html')) result.push(path);
  }
  return result;
}
const files = await walk(root);
const documents = new Map();
const errors = [];
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  documents.set(file, { html, ids });
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${file}: expected one H1`);
  if (!html.includes('<meta name="description"')) errors.push(`${file}: missing page description`);
  if (/href="#"|lorem ipsum|TODO/i.test(html)) errors.push(`${file}: unfinished content`);
}
for (const [file, { html }] of documents) {
  for (const [, value] of html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)) {
    if (/^[a-z]+:|^\/\//i.test(value)) continue;
    const url = new URL(value, 'https://tacit.example/');
    let target = value.startsWith('#') ? file : value.startsWith('/') ? join(root, decodeURIComponent(url.pathname)) : resolve(dirname(file), decodeURIComponent(url.pathname));
    try {
      const meta = await stat(target);
      if (meta.isDirectory()) target = join(target, 'index.html');
      await stat(target);
      if (url.hash && documents.has(target) && !documents.get(target).ids.has(url.hash.slice(1))) errors.push(`${file}: missing anchor ${value}`);
    } catch { errors.push(`${file}: missing target ${value}`); }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Passed: ${files.length} HTML pages; page headings, metadata, local links, assets, and anchors.`);
