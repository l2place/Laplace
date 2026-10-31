(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.link-card').forEach(card => {
    const reset = () => {
      ['--mx', '--my', '--tilt-x', '--tilt-y'].forEach(key => card.style.removeProperty(key));
    };
    card.addEventListener('pointermove', event => {
      if (motion.matches || !pointer.matches) return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.setProperty('--tilt-y', `${(x - .5) * 6}deg`);
      card.style.setProperty('--tilt-x', `${(y - .5) * -4}deg`);
    }, { passive: true });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
    motion.addEventListener('change', reset);
  });
})();
