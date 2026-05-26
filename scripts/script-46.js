// source: pause-does-not-stop-music-final-guard-v2
(function(){
  'use strict';

  function musicMutedNow(){
    try {
      if (typeof musicMuted !== 'undefined') return !!musicMuted;
      if (window.__undeadSoundMuted === true) return true;
      return localStorage.getItem('undead_music_muted') === '1' || localStorage.getItem('undead_sound_muted') === '1';
    } catch(e) {
      return false;
    }
  }

  function musicVolume(){
    try {
      if (typeof window.__undeadMusicVolume === 'number') return window.__undeadMusicVolume;
      const stored = localStorage.getItem('undead_music_volume');
      return stored === null ? 0.6 : Math.max(0, Math.min(1, Number(stored)));
    } catch(e) {
      return 0.6;
    }
  }

  function titleVisible(){
    try {
      const start = document.getElementById('start');
      return !!(start && getComputedStyle(start).display !== 'none');
    } catch(e) {
      return false;
    }
  }

  function shouldMusicPlayDuringGame(){
    try {
      if(document.hidden || document.visibilityState !== 'visible') return false;
      if (musicMutedNow()) return false;
      if (musicVolume() <= 0) return false;
      if (titleVisible()) return false;
      if (typeof game !== 'undefined' && game && game.over) return false;
      return true;
    } catch(e) {
      return false;
    }
  }

  function keepMusicAlive(){
    try {
      if (!shouldMusicPlayDuringGame()) return;
      if (typeof bgMusic === 'undefined' || !bgMusic) {
        if (typeof startRealMusic === 'function') startRealMusic();
      }
      if (typeof bgMusic !== 'undefined' && bgMusic) {
        bgMusic.volume = musicVolume();
        bgMusic.muted = false;
        if (bgMusic.paused) {
          const p = bgMusic.play();
          if (p && p.catch) p.catch(function(){});
        }
      }
    } catch(e) {}
  }

  function bindPauseMusicGuard(){
    const pause = document.getElementById('pause');
    if (pause && pause.dataset.pauseKeepsMusicBound !== '1') {
      pause.dataset.pauseKeepsMusicBound = '1';
      ['click','touchend','pointerup'].forEach(function(type){
        pause.addEventListener(type, function(){
          setTimeout(keepMusicAlive, 20);
          setTimeout(keepMusicAlive, 120);
          setTimeout(keepMusicAlive, 350);
        }, true);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPauseMusicGuard, {once:true});
  } else {
    bindPauseMusicGuard();
  }

  window.__undeadPauseDoesNotStopMusic = keepMusicAlive;
})();
