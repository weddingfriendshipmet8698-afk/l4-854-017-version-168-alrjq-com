(function() {
  function qs(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function setupNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function() {
      panel.classList.toggle('open');
      button.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function createResult(item) {
    var link = document.createElement('a');
    link.href = item.url;
    var title = document.createElement('strong');
    title.textContent = item.title;
    var meta = document.createElement('span');
    meta.textContent = item.meta;
    link.appendChild(title);
    link.appendChild(meta);
    return link;
  }

  function setupSearch() {
    var boxes = qs(document, '.search-box');
    var list = window.SEARCH_INDEX || [];
    boxes.forEach(function(box) {
      var input = box.querySelector('[data-site-search]');
      var results = box.querySelector('[data-search-results]');
      if (!input || !results) {
        return;
      }
      input.addEventListener('input', function() {
        var value = input.value.trim().toLowerCase();
        results.innerHTML = '';
        if (!value) {
          results.classList.remove('open');
          return;
        }
        var matched = list.filter(function(item) {
          return item.tokens.indexOf(value) !== -1;
        }).slice(0, 9);
        if (!matched.length) {
          var empty = document.createElement('div');
          empty.className = 'search-empty';
          empty.textContent = '没有找到相关影片';
          results.appendChild(empty);
        } else {
          matched.forEach(function(item) {
            results.appendChild(createResult(item));
          });
        }
        results.classList.add('open');
      });
      input.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          input.value = '';
          results.innerHTML = '';
          results.classList.remove('open');
        }
      });
      document.addEventListener('click', function(event) {
        if (!box.contains(event.target)) {
          results.classList.remove('open');
        }
      });
    });
  }

  function setupPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    var cards = qs(document, '[data-filter-card]');
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener('input', function() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        card.classList.toggle('is-filtered-out', value && text.indexOf(value) === -1);
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qs(hero, '[data-hero-slide]');
    var dots = qs(hero, '[data-hero-dot]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        restart();
      });
    });
    restart();
  }

  window.initMoviePlayer = function(url) {
    var video = document.querySelector('[data-player]');
    var layer = document.querySelector('[data-play-layer]');
    if (!video || !layer || !url) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      attach();
      layer.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function() {});
      }
    }

    layer.addEventListener('click', play);
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden && hlsInstance && video.paused) {
        hlsInstance.stopLoad();
      } else if (!document.hidden && hlsInstance) {
        hlsInstance.startLoad();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupSearch();
    setupPageFilter();
    setupHero();
  });
})();
