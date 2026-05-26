// source: death-return-menu-visible-handler
(function(){
  'use strict';

  function bind(){
    const btn = document.getElementById('returnMenuBtn');
    if(!btn || btn.dataset.returnMenuBound === '1') return;
    btn.dataset.returnMenuBound = '1';

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();

      try {
        const end = document.getElementById('end');
        const start = document.getElementById('start');
        const pause = document.getElementById('pause');

        if(end) end.style.display = 'none';
        if(start) start.style.display = 'grid';
        if(pause) pause.textContent = 'Pause';

        document.body.classList.remove('game-active');

        if(typeof game !== 'undefined' && game){
          game.paused = false;
          game.over = true;
        }

        try {
          const v = document.querySelector('#start video, video.titleVideo, #titleVideo');
          if(v){
            v.currentTime = 0;
            const p = v.play();
            if(p && p.catch) p.catch(function(){});
          }
        } catch(err) {}

      } catch(err) {
        console.warn('Return to menu failed', err);
      }
    }, true);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind, {once:true});
  } else {
    bind();
  }

  setTimeout(bind, 200);
})();
