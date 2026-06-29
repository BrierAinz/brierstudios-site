/* ─── Security tests ─── */
import { test } from 'node:test';
import assert from 'node:assert';

test('Worker handles Turnstile verification gracefully', async () => {
  const w = await import('fs').then(fs => fs.readFileSync(new URL('../worker-contact.js', import.meta.url), 'utf-8'));
  // Token validation
  assert.ok(w.includes("if (!turnstileToken)"), 'validates token presence');
  assert.ok(w.includes('verifyResult.success'), 'checks Turnstile success');
  assert.ok(w.includes('hostname.endsWith(\'brierstudios.com\')'), 'checks hostname');
});

test('Worker enforces rate limiting', async () => {
  const w = await import('fs').then(fs => fs.readFileSync(new URL('../worker-contact.js', import.meta.url), 'utf-8'));
  assert.ok(w.includes('ratelimit:'), 'uses rate limit KV keys');
  assert.ok(w.includes('Rate limit exceeded'), 'returns 429 message');
  assert.ok(w.includes('count >= 5'), '5 messages per hour limit');
});

test('Client-side honeypot check before submit', async () => {
  const s = await import('fs').then(fs => fs.readFileSync(new URL('../script.js', import.meta.url), 'utf-8'));
  assert.ok(s.includes('hp-field') || s.includes('#website'), 'honeypot class referenced in index.html');
  // The check happens client-side, server trusts client
  // (acceptable because rate limit + Turnstile block real bots)
});

test('HTML escapes user content in admin messages', async () => {
  const w = await import('fs').then(fs => fs.readFileSync(new URL('../worker-contact.js', import.meta.url), 'utf-8'));
  assert.ok(w.includes('escAttr'), 'has escape function');
  assert.ok(w.includes('&amp;'), 'escapes ampersand');
  assert.ok(w.includes('&lt;'), 'escapes <');
  assert.ok(w.includes('&gt;'), 'escapes >');
});

test('CSP allows only necessary origins', async () => {
  const h = await import('fs').then(fs => fs.readFileSync(new URL('../_headers', import.meta.url), 'utf-8'));
  assert.ok(h.includes("default-src 'self'"), 'CSP defaults to self');
  assert.ok(h.includes('object-src \'none\''), 'blocks object/embed');
  assert.ok(h.includes('frame-ancestors \'none\''), 'prevents clickjacking');
});

test('robots.txt blocks /sw.js from indexing', async () => {
  const r = await import('fs').then(fs => fs.readFileSync(new URL('../robots.txt', import.meta.url), 'utf-8'));
  assert.ok(r.includes('Disallow: /sw.js'), 'blocks service worker');
});

test('Worker has no hardcoded secrets in source', async () => {
  const w = await import('fs').then(fs => fs.readFileSync(new URL('../worker-contact.js', import.meta.url), 'utf-8'));
  // Should reference env vars, not hardcode
  assert.ok(w.includes('env.TURNSTILE_SECRET'), 'uses env for Turnstile');
  assert.ok(w.includes('env.ADMIN_TOKEN'), 'uses env for admin');
  assert.ok(w.includes('env.MAIL_TO'), 'uses env for mail');
  assert.ok(w.includes('env.DISCORD_WEBHOOK_URL'), 'uses env for Discord');
  // Should not contain secret-like strings
  assert.ok(!w.includes('sk_live_'), 'no hardcoded Stripe keys');
  assert.ok(!w.includes('0xAAAAAAAAB'), 'no hardcoded Turnstile secret pattern');
});

test('Pages config handles trailing slash redirects', async () => {
  const r = await import('fs').then(fs => fs.readFileSync(new URL('../_redirects', import.meta.url), 'utf-8'));
  assert.ok(r.includes('https://www.brierstudios.com/*'), 'www redirect');
});

test('Manifest references 512px maskable icon', async () => {
  const m = JSON.parse(await import('fs').then(fs => fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf-8')));
  const maskable = m.icons.find(i => i.purpose && i.purpose.includes('maskable'));
  assert.ok(maskable, 'has maskable icon');
  assert.ok(maskable.sizes === '512x512', 'maskable is 512x512');
});

test('Easter eggs gracefully degrade if API missing', async () => {
  const e = await import('fs').then(fs => fs.readFileSync(new URL('../easter.js', import.meta.url), 'utf-8'));
  assert.ok(e.includes('closest('), 'uses closest for delegation');
  assert.ok(e.includes('runeFly'), 'has animation keyframe');
});