/* E2E smoke tests — runs against deployed site (use PRODUCTION_URL env) */
import { test } from 'node:test';
import assert from 'node:assert';

const BASE = process.env.PRODUCTION_URL || 'https://brierstudios.com';
const WORKER = process.env.WORKER_URL || 'https://contact.brierstudios.com';

async function get(url, opts = {}) {
  const res = await fetch(url, { redirect: 'manual', ...opts });
  return res;
}

test('home page returns 200', async () => {
  const res = await get(BASE + '/');
  assert.ok(res.status === 200, 'home 200, got ' + res.status);
});

test('home has key markers', async () => {
  const res = await get(BASE + '/');
  const html = await res.text();
  assert.ok(html.includes('BrierStudios'), 'has brand name');
  assert.ok(html.includes('cf-turnstile'), 'has Turnstile widget');
});

test('sitemap.xml is valid XML', async () => {
  const res = await get(BASE + '/sitemap.xml');
  const xml = await res.text();
  assert.ok(xml.startsWith('<?xml'), 'starts with XML');
  assert.ok(xml.includes('<urlset'), 'has urlset');
  assert.ok(xml.includes('<loc>'), 'has loc elements');
});

test('releases.xml is valid RSS', async () => {
  const res = await get(BASE + '/releases.xml');
  const xml = await res.text();
  assert.ok(xml.startsWith('<?xml'), 'XML declaration');
  assert.ok(xml.includes('<rss'), 'rss root');
  assert.ok(xml.includes('<channel>'), 'channel');
});

test('manifest.json parses', async () => {
  const res = await get(BASE + '/manifest.json');
  const m = await res.json();
  assert.ok(m.name, 'has name');
});

test('all public pages return 200 (or 308 for trailing slash)', async () => {
  const paths = [
    '/', '/lilith', '/releases', '/blog/', '/blog/yggdrasil-cli-v2-5-release.html',
    '/faq', '/components', '/animations', '/roadmap', '/support',
    '/templates', '/search', '/newsletter', '/status', '/404',
  ];
  for (const p of paths) {
    const res = await get(BASE + p);
    assert.ok(res.status === 200 || res.status === 308, p + ' expected 200 or 308, got ' + res.status);
  }
});

test('Worker status endpoint', async () => {
  const res = await get(WORKER + '/status');
  const data = await res.json();
  assert.ok(data.status, 'has status');
  assert.ok(data.checks, 'has checks');
  assert.ok(data.checks.worker === 'up', 'worker is up');
});

test('Worker category RSS feed', async () => {
  const res = await get(WORKER + '/feed/cli.xml');
  const xml = await res.text();
  assert.ok(xml.includes('<rss'), 'has rss');
  assert.ok(xml.includes('Yggdrasil CLI'), 'has CLI post');
});

test('Worker pixel endpoint', async () => {
  const res = await get(WORKER + '/pixel.gif');
  const buf = new Uint8Array(await res.arrayBuffer());
  // GIF magic: 47 49 46 38 (GIF8)
  assert.deepEqual(Array.from(buf.slice(0, 4)), [0x47, 0x49, 0x46, 0x38], 'GIF magic bytes');
});

test('Worker admin requires auth', async () => {
  const res = await get(WORKER + '/admin/vitals');
  assert.strictEqual(res.status, 401, 'should be 401 without token');
});

test('Worker newsletter validation', async () => {
  const res = await fetch(WORKER + '/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  assert.strictEqual(res.status, 400, 'should reject invalid email');
});

test('Security headers present', async () => {
  const res = await get(BASE + '/');
  assert.ok(res.headers.get('strict-transport-security'), 'HSTS');
  assert.ok(res.headers.get('x-content-type-options'), 'X-Content-Type-Options');
  assert.ok(res.headers.get('content-security-policy'), 'CSP');
});

test('Turnstile site key present in form page', async () => {
  const res = await get(BASE + '/');
  const html = await res.text();
  assert.ok(html.includes('0x4AAAAAADsVMQOEJdUztYFx'), 'has Turnstile site key');
});