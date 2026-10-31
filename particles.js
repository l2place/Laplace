(() => {
  'use strict';
  const canvas = document.getElementById('particles');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const root = document.documentElement;
  const finePointer = matchMedia('(pointer: fine)');
  const pointer = { x: 0, y: 0, active: false, sceneX: 0, sceneY: 0 };
  const particles = [];
  const ripples = [];
  const streaks = [];
  let width = 0, height = 0, frame = null, previous = 0, elapsed = 0, nextStreak = 1.5;
  const rand = (min, max) => min + Math.random() * (max - min);
  const enabled = () => root.dataset.motion !== 'off' && !document.hidden;

  // One small reusable glow sprite avoids expensive per-particle blur passes.
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  const brush = sprite.getContext('2d');
  const glow = brush.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, 'rgba(240,248,255,1)');
  glow.addColorStop(.13, 'rgba(230,244,255,.8)');
  glow.addColorStop(.38, 'rgba(190,220,240,.18)');
  glow.addColorStop(1, 'rgba(190,220,240,0)');
  brush.fillStyle = glow;
  brush.fillRect(0, 0, 64, 64);

  function makeParticle() {
    const depth = rand(.3, 1);
    return { x: rand(0, width), y: rand(0, height), depth, speed: 18 + depth * 35,
      size: 6 + depth * 10, phase: rand(0, Math.PI * 2), drift: rand(-11, 11) };
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.max(32, Math.round(width * height / 14500)));
    particles.length = 0;
    for (let i = 0; i < count; i++) particles.push(makeParticle());
    render(0);
  }
  function render(dt) {
    elapsed += dt;
    ctx.clearRect(0, 0, width, height);
    const targetX = pointer.active && finePointer.matches ? (pointer.x / width - .5) * -22 : 0;
    const targetY = pointer.active && finePointer.matches ? (pointer.y / height - .5) * -16 : 0;
    const easing = 1 - Math.exp(-dt * 4);
    pointer.sceneX += (targetX - pointer.sceneX) * easing;
    pointer.sceneY += (targetY - pointer.sceneY) * easing;
    root.style.setProperty('--scene-x', `${pointer.sceneX.toFixed(2)}px`);
    root.style.setProperty('--scene-y', `${pointer.sceneY.toFixed(2)}px`);
    for (const p of particles) {
      p.y -= p.speed * dt;
      p.x += (p.drift + Math.sin(elapsed * .65 + p.phase) * 14) * dt;
      let proximity = 0;
      if (pointer.active) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 170 && distance > 1) {
          proximity = 1 - distance / 170;
          p.x += (dx / distance - dy / distance * .3) * proximity * 100 * dt;
          p.y += dy / distance * proximity * 70 * dt;
        }
      }
      if (p.y < -24) { p.y = height + 24; p.x = rand(0, width); }
      if (p.x < -24) p.x = width + 24;
      if (p.x > width + 24) p.x = -24;
      ctx.globalAlpha = Math.min(.85, .24 + p.depth * .3 + Math.sin(elapsed * 1.6 + p.phase) * .12 + proximity * .35);
      const size = p.size + proximity * 9;
      ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
    }
    // Brief diagonal streaks pass behind the page, never over its controls.
    if (dt && elapsed > nextStreak) {
      streaks.push({ x: rand(width * .15, width * .95), y: rand(-80, height * .3), life: 0, duration: 1.15 });
      nextStreak = elapsed + rand(3.2, 5.5);
    }
    ctx.lineWidth = 1;
    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i]; s.life += dt;
      if (s.life > s.duration) { streaks.splice(i, 1); continue; }
      const x = s.x - s.life * 300, y = s.y + s.life * 200;
      const tail = ctx.createLinearGradient(x, y, x + 95, y - 63);
      tail.addColorStop(0, '#d8ecff'); tail.addColorStop(1, '#d8ecff00');
      ctx.globalAlpha = Math.sin(s.life / s.duration * Math.PI) * .45;
      ctx.strokeStyle = tail; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 95, y - 63); ctx.stroke();
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]; r.life += dt;
      if (r.life > 1) { ripples.splice(i, 1); continue; }
      ctx.globalAlpha = (1 - r.life) * .35;
      ctx.strokeStyle = '#d8ecff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(r.x, r.y, 8 + r.life * 110, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function animate(now) {
    frame = null;
    if (!enabled()) return;
    const dt = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now; render(dt);
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; previous = 0;
    if (enabled()) frame = requestAnimationFrame(animate);
    else { ripples.length = streaks.length = 0; render(0); }
  }
  window.addEventListener('pointermove', event => {
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
  }, { passive: true });
  const clearPointer = () => { pointer.active = false; };
  document.documentElement.addEventListener('pointerleave', clearPointer);
  window.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') clearPointer(); }, { passive: true });
  window.addEventListener('pointercancel', clearPointer, { passive: true });
  window.addEventListener('pointerdown', event => {
    if (enabled()) { ripples.push({ x: event.clientX, y: event.clientY, life: 0 }); if (ripples.length > 4) ripples.shift(); }
  }, { passive: true });
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 100); });
  window.addEventListener('laplace:motionchange', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { if (frame !== null) cancelAnimationFrame(frame); frame = null; });
  window.addEventListener('pageshow', event => { if (event.persisted) sync(); });
  resize(); sync();
})();
