// source: return-to-menu-from-death-patch
(function(){
  'use strict';

  function bindReturnMenuButton(){
    const btn = document.getElementById('returnMenuBtn');
    if(!btn || btn.__boundReturnMenu) return;

    btn.__boundReturnMenu = true;

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

        if(typeof showLeaderboard === 'function'){
          setTimeout(showLeaderboard, 100);
        }
      } catch(e){
        console.warn('Return to menu failed', e);
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindReturnMenuButton, {once:true});
  } else {
    bindReturnMenuButton();
  }
})();
