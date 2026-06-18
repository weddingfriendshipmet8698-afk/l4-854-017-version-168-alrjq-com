(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function schedule() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          schedule();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          schedule();
        });
      });

      show(0);
      schedule();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-filter-text"));
          card.classList.toggle("hidden-card", Boolean(keyword) && text.indexOf(keyword) === -1);
        });
      });
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage && window.MOVIE_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      var largeForm = document.querySelector("[data-search-form-large]");
      var status = document.querySelector("[data-search-status]");
      var results = document.querySelector("[data-search-results]");

      if (largeForm) {
        var largeInput = largeForm.querySelector("input[name='q']");
        if (largeInput) {
          largeInput.value = query;
        }
      }

      function render(items, keyword) {
        if (!results || !status) {
          return;
        }
        if (!keyword) {
          status.textContent = "输入关键词后即可搜索片库内容。";
          results.innerHTML = "";
          return;
        }
        status.textContent = "搜索结果：" + items.length + " 部";
        results.innerHTML = items.slice(0, 160).map(function (movie) {
          return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.file) + "\">" +
            "<span class=\"poster-shell\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\"></span>" +
            "<span class=\"card-hover\">立即观看</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<a class=\"card-title\" href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a>" +
            "<p class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
            "<p class=\"card-line\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + movie.tags.slice(0, 3).map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") + "</div>" +
            "</div>" +
            "</article>";
        }).join("");
      }

      var keyword = normalize(query);
      var items = window.MOVIE_INDEX.filter(function (movie) {
        return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ")).indexOf(keyword) !== -1;
      });
      render(items, keyword);
    }
  });
})();
