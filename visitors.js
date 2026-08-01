(function () {
  "use strict";

  var COUNTER_KEY = "laplace_links_l2place_9f3k";
  var STORAGE_FLAG = "laplace_visited";
  var el = document.getElementById("visitor-count");
  if (!el) return;

  var alreadyVisited = false;
  try {
    alreadyVisited = localStorage.getItem(STORAGE_FLAG) === "1";
  } catch (e) {
    // localStorage unavailable (private mode etc) — just treat as a fresh visit each time
  }

  var base = "https://countapi.mileshilliard.com/api/v1/";
  var endpoint = base + (alreadyVisited ? "get/" : "hit/") + COUNTER_KEY;

  fetch(endpoint)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data || data.value === undefined) return;
      var n = Number(data.value);
      if (isNaN(n)) return;

      el.textContent = n.toLocaleString() + (n === 1 ? " visitor" : " visitors");
      el.classList.add("visible");

      if (!alreadyVisited) {
        try {
          localStorage.setItem(STORAGE_FLAG, "1");
        } catch (e) {
          /* ignore */
        }
      }
    })
    .catch(function () {
      // Counter service unreachable — fail silently, don't break the page
    });
})();
