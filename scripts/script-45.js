// source: pause-overlay-resume-music-direct-fix
(function(){
  'use strict';

  function resumeMusicIfPlaying(){
    try {
      if(document.hidden || document.visibilityState !== 'visible') return;
      if(typeof game === 'undefined' || !game || game.over) return;
      if(typeof musicMuted !== 'undefined' && musicMuted) return;

      const v = (typeof window.__undeadMusicVolume === 'number') ? window.__undeadMusicVolume : 0.6;
      if(v <= 0) return;

      if(typeof bgMusic === 'undefined' || !bgMusic){
        if(typeof startRealMusic === 'function') startRealMusic();
      }

      if(typeof bgMusic !== 'undefined' && bgMusic){
        bgMusic.volume = v;
        bgMusic.muted = false;
        const p = bgMusic.play();
        if(p && p.catch) p.catch(function(){});
      }
    } catch(e) {}
  }

  function bind(){
    ['pauseResume','pause'].forEach(function(id){
      const el = document.getElementById(id);
      if(!el || el.dataset.resumeMusicDirectBound === '1') return;
      el.dataset.resumeMusicDirectBound = '1';
      el.addEventListener('click', function(){
        setTimeout(resumeMusicIfPlaying, 80);
        setTimeout(resumeMusicIfPlaying, 250);
      }, false);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind, {once:true});
  } else {
    bind();
  }
  setTimeout(bind, 300);
})();
