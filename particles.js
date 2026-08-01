(function () {
  "use strict";

  var canvas = document.getElementById("particles");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var particles = [];
  var COUNT = 55;
  var t = 0;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var mouse = { x: -9999, y: -9999, active: false };
  var REACT_RADIUS = 130;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle() {
    return {
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.6, 2.3),
      baseOpacity: rand(0.12, 0.5),
      speed: rand(0.12, 0.42),
      drift: rand(0.3, 1.1),
      phase: rand(0, Math.PI * 2),
      flicker: rand(0.4, 1.3)
    };
  }

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(createParticle());
  }

  function drawStatic() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + p.baseOpacity + ")";
      ctx.fill();
    }
  }

  function animate() {
    t += 0.016;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      p.y -= p.speed;
      p.x += Math.sin(t * p.flicker + p.phase) * p.drift * 0.05;

      var extraGlow = 0;

      if (mouse.active) {
        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REACT_RADIUS && dist > 0.001) {
          var force = (REACT_RADIUS - dist) / REACT_RADIUS;
          p.x += (dx / dist) * force * 2.6;
          p.y += (dy / dist) * force * 2.6;
          extraGlow = force * 0.55;
        }
      }

      if (p.y < -10) {
        p.y = window.innerHeight + 10;
        p.x = rand(0, window.innerWidth);
      }
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;

      var opacity = p.baseOpacity * (0.55 + 0.45 * Math.sin(t * p.flicker + p.phase)) + extraGlow;
      var radius = p.r + extraGlow * 1.6;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + Math.min(Math.max(opacity, 0), 1) + ")";
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.shadowBlur = radius * (3.2 + extraGlow * 4);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function onTouchMove(e) {
    if (e.touches && e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduced) drawStatic();
    }, 120);
  });

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("mouseleave", onMouseLeave, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onMouseLeave, { passive: true });

  init();
  if (reduced) {
    drawStatic();
  } else {
    animate();
  }
})();
