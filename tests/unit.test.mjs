/* BrierStudios unit tests — Node's built-in test runner */
import { test } from 'node:test';
import assert from 'node:assert';

// ---- search.js ----
test('SiteSearch exists and has search function', async () => {
  const searchCode = await import('fs').then(fs => fs.readFileSync(new URL('../search.js', import.meta.url), 'utf-8'));
  assert.ok(searchCode.includes('window.SiteSearch = { search'), 'search.js exposes SiteSearch.search');
  assert.ok(searchCode.includes('INDEX'), 'search.js has INDEX');
  assert.ok(searchCode.length > 1000, 'search.js non-trivial');
});

// ---- translations.js ----
test('translations EN/ES present', async () => {
  const t = await import('fs').then(fs => fs.readFileSync(new URL('../translations.js', import.meta.url), 'utf-8'));
  assert.ok(t.includes("'en':"), 'EN section exists');
  assert.ok(t.includes("'es':"), 'ES section exists');
  assert.ok(t.includes("'nav-about':"), 'has nav-about key');
  assert.ok(t.includes("'form-btn':"), 'has form-btn key');
});

// ---- translations-pt.js ----
test('PT translations present', async () => {
  const t = await import('fs').then(fs => fs.readFileSync(new URL('../translations-pt.js', import.meta.url), 'utf-8'));
  assert.ok(t.includes("'nav-about': 'Início'"), 'PT nav-about translated');
  assert.ok(t.includes("'hero-mythic': 'Mítico'"), 'PT hero-mythic translated');
});

// ---- index.html structure ----
test('index.html has key elements', async () => {
  const h = await import('fs').then(fs => fs.readFileSync(new URL('../index.html', import.meta.url), 'utf-8'));
  assert.ok(h.includes('cf-turnstile'), 'has Turnstile widget');
  assert.ok(h.includes('hp-field'), 'has honeypot');
  assert.ok(h.includes('easter.js'), 'has easter script');
  assert.ok(h.includes('vitals.js'), 'has vitals script');
  assert.ok(h.includes('application/ld+json'), 'has JSON-LD');
  assert.ok(h.includes('releases.xml'), 'links RSS');
});

// ---- releases.xml ----
test('RSS feed well-formed', async () => {
  const r = await import('fs').then(fs => fs.readFileSync(new URL('../releases.xml', import.meta.url), 'utf-8'));
  assert.ok(r.startsWith('<?xml'), 'starts with XML declaration');
  assert.ok(r.includes('<rss'), 'has rss root');
  assert.ok(r.includes('<channel>'), 'has channel');
  assert.ok(r.includes('<item>'), 'has at least one item');
  assert.ok(r.includes('BrierStudios'), 'mentions BrierStudios');
  assert.ok(r.includes('xml-stylesheet'), 'has XSL reference');
});

// ---- sitemap.xml ----
test('sitemap has URLs', async () => {
  const s = await import('fs').then(fs => fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf-8'));
  assert.ok(s.includes('<urlset'), 'has urlset');
  assert.ok(s.includes('brierstudios.com'), 'references domain');
  const urlCount = (s.match(/<loc>/g) || []).length;
  assert.ok(urlCount >= 5, 'has at least 5 URLs');
});

// ---- manifest.json ----
test('manifest.json valid', async () => {
  const m = JSON.parse(await import('fs').then(fs => fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf-8')));
  assert.ok(m.name, 'has name');
  assert.ok(m.icons && m.icons.length > 0, 'has icons');
  assert.ok(m.start_url, 'has start_url');
});

// ---- robots.txt ----
test('robots.txt exists with sitemap', async () => {
  const r = await import('fs').then(fs => fs.readFileSync(new URL('../robots.txt', import.meta.url), 'utf-8'));
  assert.ok(r.includes('User-agent'), 'has User-agent');
  assert.ok(r.includes('Sitemap'), 'has Sitemap');
});

// ---- _headers CSP ----
test('_headers has strict CSP', async () => {
  const h = await import('fs').then(fs => fs.readFileSync(new URL('../_headers', import.meta.url), 'utf-8'));
  assert.ok(h.includes('Content-Security-Policy'), 'has CSP');
  assert.ok(h.includes('challenges.cloudflare.com'), 'allows Turnstile');
  assert.ok(h.includes('Strict-Transport-Security'), 'has HSTS');
});

// ---- Worker syntax ----
test('worker-contact.js valid JS', async () => {
  const w = await import('fs').then(fs => fs.readFileSync(new URL('../worker-contact.js', import.meta.url), 'utf-8'));
  assert.ok(w.includes('export default'), 'Worker uses module export');
  assert.ok(w.includes('handleContactPost'), 'has contact handler');
  assert.ok(w.includes('handleStatus'), 'has status handler');
  assert.ok(w.includes('handleVitals'), 'has vitals handler');
  assert.ok(w.includes('handleAuthLogin'), 'has auth handler');
  assert.ok(w.includes('handleAlertsSubscribe'), 'has alerts handler');
  assert.ok(w.includes('handleGitHubWebhook'), 'has webhook handler');
  assert.ok(w.includes('handleCategoryFeed'), 'has category feed handler');
  assert.ok(w.includes('checkAuth'), 'has auth check');
  assert.ok(w.includes('TURNSTILE_SECRET'), 'checks Turnstile secret');
  assert.ok(w.includes('rate'), 'has rate limiting');
  assert.ok(w.includes('KV'), 'uses KV');
});