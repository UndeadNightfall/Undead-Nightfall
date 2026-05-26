// source: lock-screen-audio-hard-stop-final-v1
(function(){
  'use strict';

  function appIsVisible(){
    try { return !document.hidden && document.visibilityState === 'visible'; }
    catch(e) { return true; }
  }

  function suppressMediaSession(){
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        try { navigator.mediaSession.playbackState = 'none'; } catch(e) {}
        ['play','pause','stop','seekbackward','seekforward','previoustrack','nexttrack','seekto'].forEach(function(action){
          try { navigator.mediaSession.setActionHandler(action, null); } catch(e) {}
        });
      }
    } catch(e) {}
  }

  function pauseKnownMedia(){
    suppressMediaSession();

    // Pause every HTML media element without removing its source, so title video/music can recover normally when the app is opened again.
    try {
      Array.prototype.slice.call(document.querySelectorAll('audio, video')).forEach(function(el){
        try { if (typeof el.pause === 'function') el.pause(); } catch(e) {}
        try { if ('muted' in el) el.muted = true; } catch(e) {}
      });
    } catch(e) {}

    // Pause the known background/title handles used by this project.
    ['bgMusic','backgroundMusic','gameMusic','titleMusic','menuMusic','themeMusic','music','titleAudio','menuAudio','__undeadCampfireAudio'].forEach(function(k){
      try {
        var a = window[k];
        if (!a) return;
        if (typeof a.pause === 'function') a.pause();
        if (typeof a.stop === 'function') a.stop();
        if ('muted' in a) a.muted = true;
      } catch(e) {}
    });

    // Suspend likely WebAudio contexts so long SFX cannot continue under the lock screen.
    ['audio','audioCtx','audioContext','sfxCtx','musicCtx','ctx'].forEach(function(k){
      try {
        var c = window[k];
        if (c && typeof c.suspend === 'function' && c.state !== 'closed') c.suspend();
      } catch(e) {}
    });
  }

  // Guard against any later patch accidentally calling .play() while the PWA is hidden/locked.
  if (!HTMLMediaElement.prototype.__undeadLockScreenPlayGuarded) {
    var originalPlay = HTMLMediaElement.prototype.play;
    Object.defineProperty(HTMLMediaElement.prototype, '__undeadLockScreenPlayGuarded', { value: true });
    HTMLMediaElement.prototype.play = function(){
      if (!appIsVisible()) {
        try { this.pause(); } catch(e) {}
        return Promise.reject(new DOMException('Blocked hidden lock-screen playback', 'NotAllowedError'));
      }
      return originalPlay.apply(this, arguments);
    };
  }

  function handleHidden(){
    if (!appIsVisible()) pauseKnownMedia();
  }

  document.addEventListener('visibilitychange', handleHidden, true);
  window.addEventListener('pagehide', pauseKnownMedia, true);
  window.addEventListener('freeze', pauseKnownMedia, true);
  window.addEventListener('blur', function(){ setTimeout(handleHidden, 50); }, true);

  window.__undeadStopAllAudioForLockScreen = pauseKnownMedia;
})();
