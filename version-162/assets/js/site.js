(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    searchInputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-target") || ".movie-card";
      var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
      var empty = document.querySelector(input.getAttribute("data-empty") || "");

      function filter() {
        var q = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
          var matched = !q || text.indexOf(q) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", filter);
      filter();
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.getAttribute("data-filter-group") || "default";
        var value = button.getAttribute("data-filter-value") || "all";
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        filterButtons.forEach(function (item) {
          if ((item.getAttribute("data-filter-group") || "default") === group) {
            item.classList.toggle("is-active", item === button);
          }
        });
        cards.forEach(function (card) {
          var matched = value === "all" || (card.getAttribute("data-region") || "").indexOf(value) !== -1 || (card.getAttribute("data-type") || "").indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";
        });
      });
    });
  });
})();
