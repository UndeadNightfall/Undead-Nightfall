// source: pause-sound-options-patch
(function(){
  'use strict';

  const MUSIC_VOL_KEY = 'undead_music_volume';
  const SFX_VOL_KEY = 'undead_sfx_volume';

  function clamp01(v){
    v = Number(v);
    if(!Number.isFinite(v)) return 1;
    return Math.max(0, Math.min(1, v));
  }

  function getMusicVolume(){
    try {
      const v = localStorage.getItem(MUSIC_VOL_KEY);
      return v === null ? 1 : clamp01(v);
    } catch(e) { return 1; }
  }

  function getSfxVolume(){
    try {
      const v = localStorage.getItem(SFX_VOL_KEY);
      return v === null ? 1 : clamp01(v);
    } catch(e) { return 1; }
  }

  function setMusicVolume(v){
    v = clamp01(v);
    try { localStorage.setItem(MUSIC_VOL_KEY, String(v)); } catch(e) {}
    applyMusicVolume();
    updateLabels();
  }

  function setSfxVolume(v){
    v = clamp01(v);
    try { localStorage.setItem(SFX_VOL_KEY, String(v)); } catch(e) {}
    window.__undeadSfxVolume = v;
    updateLabels();
  }

  function musicIsMuted(){
    try {
      return localStorage.getItem('undead_sound_muted') === '1' ||
             localStorage.getItem('undead_music_muted') === '1' ||
             localStorage.getItem('undeadNightfallSoundMuted') === '1' ||
             localStorage.getItem('undeadNightfallMusicMuted') === '1' ||
             window.__undeadSoundMuted === true;
    } catch(e) {
      return window.__undeadSoundMuted === true;
    }
  }

  function gameMusicShouldPlay(){
    try {
      if(musicIsMuted()) return false;
      if(typeof game === 'undefined' || !game) return false;
      if(game.paused || game.over) return false;

      const start = document.getElementById('start');
      if(start && getComputedStyle(start).display !== 'none') return false;

      const end = document.getElementById('end');
      if(end && getComputedStyle(end).display !== 'none') return false;

      return true;
    } catch(e) {
      return false;
    }
  }

  function resumeMusicIfAllowed(){
    const v = getMusicVolume();
    if(v <= 0 || musicIsMuted()) return;

    // Only resume music while gameplay is active.
    try {
      if(typeof game === 'undefined' || !game || game.over) return;
      const start = document.getElementById('start');
      if(start && getComputedStyle(start).display !== 'none') return;
    } catch(e) {
      return;
    }

    try {
      if(typeof bgMusic !== 'undefined' && bgMusic){
        bgMusic.volume = v;
        bgMusic.muted = false;
        if(bgMusic.paused && typeof bgMusic.play === 'function'){
          const p = bgMusic.play();
          if(p && p.catch) p.catch(function(){});
        }
      }
    } catch(e) {}

    try {
      if(window.bgMusic){
        window.bgMusic.volume = v;
        window.bgMusic.muted = false;
        if(window.bgMusic.paused && typeof window.bgMusic.play === 'function'){
          const p = window.bgMusic.play();
          if(p && p.catch) p.catch(function(){});
        }
      }
    } catch(e) {}

    try {
      if(typeof startRealMusic === 'function'){
        startRealMusic();
      }
    } catch(e) {}
  }

  function applyMusicVolume(){
    const v = getMusicVolume();
    try { window.__undeadMusicVolume = v; } catch(e) {}

    try {
      if(window.bgMusic) {
        window.bgMusic.volume = v;
        window.bgMusic.muted = musicIsMuted() || v <= 0;
      }
      if(typeof bgMusic !== 'undefined' && bgMusic) {
        bgMusic.volume = v;
        bgMusic.muted = musicIsMuted() || v <= 0;
      }
    } catch(e) {}

    try {
      document.querySelectorAll('audio, video').forEach(function(el){
        if(!el.dataset.originalVolumeManaged){
          el.dataset.originalVolumeManaged = '1';
        }
        if(el.id !== 'titleVideo') {
          el.volume = v;
          el.muted = musicIsMuted() || v <= 0;
        }
      });
    } catch(e) {}

    resumeMusicIfAllowed();
  }

  function updateLabels(){
    const mv = Math.round(getMusicVolume()*100);
    const sv = Math.round(getSfxVolume()*100);

    const musicSlider = document.getElementById('musicVolumeSlider');
    const sfxSlider = document.getElementById('sfxVolumeSlider');
    const musicValue = document.getElementById('musicVolumeValue');
    const sfxValue = document.getElementById('sfxVolumeValue');

    if(musicSlider) musicSlider.value = String(mv);
    if(sfxSlider) sfxSlider.value = String(sv);
    if(musicValue) musicValue.textContent = mv + '%';
    if(sfxValue) sfxValue.textContent = sv + '%';
  }

  // Wrap tone() once so sound effects volume applies to WebAudio effects.
  function wrapTone(){
    try {
      if(typeof tone !== 'function' || tone.__volumeWrapped) return;
      const originalTone = tone;
      const wrapped = function(freq, dur, type, gain, delay){
        const sfx = getSfxVolume();
        if(sfx <= 0) return;
        const newGain = typeof gain === 'number' ? gain * sfx : gain;
        return originalTone.call(this, freq, dur, type, newGain, delay);
      };
      wrapped.__volumeWrapped = true;
      tone = wrapped;
      window.tone = wrapped;
    } catch(e) {}
  }

  function bind(){
    const options = document.getElementById('pauseSoundOptions');
    const panel = document.getElementById('pauseSoundPanel');
    const close = document.getElementById('pauseSoundClose');
    const musicSlider = document.getElementById('musicVolumeSlider');
    const sfxSlider = document.getElementById('sfxVolumeSlider');

    if(options && options.dataset.bound !== '1'){
      options.dataset.bound = '1';
      options.addEventListener('click', function(e){
        e.preventDefault();
        if(panel){
          panel.classList.toggle('show');
          panel.setAttribute('aria-hidden', panel.classList.contains('show') ? 'false' : 'true');
        }
      });
    }

    if(close && close.dataset.bound !== '1'){
      close.dataset.bound = '1';
      close.addEventListener('click', function(e){
        e.preventDefault();
        if(panel){
          panel.classList.remove('show');
          panel.setAttribute('aria-hidden', 'true');
        }
      });
    }

    if(musicSlider && musicSlider.dataset.bound !== '1'){
      musicSlider.dataset.bound = '1';
      musicSlider.addEventListener('input', function(){
        setMusicVolume(Number(musicSlider.value)/100); applyMusicVolume();
      });
    }

    if(sfxSlider && sfxSlider.dataset.bound !== '1'){
      sfxSlider.dataset.bound = '1';
      sfxSlider.addEventListener('input', function(){
        setSfxVolume(Number(sfxSlider.value)/100);
      });
    }

    updateLabels();
    applyMusicVolume();
    wrapTone();
    window.__undeadSfxVolume = getSfxVolume();
  }

  window.__undeadApplyMusicVolume = applyMusicVolume;
  window.__undeadGetSfxVolume = getSfxVolume;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind, {once:true});
  } else {
    bind();
  }

  setTimeout(bind, 300);
  setInterval(function(){
    wrapTone();
  }, 1000);
})();
