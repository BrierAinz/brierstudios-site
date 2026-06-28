const POSTS = [
  {
    slug: 'yggdrasil-cli-v2-5-release',
    title: 'Yggdrasil CLI v2.5 — Realms Module Live',
    date: '2026-05-14',
    excerpt: 'Full Nine Realms tree implemented: Asgard, Vanaheim, Alfheim, Svartalfheim, Midgard, Jotunheim, Muspelheim, Niflheim, Helheim.',
    tags: ['cli', 'release', 'yggdrasil'],
    content: `<p>The Yggdrasil CLI v2.5 release brings the full Nine Realms tree to your terminal. Each realm now has its own subdomain of commands:</p>
<ul>
<li><code>forge</code> — Asgard (core libs)</li>
<li><code>summon</code> — Vanaheim (agents)</li>
<li><code>whisper</code> — Svartalfheim (docs)</li>
<li><code>glimmer</code> — Alfheim (UI prototypes)</li>
<li><code>burn</code> — Muspelheim (active dev)</li>
<li><code>archive</code> — Helheim (graveyard)</li>
<li><code>scale</code> — Jotunheim (massive projects)</li>
<li><code>manifest</code> — Midgard (end-user apps)</li>
<li><code>harvest</code> — Niflheim (assets)</li>
</ul>
<p>Realm switching is now seamless: <code>/realm vanaheim</code> changes your context and your prompt symbol.</p>
<p>Install: <code>npm i -g @yggdrasil/cli</code></p>`
  },
  {
    slug: 'lilith-palette-v2-4',
    title: 'Lilith v2.4 — Deeper Voids, Warmer Golds',
    date: '2026-05-10',
    excerpt: 'Refined dark fantasy palette update. Cooler steel, warmer bronze, deeper voids.',
    tags: ['lilith', 'design'],
    content: `<p>The v2.4 release tightens the Lilith palette based on community feedback. Key changes:</p>
<ul>
<li>Void deepened from <code>#1a1b26</code> to <code>#0a0d18</code></li>
<li>Gold warmed from <code>#c8a23e</code> to <code>#d4a849</code></li>
<li>Steel cooled from <code>#7a8599</code> to <code>#6b7a90</code></li>
<li>New realm color: Helheim Crimson <code>#8b2020</code></li>
</ul>
<p>Available immediately across all Lilith variants. See the full palette in the docs.</p>`
  },
  {
    slug: 'turnstile-vs-recaptcha',
    title: 'Why We Switched from reCAPTCHA to Cloudflare Turnstile',
    date: '2026-04-22',
    excerpt: 'Cloudflare Turnstile is invisible, privacy-respecting, and free. Here is why we migrated.',
    tags: ['security', 'cloudflare', 'turnstile'],
    content: `<p>Three weeks ago we swapped reCAPTCHA v3 for Cloudflare Turnstile on the contact form. Here's what changed:</p>
<h3>Before (reCAPTCHA)</h3>
<ul>
<li>Added 38KB of JS, blocking</li>
<li>Required cookie banner for GDPR</li>
<li>Failed 12% of legitimate submissions</li>
<li>Tracked users across sites</li>
</ul>
<h3>After (Turnstile)</h3>
<ul>
<li>~6KB, async, non-blocking</li>
<li>No cookies, no tracking</li>
<li>Failed 0.4% of legitimate submissions</li>
<li>Free, no quota</li>
</ul>
<p>Setup took 15 minutes. The widget is now invisible for 95% of users (managed mode) and only appears for high-risk traffic.</p>`
  }
];

if (typeof module !== 'undefined') module.exports = POSTS;
if (typeof window !== 'undefined') window.BLOG_POSTS = POSTS;