/* Performance budget enforcement */
import { test } from 'node:test';
import assert from 'node:assert';

const BASE = process.env.PRODUCTION_URL || 'https://brierstudios.com';

const BUDGETS = {
  '/': { html: 50_000, js: 50_000, css: 60_000, imageTotal: 2_000_000 },
  '/lilith': { html: 100_000, js: 50_000, css: 60_000, imageTotal: 2_000_000 },
  '/releases': { html: 60_000, js: 50_000, css: 60_000, imageTotal: 2_000_000 },
};

async function getSize(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return { status: res.status, size: buf.byteLength };
}

test('home page total size under budget', async () => {
  const sizes = {};
  const urls = [
    ['/', 'html'],
    ['/styles.css', 'css'],
    ['/script.js', 'js'],
  ];
  let total = 0;
  for (const [path, label] of urls) {
    const r = await getSize(BASE + path);
    sizes[label] = r.size;
    total += r.size;
  }
  console.log('  Page weights:', JSON.stringify(sizes));
  assert.ok(sizes.html <= BUDGETS['/'].html, 'HTML too big: ' + sizes.html);
  assert.ok(sizes.css <= BUDGETS['/'].css, 'CSS too big: ' + sizes.css);
  assert.ok(sizes.js <= BUDGETS['/'].js, 'JS too big: ' + sizes.js);
});

test('home HTML under 50KB', async () => {
  const r = await getSize(BASE + '/');
  assert.ok(r.size <= 50_000, 'HTML ' + r.size + 'b > 50KB');
});

test('CSS under 60KB', async () => {
  const r = await getSize(BASE + '/styles.css');
  assert.ok(r.size <= 60_000, 'CSS ' + r.size + 'b > 60KB');
});

test('main JS under 50KB', async () => {
  const r = await getSize(BASE + '/script.js');
  assert.ok(r.size <= 50_000, 'JS ' + r.size + 'b > 50KB');
});

test('response time under 2s', async () => {
  const t0 = Date.now();
  await fetch(BASE + '/');
  const elapsed = Date.now() - t0;
  console.log('  Home response time:', elapsed + 'ms');
  assert.ok(elapsed < 2000, 'Too slow: ' + elapsed + 'ms');
});

test('TTFB under 800ms', async () => {
  const t0 = Date.now();
  const res = await fetch(BASE + '/');
  await res.text();
  const ttfb = Date.now() - t0;
  console.log('  TTFB:', ttfb + 'ms');
  assert.ok(ttfb < 800, 'TTFB too slow: ' + ttfb + 'ms');
});