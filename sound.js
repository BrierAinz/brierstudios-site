/* ─── Sound design (optional) ─── */
(function() {
  if (!window.AudioContext) return;

  let enabled = localStorage.getItem('bs-sound') === 'on';
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  // Synthesize a soft modal chord on hover
  function playTone(freq, dur, type) {
    if (!enabled) return;
    try {
      const ac = getCtx();
      if (ac.state === 'suspended') ac.resume();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.05, ac.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + dur);
    } catch (e) {}
  }

  // Hover over runes: subtle Norse-mode interval (Phrygian dominant-ish: A, C, D, E, G)
  const RUNES_INTERVAL = [220, 261.63, 293.66, 329.63, 392, 440];
  let lastToneIdx = 0;

  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (t.matches('a, button, .rune-clickable, .btn, [data-rune], nav a')) {
      const f = RUNES_INTERVAL[lastToneIdx % RUNES_INTERVAL.length];
      lastToneIdx++;
      playTone(f, 0.4, 'sine');
    }
  });

  // Click sound: lower thud
  document.addEventListener('click', (e) => {
    if (e.target.matches('a, button, .btn, .rune-clickable, [data-rune]')) {
      playTone(110, 0.2, 'triangle');
    }
  });

  // Toggle button — hidden but available via window.toggleSound()
  window.toggleSound = function() {
    enabled = !enabled;
    localStorage.setItem('bs-sound', enabled ? 'on' : 'off');
    if (enabled) playTone(440, 0.3, 'sine');
    return enabled;
  };

  // Add a small sound toggle in the footer if you want it
  const soundBtn = document.createElement('button');
  soundBtn.id = 'sound-toggle';
  soundBtn.title = 'Toggle sound effects';
  soundBtn.style.cssText = 'position:fixed;bottom:1rem;right:1rem;width:36px;height:36px;border-radius:50%;background:var(--void-card);border:1px solid var(--void-border);color:var(--gold);cursor:pointer;z-index:100;font-size:.9rem;';
  soundBtn.textContent = enabled ? '🔊' : '🔇';
  soundBtn.addEventListener('click', () => {
    const on = window.toggleSound();
    soundBtn.textContent = on ? '🔊' : '🔇';
  });
  document.body.appendChild(soundBtn);
})();