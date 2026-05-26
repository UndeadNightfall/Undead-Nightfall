// source: auto-pause-on-blur-patch
(function(){
  'use strict';

  function showPauseOverlayIfAvailable(){
    try {
      const overlay = document.getElementById('pauseMenuOverlay');
      if (overlay) {
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden', 'false');
      }
    } catch(e){}
  }

  function autoPauseGame(reason){
    try {
      if (!window.game || game.over) return;
      if (game.paused) return;

      game.paused = true;

      const pauseBtn = document.getElementById('pause');
      if (pauseBtn) pauseBtn.textContent = 'Resume';

      showPauseOverlayIfAvailable();

      console.log('Game auto-paused:', reason);
    } catch(e){
      console.warn('Auto-pause failed', e);
    }
  }

  // Browser/tab hidden
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) {
      autoPauseGame('visibilitychange');
    }
  }, {passive:true});

  // App/window loses focus
  window.addEventListener('blur', function(){
    autoPauseGame('window blur');
  }, {passive:true});

  // Mobile app backgrounding / app switching
  window.addEventListener('pagehide', function(){
    autoPauseGame('pagehide');
  }, {passive:true});

  // iOS Safari sometimes fires freeze instead
  window.addEventListener('freeze', function(){
    autoPauseGame('freeze');
  }, {passive:true});

})();
