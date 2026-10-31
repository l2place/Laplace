(() => {
  'use strict';
  const root = document.documentElement;
  const system = matchMedia('(prefers-reduced-motion: reduce)');
  let preference = null;
  try { preference = localStorage.getItem('laplace-motion'); } catch {}
  const enabled = () => preference === 'on' || (preference !== 'off' && !system.matches);
  function apply() {
    const on = enabled();
    root.dataset.motion = on ? 'on' : 'off';
    const button = document.getElementById('motion-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(on));
      button.title = on ? 'Pause animations' : 'Enable animations';
      button.querySelector('span').textContent = on ? 'Motion on' : 'Enable motion';
    }
    window.dispatchEvent(new Event('laplace:motionchange'));
  }
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('motion-toggle')?.addEventListener('click', () => {
      root.dataset.motionTouched = 'true';
      preference = enabled() ? 'off' : 'on';
      try { localStorage.setItem('laplace-motion', preference); } catch {}
      apply();
    });
    apply();
  });
})();
