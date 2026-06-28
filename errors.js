/* ─── Client-side error reporter ─── */
(function() {
  if (window.__bs_errors_loaded) return;
  window.__bs_errors_loaded = true;

  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  if (location.pathname.startsWith('/admin')) return;

  function report(level, message, context) {
    try {
      var payload = {
        level: level,
        message: String(message || '').slice(0, 5000),
        url: location.href,
        context: context || {},
        viewport: { w: window.innerWidth, h: window.innerHeight },
        online: navigator.onLine,
      };
      fetch('https://contact.brierstudios.com/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch (e) {}
  }

  // Unhandled JS errors
  window.addEventListener('error', function(e) {
    report('error', e.message, {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error && e.error.stack ? e.error.stack.slice(0, 2000) : null,
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', function(e) {
    report('unhandledrejection', e.reason && e.reason.message || String(e.reason), {
      stack: e.reason && e.reason.stack ? e.reason.stack.slice(0, 2000) : null,
    });
  });

  // Resource load failures (images, scripts, css)
  window.addEventListener('error', function(e) {
    var t = e.target;
    if (t && (t.tagName === 'IMG' || t.tagName === 'SCRIPT' || t.tagName === 'LINK')) {
      report('resource', 'Failed to load: ' + (t.src || t.href || '?'), { tag: t.tagName });
    }
  }, true);
})();