// source: music-toggle-global-audio-gate-patch
(function(){
  'use strict';

  function musicMutedNow(){
    try {
      return localStorage.getItem('undead_sound_muted') === '1' ||
             localStorage.getItem('undead_music_muted') === '1' ||
             window.__undeadSoundMuted === true;
    } catch(e) {
      return window.__undeadSoundMuted === true;
    }
  }

  function applyGlobalAudioMute(){
    var muted = musicMutedNow();

    try { window.__undeadSoundMuted = muted; } catch(e) {}

    // Gate all HTML audio/video, including title ambience, game music and any future media elements.
    try {
      document.querySelectorAll('audio, video').forEach(function(el){
        el.muted = muted;
        if (muted) {
          try { el.pause(); } catch(e) {}
        }
      });
    } catch(e) {}

    // Gate common project audio handles without relying on one exact variable name.
    [
      'bgMusic','titleMusic','menuMusic','gameMusic','backgroundMusic','music',
      '__undeadCampfireAudio','campfireAudio','titleAudio','menuAudio'
    ].forEach(function(k){
      try {
        var a = window[k];
        if (!a) return;
        if ('muted' in a) a.muted = muted;
        if (muted && typeof a.pause === 'function') a.pause();
      } catch(e) {}
    });

    // Suspend WebAudio when muted so attacks, fireball, chain lightning and UI SFX are silenced.
    if (muted) {
      ['audio','audioCtx','audioContext','sfxCtx','musicCtx'].forEach(function(k){
        try {
          var c = window[k];
          if (c && typeof c.suspend === 'function' && c.state === 'running') c.suspend();
        } catch(e) {}
      });
    }
  }

  window.__undeadApplyGlobalAudioMute = applyGlobalAudioMute;

  document.addEventListener('DOMContentLoaded', applyGlobalAudioMute, {once:true});

  document.addEventListener('click', function(e){
    if (e.target && (e.target.id === 'muteTitle' || e.target.id === 'muteGame')) {
      setTimeout(applyGlobalAudioMute, 20);
      setTimeout(applyGlobalAudioMute, 120);
    }
  }, true);

  document.addEventListener('pointerdown', function(e){
    if (musicMutedNow()) {
      applyGlobalAudioMute();
    }
  }, true);
})();
