(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var section = panel.closest('.content-section') || document;
            var input = panel.querySelector('[data-search-input]');
            var region = panel.querySelector('[data-region-select]');
            var type = panel.querySelector('[data-type-select]');
            var empty = section.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));

            function value(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var keyword = value(input);
                var regionValue = value(region);
                var typeValue = value(type);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                    var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, region, type].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.player-overlay');
            var streamUrl = player.getAttribute('data-stream');
            var hls = null;
            var loaded = false;

            function load() {
                if (loaded || !video || !streamUrl) {
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else {
                    video.src = streamUrl;
                }
                video.controls = true;
            }

            function play() {
                load();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }

            function toggle() {
                if (!loaded || video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', toggle);
                video.addEventListener('play', function () {
                    if (overlay) {
                        overlay.classList.add('is-hidden');
                    }
                });
                video.addEventListener('pause', function () {
                    if (overlay && video.currentTime === 0) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
