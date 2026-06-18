(function() {
  window.initMoviePlayer = function(videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var ready = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegURL')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
      ready = true;
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
      if (!ready) {
        start();
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
