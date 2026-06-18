(function() {
  var button = document.querySelector('[data-menu-button]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (button && panel) {
    button.addEventListener('click', function() {
      panel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var panelFilter = document.querySelector('[data-filter-panel]');
  if (panelFilter) {
    var input = document.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (input && initial) {
      input.value = initial;
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var active = {};
      selects.forEach(function(select) {
        var key = select.getAttribute('data-filter-select');
        active[key] = select.value;
      });
      var visible = 0;
      cards.forEach(function(card) {
        var ok = true;
        if (query && textOf(card).indexOf(query) === -1) {
          ok = false;
        }
        Object.keys(active).forEach(function(key) {
          if (active[key] && card.getAttribute('data-' + key) !== active[key]) {
            ok = false;
          }
        });
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }
    selects.forEach(function(select) {
      select.addEventListener('change', filterCards);
    });
    filterCards();
  }
})();
