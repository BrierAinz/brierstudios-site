#!/usr/bin/env node
/* Generate releases.xml from git log.
   Usage: node scripts/generate-rss.mjs [limit]
   Output: writes to releases.xml */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const limit = parseInt(process.argv[2] || '15', 10);
const escXml = (s) => String(s).replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'})[c]);

// Get commit log: hash|date|subject
const raw = execSync(
  `git log --pretty=format:"%h|%ai|%s" -n ${limit}`,
  { encoding: 'utf-8' }
);

const entries = raw.trim().split('\n').filter(Boolean).map(line => {
  const [hash, date, ...rest] = line.split('|');
  const subject = rest.join('|').trim();
  const d = new Date(date);
  return {
    hash: hash.trim(),
    date: d.toUTCString(),
    iso: d.toISOString().slice(0, 10),
    subject,
  };
});

// Categorize
function categorize(subject) {
  const s = subject.toLowerCase();
  if (s.startsWith('feat')) return 'New Feature';
  if (s.startsWith('fix')) return 'Bug Fix';
  if (s.startsWith('perf')) return 'Performance';
  if (s.startsWith('chore')) return 'Maintenance';
  if (s.startsWith('docs')) return 'Documentation';
  if (s.startsWith('test')) return 'Testing';
  if (s.startsWith('refactor')) return 'Refactor';
  if (s.startsWith('ci')) return 'CI/CD';
  return 'Update';
}

const items = entries.map(e => `    <item>
      <title>${escXml(e.subject)}</title>
      <link>https://github.com/BrierAinz/brierstudios-site/commit/${e.hash}</link>
      <description>${escXml(categorize(e.subject))} — ${escXml(e.subject)}</description>
      <pubDate>${escXml(e.date)}</pubDate>
      <guid isPermaLink="false">bs-${e.hash}</guid>
      <category>${escXml(categorize(e.subject))}</category>
    </item>`).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/releases.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BrierStudios — Commits</title>
    <link>https://brierstudios.com/</link>
    <description>Auto-generated commit feed from the main branch.</description>
    <language>en-us</language>
    <atom:link href="https://brierstudios.com/commits.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${escXml(new Date().toUTCString())}</lastBuildDate>
${items}
  </channel>
</rss>
`;

writeFileSync('commits.xml', rss);
console.log('Wrote commits.xml with ' + entries.length + ' commits');