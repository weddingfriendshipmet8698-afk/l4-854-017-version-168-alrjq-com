(function () {
    const players = Array.from(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        const video = player.querySelector("video");
        const cover = player.querySelector(".player-cover");
        const stream = player.getAttribute("data-stream");
        let hlsInstance = null;

        const bindStream = function () {
            if (!video || !stream || video.dataset.ready === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    maxBufferLength: 30
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.dataset.ready = "1";
        };

        const start = function () {
            bindStream();
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
