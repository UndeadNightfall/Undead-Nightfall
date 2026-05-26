// source: death-return-menu-patch
(function(){
  'use strict';

  function bindReturnButton(){
    const btn = document.getElementById('returnMenuBtn');
    if(!btn || btn.__returnBound) return;

    btn.__returnBound = true;

    btn.addEventListener('click', function(){
      try {
        const end = document.getElementById('end');
        const start = document.getElementById('start');

        if(end) end.style.display = 'none';
        if(start) start.style.display = 'grid';

        document.body.classList.remove('game-active');

        if(window.game){
          game.paused = false;
          game.over = true;
        }

        // Restore title video if available
        const v = document.querySelector('#start video, video.titleVideo, #titleVideo');
        if(v){
          try{
            v.currentTime = 0;
            const p = v.play();
            if(p && p.catch) p.catch(function(){});
          }catch(e){}
        }

      } catch(e){
        console.warn('Return to menu failed', e);
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindReturnButton, {once:true});
  } else {
    bindReturnButton();
  }
})();
