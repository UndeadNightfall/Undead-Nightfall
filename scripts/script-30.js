// source: title-video-loop-restore-patch
(function(){
  'use strict';

  function titleVisible(){
    var start = document.getElementById('start');
    if(!start) return false;
    var cs = getComputedStyle(start);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }

  function getTitleVideo(){
    return document.querySelector('#start video, video.titleVideo, video#titleVideo, #titleVideo');
  }

  function playTitleVideo(){
    var v = getTitleVideo();
    if(!v) return;

    try {
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('loop', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');

      if(titleVisible()){
        if(v.paused || v.ended || v.readyState < 2){
          if(v.ended) v.currentTime = 0;
          var p = v.play();
          if(p && p.catch) p.catch(function(){});
        }
      } else {
        try { v.pause(); } catch(e) {}
      }
    } catch(e) {}
  }

  function bindVideo(){
    var v = getTitleVideo();
    if(!v || v.dataset.titleLoopBound === '1') return;
    v.dataset.titleLoopBound = '1';

    v.addEventListener('ended', function(){
      try {
        v.currentTime = 0;
        if(titleVisible()){
          var p = v.play();
          if(p && p.catch) p.catch(function(){});
        }
      } catch(e) {}
    });

    v.addEventListener('pause', function(){
      if(titleVisible()){
        setTimeout(playTitleVideo, 80);
      }
    });
  }

  function sync(){
    bindVideo();
    playTitleVideo();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', sync, {once:true});
  } else {
    sync();
  }

  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden) setTimeout(sync, 80);
  });

  document.addEventListener('click', function(){
    setTimeout(sync, 80);
    setTimeout(sync, 250);
  }, true);

  setInterval(sync, 1000);
})();
