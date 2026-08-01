(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var buttons = document.querySelectorAll(".link-btn");

  buttons.forEach(function (btn) {
    var rect = null;

    btn.addEventListener("mouseenter", function () {
      rect = btn.getBoundingClientRect();
      btn.style.transition =
        "transform 0.12s ease-out, background-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease";
    });

    btn.addEventListener("mousemove", function (e) {
      if (!rect) rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      var px = (x / rect.width) * 100;
      var py = (y / rect.height) * 100;
      btn.style.setProperty("--mx", px + "%");
      btn.style.setProperty("--my", py + "%");

      var rotateY = ((x / rect.width) - 0.5) * 8;
      var rotateX = ((y / rect.height) - 0.5) * -8;

      btn.style.transform =
        "translateY(-4px) perspective(700px) rotateX(" +
        rotateX.toFixed(2) +
        "deg) rotateY(" +
        rotateY.toFixed(2) +
        "deg)";
    });

    btn.addEventListener("mouseleave", function () {
      btn.style.transition =
        "transform 0.5s cubic-bezier(0.22,1,0.36,1), background-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease";
      btn.style.transform = "";
      rect = null;
    });
  });

  window.addEventListener("resize", function () {
    // rect is recalculated lazily on next mouseenter/mousemove
  });
})();
