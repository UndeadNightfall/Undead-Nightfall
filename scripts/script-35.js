// source: undead-ui-state-manager
(function(){
  'use strict';

  var lastState = "";

  function visible(el){
    if(!el) return false;
    var cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && !el.hidden;
  }

  function titleVisible(){
    return visible(document.getElementById('start'));
  }

  function deathVisible(){
    return visible(document.getElementById('end'));
  }

  function leaderboardVisible(){
    var p = document.getElementById('leaderboardPanel');
    return !!(p && visible(p));
  }

  function gameExists(){
    try { return typeof game !== 'undefined' && !!game; }
    catch(e){ return false; }
  }

  function gamePaused(){
    try { return gameExists() && !!game.paused && !game.over; }
    catch(e){ return false; }
  }

  function gamePlaying(){
    try { return gameExists() && !game.over && !game.paused && !titleVisible() && !deathVisible() && !leaderboardVisible(); }
    catch(e){ return false; }
  }

  function detectState(){
    if (deathVisible()) return "dead";
    if (leaderboardVisible()) return "leaderboard";
    if (titleVisible()) return "title";
    if (gamePaused()) return "paused";
    if (gamePlaying()) return "playing";
    return "title";
  }

  function setState(state){
    if(!state) state = detectState();
    if(state === lastState) return;
    lastState = state;

    document.documentElement.setAttribute('data-ui-state', state);

    document.body.classList.toggle('title-visible', state === 'title');
    document.body.classList.toggle('leaderboard-open', state === 'leaderboard');
    document.body.classList.toggle('game-active', state === 'playing' || state === 'paused');

    var pause = document.getElementById('pause');
    if(pause && (state === 'playing')) pause.textContent = 'Pause';
    if(pause && (state === 'paused')) pause.textContent = 'Play';
  }

  function sync(){
    setState(detectState());
  }

  window.__undeadSetUIState = setState;
  window.__undeadSyncUIState = sync;
  window.__undeadSyncGameActiveClass = sync;
  window.__undeadApplyTitleControlState = sync;
  window.__undeadSyncOverlayUiState = sync;

  document.documentElement.setAttribute('data-ui-state', 'boot');

  function bootDone(){
    sync();
    var splash = document.getElementById('bootLayoutSplash');
    if(splash){
      splash.classList.add('hide');
      setTimeout(function(){ try{splash.remove();}catch(e){} }, 520);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(sync, 50);
      setTimeout(sync, 250);
      setTimeout(bootDone, 950);
    }, {once:true});
  } else {
    setTimeout(sync, 50);
    setTimeout(sync, 250);
    setTimeout(bootDone, 950);
  }

  document.addEventListener('click', function(){
    requestAnimationFrame(sync);
    setTimeout(sync, 60);
    setTimeout(sync, 220);
  }, true);

  document.addEventListener('pointerdown', function(){
    requestAnimationFrame(sync);
    setTimeout(sync, 80);
  }, true);

  window.addEventListener('pageshow', sync);
  window.addEventListener('resize', function(){ setTimeout(sync, 80); }, {passive:true});
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden) setTimeout(sync, 80);
  });

  // Low-frequency safety sync only; avoids the button flashing caused by inline style forcing.
  setInterval(sync, 1000);
})();
