/* ─── Privacy-respecting analytics via 1x1 pixel ─── */
(function() {
  if (window.__bs_analytics_loaded) return;
  window.__bs_analytics_loaded = true;

  // Don't track admins or bots
  if (location.pathname.startsWith('/admin')) return;

  // Don't track local dev
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  var img = new Image();
  img.src = 'https://contact.brierstudios.com/pixel.gif?p=' + encodeURIComponent(location.pathname) +
            '&r=' + encodeURIComponent(document.referrer || '') +
            '&t=' + Date.now();
  img.style.position = 'absolute';
  img.style.left = '-9999px';
  img.alt = '';
})();