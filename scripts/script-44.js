// source: clean-game-music-state-patch
(function(){
  'use strict';

  function musicMutedNow(){
    try {
      return localStorage.getItem('undeadNightfallSoundMuted') === '1' ||
             localStorage.getItem('undeadNightfallMusicMuted') === '1' ||
             window.__undeadSoundMuted === true;
    } catch(e) {
      return window.__undeadSoundMuted === true;
    }
  }

  function musicVolume(){
    try {
      if(typeof window.__undeadMusicVolume === 'number') return window.__undeadMusicVolume;
      const v = localStorage.getItem('undead_music_volume');
      return v === null ? 1 : Math.max(0, Math.min(1, Number(v)));
    } catch(e) {
      return 1;
    }
  }

  function shouldPlay(){
    try {
      if(document.hidden || document.visibilityState !== 'visible') return false;
      if(musicMutedNow()) return false;
      if(musicVolume() <= 0) return false;
      if(typeof game === 'undefined' || !game || game.over) return false;

      const start = document.getElementById('start');
      if(start && getComputedStyle(start).display !== 'none') return false;

      return true;
    } catch(e) {
      return false;
    }
  }

  function syncMusic(){
    try {
      if(typeof bgMusic === 'undefined' || !bgMusic) return;

      bgMusic.volume = musicVolume();
      bgMusic.muted = !shouldPlay();

      if(shouldPlay()){
        if(bgMusic.paused){
          const p = bgMusic.play();
          if(p && p.catch) p.catch(function(){});
        }
      }else{
        if(!bgMusic.paused) bgMusic.pause();
      }
    } catch(e) {}
  }

  function bind(){
    ['begin','again','pause'].forEach(function(id){
      const el = document.getElementById(id);
      if(!el || el.dataset.cleanMusicBound === '1') return;
      el.dataset.cleanMusicBound = '1';
      el.addEventListener('click', function(){
        setTimeout(syncMusic, 80);
        setTimeout(syncMusic, 250);
      }, false);
      el.addEventListener('touchend', function(){
        setTimeout(syncMusic, 80);
        setTimeout(syncMusic, 250);
      }, false);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind, {once:true});
  } else {
    bind();
  }

  window.__undeadCleanSyncMusic = syncMusic;
})();
