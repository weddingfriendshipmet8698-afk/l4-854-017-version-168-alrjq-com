(function () {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const siteNav = document.querySelector("[data-site-nav]");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            siteNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        };

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const areas = Array.from(document.querySelectorAll("[data-filter-area]")).map(function (panel) {
        const section = panel.closest("section") || document;
        return {
            panel: panel,
            section: section,
            input: panel.querySelector("[data-search-input]"),
            fields: Array.from(panel.querySelectorAll("[data-filter-field]")),
            cards: Array.from(section.querySelectorAll("[data-movie-card]"))
        };
    });

    areas.forEach(function (area) {
        const runFilter = function () {
            const query = area.input ? area.input.value.trim().toLowerCase() : "";
            const fieldValues = area.fields.map(function (field) {
                return {
                    key: field.getAttribute("data-filter-field"),
                    value: field.value.trim().toLowerCase()
                };
            });

            area.cards.forEach(function (card) {
                const searchable = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.year
                ].join(" ").toLowerCase();

                const queryMatch = !query || searchable.includes(query);
                const fieldMatch = fieldValues.every(function (item) {
                    if (!item.value) {
                        return true;
                    }

                    const data = String(card.dataset[item.key] || "").toLowerCase();
                    return data.includes(item.value);
                });

                card.classList.toggle("is-hidden", !(queryMatch && fieldMatch));
            });
        };

        if (area.input) {
            area.input.addEventListener("input", runFilter);
        }

        area.fields.forEach(function (field) {
            field.addEventListener("change", runFilter);
        });
    });
})();
