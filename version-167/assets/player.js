(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play]");
      var hls = null;

      if (!video || !trigger) {
        return;
      }

      function attach() {
        var src = video.getAttribute("data-src");
        if (!src || video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        video.setAttribute("data-ready", "1");
      }

      function play() {
        attach();
        player.classList.add("is-playing");
        video.controls = true;
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      trigger.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
