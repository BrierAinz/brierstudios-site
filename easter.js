/* ─── Easter eggs: clickable runes + konami code + sound ─── */
(function() {
  function init() {
    // Use event delegation so we work even if runes are re-rendered
    document.addEventListener('click', (e) => {
      const rune = e.target.closest('.rune-clickable, [data-rune]');
      if (!rune) return;
      // Only react to footer/decorative runes, not links
      if (rune.tagName === 'A') return;
      e.preventDefault();
      e.stopPropagation();
      triggerRune(rune, rune.dataset.rune || rune.textContent.trim());
    });

    initKonami();
  }

  function triggerRune(el, rune) {
    el.style.transform = 'scale(1.4)';
    setTimeout(() => { el.style.transform = ''; }, 300);

    // Burst particles
    const burst = document.createElement('div');
    burst.className = 'rune-burst';
    const rect = el.getBoundingClientRect();
    burst.style.cssText = 'position:fixed;left:' + (rect.left + rect.width/2) + 'px;top:' + (rect.top + rect.height/2) + 'px;width:0;height:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(burst);

    const symbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ'];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const angle = (i / 12) * Math.PI * 2;
      const dist = 80 + Math.random() * 80;
      p.style.cssText = 'position:absolute;color:var(--gold);font-size:1.5rem;font-family:var(--font-runic);animation:runeFly 1.5s ease-out forwards;--tx:' + Math.cos(angle) * dist + 'px;--ty:' + Math.sin(angle) * dist + 'px;';
      burst.appendChild(p);
    }
    setTimeout(() => burst.remove(), 1600);

    // Side effects
    const meanings = {
      'ᛗ': 'Welcome to Midgard, traveler of the middle realm.',
      'ᛏ': 'Victory favors the bold. (Tiwaz)',
      'ᛟ': 'Heritage. Home. The inheritance of the ancients. (Othala)',
      'ᚹ': 'Joy. Harmony. Fellowship. (Wunjo)',
      'ᚦ': 'Thorns protect the giant\'s hall. (Thurisaz)',
      'ᚠ': 'Wealth. Cattle. The first rune. (Fehu)',
      'ᚢ': 'The aurochs. Strength. Endurance. (Uruz)',
      'ᚨ': 'The gods in their wisdom. (Ansuz)',
      'ᛇ': 'The yew tree. Death and rebirth. (Eihwaz)',
    };
    if (meanings[rune]) showMessage(rune + ' — ' + meanings[rune]);
    else showMessage(rune);
  }

  function showMessage(text) {
    let toast = document.getElementById('rune-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'rune-toast';
      toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--void-card);border:1px solid var(--gold);color:var(--text);padding:1rem 1.5rem;border-radius:6px;z-index:10000;font-family:var(--font-display);box-shadow:0 0 30px rgba(201,168,76,0.3);transition:opacity 0.4s;opacity:0;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 4000);
  }

  // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
  function initKonami() {
    let seq = [];
    const target = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    document.addEventListener('keydown', (e) => {
      seq.push(e.key);
      if (seq.length > target.length) seq.shift();
      if (seq.join(',') === target.join(',')) {
        seq = [];
        showMessage('ᚦᛟᚱ ᚨᚱᛁᛋᛏᛁᚲ — The ancient gods smile upon you.');
        document.body.style.transition = 'filter 5s';
        document.body.style.filter = 'hue-rotate(360deg)';
        setTimeout(() => { document.body.style.filter = ''; }, 5000);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();