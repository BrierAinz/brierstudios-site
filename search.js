/* ─── Site search index (Fuse.js minimal) ─── */
(function() {
  const INDEX = [
    { title: 'About', section: 'home', href: '/#about', text: 'Creative technology studio forging mythic realms with the spirit of the Old World. Lilith v5.1, Yggdrasil CLI, Nine Realms.' },
    { title: 'Lilith', section: 'home', href: '/#lilith', text: 'Dark fantasy goddess — horns of ancient bronze, eyes of honey-gold, forge-iron crown inscribed with Elder Futhark runes.' },
    { title: 'CLI Demo', section: 'home', href: '/#cli-demo', text: 'Yggdrasil CLI interactive demo. Slash commands across Nine Realms.' },
    { title: 'Skills', section: 'home', href: '/#skills', text: 'Creative technology stack: HTML, CSS, JS, Python, Node, AI/ML, Cloudflare.' },
    { title: 'Projects', section: 'home', href: '/#projects', text: 'BrierStudios projects: Yggdrasil CLI, Lilith Swarm, MCP Server, LoRA pipeline.' },
    { title: 'Contact', section: 'home', href: '/#contact', text: 'Send a raven. Form protected by Cloudflare Turnstile.' },
    { title: 'Lilith Page', section: 'page', href: '/lilith', text: 'Full Lilith character dossier with identity, gallery, Nine Realms mapping, core traits.' },
    { title: 'Releases', section: 'page', href: '/releases', text: 'Release timeline — from Genesis v1.0 through Lilith v5.1, Yggdrasil CLI v2.5.' },
    { title: 'Status', section: 'page', href: '/status', text: 'Live system status: Worker, KV, contact form uptime.' },
    { title: 'Newsletter', section: 'page', href: '/newsletter', text: 'Subscribe to release updates, Lilith variants, Yggdrasil CLI news.' },
    { title: 'RSS Feed', section: 'page', href: '/releases.xml', text: 'Machine-readable release updates.' },
    { title: 'GitHub', section: 'external', href: 'https://github.com/BrierAinz', text: 'BrierAinz GitHub profile — Yggdrasil, BrierStudios repositories.' },
    { title: 'Documentation', section: 'external', href: 'https://docs.brierstudios.com', text: 'Full documentation: CLI reference, Lilith identity, architecture, AI agents, LoRA training.' },
    { title: 'Twitter / X', section: 'external', href: 'https://x.com/BrierAinz', text: 'BrierAinz on Twitter / X.' },
    { title: 'Instagram', section: 'external', href: 'https://www.instagram.com/brier_studios', text: 'BrierStudios on Instagram — visual updates, Lilith variants, behind the scenes.' },
    { title: 'Yggdrasil CLI v2.5', section: 'product', href: '/#cli-demo', text: 'Slash commands for managing projects across Nine Realms: /init, /status, /build, /realms, /agent, /deploy.' },
    { title: 'Lilith Swarm v5', section: 'product', href: '/#cli-demo', text: 'Multi-agent orchestration: Coordinator, TaskPlanner, ConflictResolver, OutputValidator, FallbackChain. Agents Eva, Adán, Odín, Shalltear, Planner.' },
    { title: 'Yggdrasil MCP Server', section: 'product', href: '/#cli-demo', text: 'FastMCP server exposing tools: ecosystem_health, list_comfyui_models, list_recent_outputs, generate_image.' },
    { title: 'LoRA Training Pipeline', section: 'product', href: '/#cli-demo', text: 'Character model training using PixAI DiT.2 (Tsubaki.2). Active LoRAs: KNQ_V1, RGTA_V1.' },
  ];

  // Minimal fuzzy matcher (Fuse-like)
  function score(query, text) {
    query = query.toLowerCase();
    text = (text || '').toLowerCase();
    if (text.includes(query)) return 1.0;
    // Token-based fuzzy
    const qTokens = query.split(/\s+/).filter(Boolean);
    const tTokens = text.split(/\s+/);
    let hits = 0;
    for (const qt of qTokens) {
      for (const tt of tTokens) {
        if (tt.startsWith(qt)) { hits += 0.7; break; }
        if (tt.includes(qt)) { hits += 0.4; break; }
      }
    }
    return Math.min(1, hits / qTokens.length);
  }

  function search(query, limit) {
    if (!query || query.length < 2) return [];
    return INDEX
      .map(item => ({
        ...item,
        score: Math.max(score(query, item.title), score(query, item.text)),
      }))
      .filter(item => item.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 8);
  }

  window.SiteSearch = { search, INDEX };
})();