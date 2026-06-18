(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var search = panel.querySelector("[data-movie-search]");
      var region = panel.querySelector("[data-region-filter]");
      var year = panel.querySelector("[data-year-filter]");
      var reset = panel.querySelector("[data-filter-reset]");

      function matchesYear(cardYear, selected) {
        if (!selected) {
          return true;
        }
        if (selected === "更早") {
          var numeric = Number((cardYear || "").match(/\d{4}/));
          return numeric && numeric < 2019;
        }
        return (cardYear || "").indexOf(selected) !== -1;
      }

      function filter() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var selectedRegion = region ? region.value : "";
        var selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
            if (!(selectedRegion === "其他" && !/(中国大陆|中国香港|中国台湾|日本|韩国|美国|英国|法国)/.test(cardRegion))) {
              ok = false;
            }
          }
          if (!matchesYear(cardYear, selectedYear)) {
            ok = false;
          }
          card.classList.toggle("is-filtered-out", !ok);
        });
      }

      if (search) {
        search.addEventListener("input", filter);
      }
      if (region) {
        region.addEventListener("change", filter);
      }
      if (year) {
        year.addEventListener("change", filter);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (year) {
            year.value = "";
          }
          filter();
        });
      }
    });
  }

  function setupMoviePlayer(playbackUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !playbackUrl) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(playbackUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playbackUrl;
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
