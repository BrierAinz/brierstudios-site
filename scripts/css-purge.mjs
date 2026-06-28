#!/usr/bin/env node
/* Analyze styles.css for potentially-unused selectors.
   Not perfect (dynamic classes, JS-injected selectors, etc.),
   but a good starting point. */
import { readFileSync } from 'node:fs';

const css = readFileSync('styles.css', 'utf-8');
const htmlFiles = [
  'index.html', 'lilith.html', 'releases.html', 'blog/index.html',
  'faq.html', 'components.html', 'animations.html', 'roadmap.html',
  'support.html', 'templates.html', 'schedule.html', 'search.html',
  'newsletter.html', 'status.html', '404.html', 'vitals.html',
  'admin.html', 'api-docs.html',
];
const jsFiles = [
  'script.js', 'translations.js', 'translations-pt.js', 'lang-switcher.js',
  'easter.js', 'sound.js', 'search.js', 'posts.js', 'vitals.js',
  'analytics.js', 'pwa-install.js', 'errors.js',
];

function safeRead(p) {
  try { return readFileSync(p, 'utf-8'); } catch { return ''; }
}

const allHtml = htmlFiles.map(safeRead).join('\n');
const allJs = jsFiles.map(safeRead).join('\n');
const all = allHtml + '\n' + allJs;

// Extract class selectors from CSS (very rough — just look for .classname { ... })
const cssClasses = new Set();
const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
let m;
while ((m = classRegex.exec(css)) !== null) {
  cssClasses.add(m[1]);
}

// Also extract IDs
const cssIds = new Set();
const idRegex = /#([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
while ((m = idRegex.exec(css)) !== null) {
  cssIds.add(m[1]);
}

const unusedClasses = [];
for (const cls of cssClasses) {
  // Check if class appears in HTML or JS (very basic — doesn't handle multi-class, dynamic concat, etc.)
  const re = new RegExp('\\b' + cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
  if (!re.test(all)) {
    unusedClasses.push(cls);
  }
}

const unusedIds = [];
for (const id of cssIds) {
  const re = new RegExp('#\\s*' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!re.test(all)) {
    unusedIds.push(id);
  }
}

console.log('CSS class selectors:', cssClasses.size);
console.log('CSS ID selectors:', cssIds.size);
console.log('Potentially unused classes:', unusedClasses.length);
if (unusedClasses.length) {
  // Show top 30
  unusedClasses.slice(0, 30).forEach(c => console.log('  .' + c));
  if (unusedClasses.length > 30) console.log('  ... and ' + (unusedClasses.length - 30) + ' more');
}
console.log('Potentially unused IDs:', unusedIds.length);
if (unusedIds.length) {
  unusedIds.slice(0, 30).forEach(i => console.log('  #' + i));
}