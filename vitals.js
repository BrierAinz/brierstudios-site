/* ─── Web Vitals collector ─── */
(function() {
  if (!('PerformanceObserver' in window)) return;

  const endpoint = 'https://contact.brierstudios.com/vitals';
  const data = { url: location.pathname, ua: navigator.userAgent };

  function send(name, value) {
    const payload = { ...data, metric: name, value: Math.round(value * 1000) / 1000 };
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    } else {
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
    }
  }

  // LCP
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      send('LCP', last.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {}

  // FID / INP
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const value = entry.processingStart ? entry.processingStart - entry.startTime : entry.duration;
        send('INP', value);
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch (e) {}

  // CLS
  let clsValue = 0;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) clsValue += entry.value;
      }
      send('CLS', clsValue);
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}

  // TTFB + page load
  window.addEventListener('load', () => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      send('TTFB', nav.responseStart);
      send('Load', nav.loadEventEnd);
      send('DOMContentLoaded', nav.domContentLoadedEventEnd);
    }
  });
})();