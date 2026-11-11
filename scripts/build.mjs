import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { pages, renderPage } from '../src/site.mjs';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await cp('src/style.css', 'dist/style.css');
await cp('src/app.js', 'dist/app.js');
await cp('src/motion.css', 'dist/motion.css');
await cp('src/motion.js', 'dist/motion.js');
for (const page of pages) {
  const dir = page.path === '/' ? 'dist' : `dist${page.path}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, renderPage(page));
}
await writeFile('dist/404.html', renderPage({ path: '/404/', title: 'Page not found', description: 'Find your way back to Tacit.', content: '<section class="page-hero container"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>Let’s get you<br>back in context.</h1><p>This page doesn’t exist. Your next answer might be on our homepage.</p><a class="btn solid" href="/">Back to Tacit <span>↗</span></a></section>' }));
console.log(`Built ${pages.length} pages, a 404 page, and local assets in dist/.`);
