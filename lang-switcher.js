/* ─── Language switcher ─── */
(function() {
  const SUPPORTED = ['en', 'es', 'pt'];

  function getLang() {
    return localStorage.getItem('bs-lang') || (navigator.language || 'en').slice(0, 2).toLowerCase();
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem('bs-lang', lang);
    document.documentElement.lang = lang;
    // Apply translations if available
    if (window.TRANSLATIONS && window.TRANSLATIONS[lang]) {
      const t = window.TRANSLATIONS[lang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.setAttribute('placeholder', t[key]);
      });
    }
    // PT-BR partial
    if (lang === 'pt' && window.PT_TRANSLATIONS) {
      const t = window.PT_TRANSLATIONS;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.setAttribute('placeholder', t[key]);
      });
    }
  }

  // Create switcher dropdown
  function createSwitcher() {
    if (document.getElementById('lang-switcher')) return;
    const sel = document.createElement('select');
    sel.id = 'lang-switcher';
    sel.setAttribute('aria-label', 'Language');
    sel.style.cssText = 'background:var(--void-card);color:var(--gold);border:1px solid var(--void-border);border-radius:6px;padding:.4rem .6rem;font-family:inherit;font-size:.875rem;cursor:pointer;margin-left:.5rem;';
    sel.innerHTML = SUPPORTED.map(l => {
      const labels = { en: 'EN', es: 'ES', pt: 'PT' };
      return '<option value="' + l + '">' + labels[l] + '</option>';
    }).join('');
    sel.value = getLang();
    sel.addEventListener('change', (e) => setLang(e.target.value));

    // Insert into nav (try .nav-links first)
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      const li = document.createElement('div');
      li.style.cssText = 'display:inline-flex;align-items:center;margin-left:.5rem;';
      li.appendChild(sel);
      navLinks.appendChild(li);
    } else {
      // Fallback: fixed top-right
      sel.style.cssText += ';position:fixed;top:1rem;right:1rem;z-index:100;';
      document.body.appendChild(sel);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createSwitcher();
      setLang(getLang());
    });
  } else {
    createSwitcher();
    setLang(getLang());
  }

  // Expose globally for theme toggle
  window.setLang = setLang;
})();