(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  onReady(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menuPanel = document.querySelector("[data-menu-panel]");

    if (menuButton && menuPanel) {
      menuButton.addEventListener("click", function () {
        menuPanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }

      heroIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === heroIndex);
        slide.setAttribute("aria-hidden", slideIndex === heroIndex ? "false" : "true");
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === heroIndex);
      });
    }

    function startHeroTimer() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }

      if (slides.length > 1) {
        heroTimer = window.setInterval(function () {
          showHero(heroIndex + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showHero(dotIndex);
        startHeroTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showHero(heroIndex - 1);
        startHeroTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showHero(heroIndex + 1);
        startHeroTimer();
      });
    }

    showHero(0);
    startHeroTimer();

    var searchBoxes = Array.prototype.slice.call(document.querySelectorAll(".global-search"));

    searchBoxes.forEach(function (box) {
      var input = box.querySelector(".global-search-input");
      var results = box.querySelector(".global-search-results");

      if (!input || !results || !window.SITE_MOVIES) {
        return;
      }

      input.addEventListener("input", function () {
        var term = normalize(input.value);
        results.textContent = "";

        if (!term) {
          results.classList.remove("is-open");
          return;
        }

        var matches = window.SITE_MOVIES.filter(function (movie) {
          return normalize(movie.title + " " + movie.year + " " + movie.region + " " + movie.type + " " + movie.tags).indexOf(term) !== -1;
        }).slice(0, 12);

        matches.forEach(function (movie) {
          var link = document.createElement("a");
          var title = document.createElement("strong");
          var meta = document.createElement("span");

          link.href = movie.url;
          title.textContent = movie.title;
          meta.textContent = [movie.year, movie.region, movie.type].filter(Boolean).join(" · ");
          link.appendChild(title);
          link.appendChild(meta);
          results.appendChild(link);
        });

        results.classList.toggle("is-open", matches.length > 0);
      });
    });

    document.addEventListener("click", function (event) {
      document.querySelectorAll(".global-search-results.is-open").forEach(function (results) {
        if (!results.parentNode.contains(event.target)) {
          results.classList.remove("is-open");
        }
      });
    });

    document.querySelectorAll(".filter-panel").forEach(function (panel) {
      var target = document.getElementById(panel.getAttribute("data-target"));
      var search = panel.querySelector(".js-card-search");
      var year = panel.querySelector(".js-card-year");
      var type = panel.querySelector(".js-card-type");
      var empty = target ? target.querySelector(".empty-state") : null;
      var cards = target ? Array.prototype.slice.call(target.querySelectorAll(".movie-card")) : [];

      function applyFilters() {
        var term = normalize(search ? search.value : "");
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchTerm = !term || haystack.indexOf(term) !== -1;
          var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchType = !selectedType || card.getAttribute("data-type") === selectedType;
          var show = matchTerm && matchYear && matchType;

          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
    });

    document.querySelectorAll(".movie-player").forEach(function (video) {
      var frame = video.closest(".player-frame");
      var overlay = frame ? frame.querySelector(".player-overlay") : null;
      var hlsInstance = null;

      function playVideo() {
        var source = video.getAttribute("data-hls");

        if (!source) {
          return;
        }

        if (!video.getAttribute("data-ready")) {
          video.setAttribute("data-ready", "true");

          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              var request = video.play();
              if (request && request.catch) {
                request.catch(function () {});
              }
            });
          } else {
            video.src = source;
            var request = video.play();
            if (request && request.catch) {
              request.catch(function () {});
            }
          }
        } else {
          var replay = video.play();
          if (replay && replay.catch) {
            replay.catch(function () {});
          }
        }

        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
