(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = selectAll('[data-hero-slide]');
  var dots = selectAll('[data-hero-dot]');
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearch(input) {
    var scope = input.closest('.js-search-scope') || document;
    var cards = selectAll('.movie-search-card', scope);
    var emptyState = scope.querySelector('[data-empty-state]');
    var term = normalize(input.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matched = !term || text.indexOf(term) !== -1;
      card.classList.toggle('is-hidden-card', !matched);
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  selectAll('[data-search-input]').forEach(function (input) {
    input.addEventListener('input', function () {
      applySearch(input);
    });

    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function () {
        window.setTimeout(function () {
          applySearch(input);
        }, 0);
      });
    }
  });
})();
