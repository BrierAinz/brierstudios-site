/* ─── PWA install prompt ─── */
(function() {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  function showInstallButton() {
    if (document.getElementById('pwa-install')) return;
    const btn = document.createElement('button');
    btn.id = 'pwa-install';
    btn.innerHTML = '<span style="font-size:1.1rem;">ᛗ</span> Install App';
    btn.style.cssText = 'position:fixed;bottom:5rem;right:1rem;padding:.5rem .75rem;background:var(--gold);color:var(--void);border:0;border-radius:6px;font-weight:600;cursor:pointer;font-family:inherit;font-size:.85rem;z-index:99;box-shadow:0 4px 12px rgba(0,0,0,.4);';
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install outcome:', outcome);
      deferredPrompt = null;
      btn.remove();
    });
    document.body.appendChild(btn);
  }

  // iOS Safari doesn't fire beforeinstallprompt — show hint manually
  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  }
  if (isIos() && !isStandalone()) {
    setTimeout(() => {
      const hint = document.createElement('div');
      hint.innerHTML = 'Tap <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> then "Add to Home Screen"';
      hint.style.cssText = 'position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);background:var(--void-card);border:1px solid var(--gold);color:var(--text);padding:.5rem .75rem;border-radius:6px;font-size:.8rem;z-index:99;max-width:90vw;text-align:center;';
      document.body.appendChild(hint);
      setTimeout(() => hint.remove(), 8000);
    }, 3000);
  }
})();