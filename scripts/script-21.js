// source: inline block 21
/* UNIVERSAL_LOCK_SCREEN_AUDIO_SUPPRESSION_PATCH */
(function(){
  'use strict';

  const gameAudioState = {
    suspendedForHidden: false,
    wasMusicEnabled: true
  };

  function allAudioElements(){
    return Array.from(document.querySelectorAll('audio, video'));
  }

  function pauseMediaElements(){
    allAudioElements().forEach(el => {
      try {
        el.pause();
        el.removeAttribute('src');
        if (typeof el.load === 'function') el.load();
      } catch(e) {}
    });
  }

  function suspendAudioContexts(){
    const contexts = [];
    ['audioCtx','audioContext','sfxCtx','musicCtx','ctx'].forEach(k => {
      try {
        if (window[k] && typeof window[k].suspend === 'function') contexts.push(window[k]);
      } catch(e) {}
    });
    try {
      if (window.Howler && window.Howler.ctx && typeof window.Howler.ctx.suspend === 'function') contexts.push(window.Howler.ctx);
    } catch(e) {}
    contexts.forEach(c => {
      try { c.suspend(); } catch(e) {}
    });
  }

  function stopLockScreenMedia(){
    gameAudioState.suspendedForHidden = true;

    // Pause common project-level music/audio handles without assuming exact names.
    [
      'titleMusic','menuMusic','bgMusic','backgroundMusic','music',
      'gameMusic','themeMusic','audio','titleAudio','menuAudio'
    ].forEach(k => {
      try {
        const v = window[k];
        if (!v) return;
        if (typeof v.pause === 'function') v.pause();
        if (typeof v.stop === 'function') v.stop();
        if (typeof v.mute === 'function') v.mute(true);
        if ('muted' in v) v.muted = true;
      } catch(e) {}
    });

    pauseMediaElements();
    suspendAudioContexts();

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
      } catch(e) {}
      ['play','pause','previoustrack','nexttrack','seekbackward','seekforward','seekto','stop'].forEach(action => {
        try { navigator.mediaSession.setActionHandler(action, null); } catch(e) {}
      });
    }
  }

  function handleVisibility(){
    if (document.hidden || document.visibilityState !== 'visible') {
      stopLockScreenMedia();
    }
  }

  document.addEventListener('visibilitychange', handleVisibility, true);
  window.addEventListener('pagehide', stopLockScreenMedia, true);
  window.addEventListener('blur', function(){
    // Mobile browsers often blur before lock/background, including Android.
    setTimeout(handleVisibility, 80);
  }, true);

  // Prevent the game from registering as a lock-screen media session.
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    } catch(e) {}
  }
})();
