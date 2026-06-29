/* ─── A/B testing (client-side, cookie-persisted) ─── */
(function() {
  var COOKIE = 'bs_ab';
  var m = document.cookie.match(new RegExp(COOKIE + '=([^;]+)'));
  var variant = m ? m[1] : null;

  if (!variant) {
    // Random assign 50/50
    variant = Math.random() < 0.5 ? 'A' : 'B';
    // Persist 30 days
    var expires = new Date(Date.now() + 30 * 86400000).toUTCString();
    document.cookie = COOKIE + '=' + variant + '; path=/; expires=' + expires + '; SameSite=Lax';
  }

  window.BS_AB = {
    variant: variant,
    /**
     * Track an event. POST to /vitals with metric=ab_<name>_<variant>
     */
    track: function(eventName) {
      try {
        fetch('https://contact.brierstudios.com/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metric: 'ab_' + eventName + '_' + variant,
            value: 1,
            url: location.pathname,
            ab_variant: variant,
            ab_event: eventName,
          }),
          keepalive: true,
        });
      } catch (e) {}
    },
  };

  // Auto-track pageview with variant
  if (!location.pathname.startsWith('/admin')) {
    window.BS_AB.track('pageview');
  }
})();