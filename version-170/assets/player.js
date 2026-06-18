(function () {
  window.setupMoviePlayer = function (videoId, overlayId, playId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var play = document.getElementById(playId);
    var started = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function startPlayback() {
      if (!started) {
        started = true;
        attachSource();
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (play) {
      play.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  };
})();
