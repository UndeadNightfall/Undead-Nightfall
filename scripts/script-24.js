// source: pause-menu-overlay-behaviour-patch
(function(){
  'use strict';

  function overlay(){
    return document.getElementById('pauseMenuOverlay');
  }

  function showPauseOverlay(show){
    var o = overlay();
    if(!o) return;
    o.classList.toggle('show', !!show);
    o.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function isGamePaused(){
    try { return !!(window.game && game.paused && !game.over); } catch(e) { return false; }
  }

  function syncPauseOverlay(){
    showPauseOverlay(isGamePaused());
  }

  // Wrap the existing pause button behaviour without changing gameplay logic.
  function bindPauseOverlay(){
    var pauseBtn = document.getElementById('pause');
    if(pauseBtn && pauseBtn.dataset.pauseOverlayBound !== '1'){
      pauseBtn.dataset.pauseOverlayBound = '1';
      pauseBtn.addEventListener('click', function(){
        setTimeout(syncPauseOverlay, 20);
        setTimeout(syncPauseOverlay, 120);
      }, true);
    }

    
    var resumeBtn = document.getElementById('pauseResume');
    if(resumeBtn && resumeBtn.dataset.resumeBound !== '1'){
      resumeBtn.dataset.resumeBound = '1';
      resumeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        try {
          if(window.game || typeof game !== 'undefined') {
            game.paused = false;
          }
        } catch(err) {}

        showPauseOverlay(false);

        try {
          var pause = document.getElementById('pause');
          if(pause) pause.textContent = 'Pause';
        } catch(err) {}
      }, true);
    }

    var returnBtn = document.getElementById('pauseReturnMenu');
    if(returnBtn && returnBtn.dataset.returnMenuBound !== '1'){
      returnBtn.dataset.returnMenuBound = '1';
      returnBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        try {
          if(window.game) {
            game.paused = false;
            game.over = true;
          }
        } catch(err) {}

        showPauseOverlay(false);

        try {
          var start = document.getElementById('start');
          var end = document.getElementById('end');
          var pause = document.getElementById('pause');
          if(start) start.style.display = '';
          if(end) end.style.display = 'none';
          if(pause) pause.textContent = 'Pause';
          if(window.__undeadCampfireAudio && typeof window.syncCampfireAmbience === 'function') {
            window.syncCampfireAmbience();
          }
        } catch(err) {}
      }, true);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindPauseOverlay, {once:true});
  } else {
    bindPauseOverlay();
  }

  setInterval(syncPauseOverlay, 250);
})();
