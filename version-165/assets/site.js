(function () {
  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var nextButton = slider.querySelector('[data-hero-next]');
    var prevButton = slider.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function previous() {
      show(current - 1);
    }

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(next, 5000);
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        next();
        restartTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        previous();
        restartTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartTimer();
      });
    });

    show(0);
    restartTimer();
  }

  function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

    roots.forEach(function (root) {
      var scope = root.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var searchInput = root.querySelector('[data-filter-search]');
      var regionSelect = root.querySelector('[data-filter-region]');
      var yearSelect = root.querySelector('[data-filter-year]');
      var typeSelect = root.querySelector('[data-filter-type]');
      var resetButton = root.querySelector('[data-filter-reset]');
      var counter = root.querySelector('[data-filter-count]');
      var emptyState = scope.querySelector('[data-empty-state]');

      function getValue(control) {
        return control ? control.value.trim().toLowerCase() : '';
      }

      function update() {
        var query = getValue(searchInput);
        var region = getValue(regionSelect);
        var year = getValue(yearSelect);
        var type = getValue(typeSelect);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var cardType = (card.getAttribute('data-type') || '').toLowerCase();
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          card.hidden = !matched;

          if (matched) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = visibleCount + ' / ' + cards.length;
        }

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
      }

      [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (searchInput) {
            searchInput.value = '';
          }

          if (regionSelect) {
            regionSelect.value = '';
          }

          if (yearSelect) {
            yearSelect.value = '';
          }

          if (typeSelect) {
            typeSelect.value = '';
          }

          update();
        });
      }

      update();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
  });
})();
