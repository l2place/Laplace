(() => {
  'use strict';
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const active = () => document.documentElement.dataset.motion !== 'off';
  document.querySelectorAll('.link-card').forEach(card => {
    const reset = () => ['--mx', '--my', '--tilt-x', '--tilt-y'].forEach(key => card.style.removeProperty(key));
    card.addEventListener('pointermove', event => {
      if (!active() || !pointer.matches) return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.setProperty('--tilt-y', `${(x - .5) * 7}deg`);
      card.style.setProperty('--tilt-x', `${(y - .5) * -5}deg`);
    }, { passive: true });
    card.addEventListener('pointerdown', event => {
      if (!active()) return;
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'link-ripple'; ripple.setAttribute('aria-hidden', 'true');
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      card.append(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      setTimeout(() => ripple.remove(), 900);
    }, { passive: true });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
    window.addEventListener('laplace:motionchange', reset);
  });
})();
