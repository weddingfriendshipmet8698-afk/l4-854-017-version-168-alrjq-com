(function () {
  function canUseNativeHls(video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var message = player.querySelector('[data-player-message]');
    var source = player.getAttribute('data-m3u8');
    var isAttached = false;
    var hls = null;

    if (!video || !button || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachSource() {
      if (isAttached) {
        return Promise.resolve();
      }

      if (canUseNativeHls(video)) {
        video.src = source;
        isAttached = true;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        isAttached = true;

        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage('播放源加载异常，正在尝试恢复。');

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });

        return Promise.resolve();
      }

      setMessage('当前浏览器暂不支持 HLS 播放，请更换浏览器或通过服务器访问本站。');
      return Promise.reject(new Error('HLS is not supported.'));
    }

    button.addEventListener('click', function () {
      setMessage('正在加载播放源...');

      attachSource()
        .then(function () {
          return video.play();
        })
        .then(function () {
          setMessage('');
        })
        .catch(function () {
          setMessage('自动播放被浏览器拦截时，请再次点击播放按钮。');
        });
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
