(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  onReady(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var button = box.querySelector(".player-play");
      var media = video ? video.getAttribute("data-media") : "";
      var loaded = false;
      var instance = null;

      function loadMedia() {
        if (!video || !media || loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = media;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(media);
          instance.attachMedia(video);
        } else {
          video.src = media;
        }
        loaded = true;
      }

      function playMedia() {
        loadMedia();
        if (!video) {
          return;
        }
        video.controls = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", playMedia);
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          playMedia();
        });
      }
      if (video) {
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
        video.addEventListener("click", function () {
          if (!loaded) {
            playMedia();
          }
        });
        window.addEventListener("beforeunload", function () {
          if (instance) {
            instance.destroy();
          }
        });
      }
    });
  });
})();
