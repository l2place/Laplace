(function () {
  "use strict";

  var STARTING_COUNT = 219;
  var START_TIME = Date.parse("2026-08-26T10:01:00Z");
  var INCREASE_EVERY_MS = 60 * 1000;

  var el = document.getElementById("visitor-count");
  if (!el) return;

  function render() {
    var elapsed = Math.max(0, Date.now() - START_TIME);
    var count = STARTING_COUNT + Math.floor(elapsed / INCREASE_EVERY_MS);

    el.textContent =
      count.toLocaleString() + (count === 1 ? " visitor" : " visitors");
    el.classList.add("visible");
  }

  render();
  window.setInterval(render, 1000);
})();
