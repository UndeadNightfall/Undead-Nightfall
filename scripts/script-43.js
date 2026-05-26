// source: level-up-audio-patch
(function(){
  'use strict';

  const LEVEL_WAV = "./assets/LEVEL_WAV.mp3";

  let ctx = null;
  let buffer = null;
  let loading = null;

  function getCtx(){
    if(ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    return ctx;
  }

  function getSfxVolume(){
    try {
      if(typeof window.__undeadGetSfxVolume === 'function') return window.__undeadGetSfxVolume();
      if(Number.isFinite(window.__undeadSfxVolume)) return window.__undeadSfxVolume;
    } catch(e) {}
    return 1;
  }

  function muted(){
    try {
      return localStorage.getItem('undead_sound_muted') === '1' ||
             localStorage.getItem('undeadNightfallSoundMuted') === '1' ||
             window.__undeadSoundMuted === true;
    } catch(e) {
      return window.__undeadSoundMuted === true;
    }
  }

  function dataToBuffer(srcOrDataUrl){
    // Assets are now external files. Support both a URL/path (fetch it) and a
    // legacy base64 data URI (decode inline) so the function stays robust.
    if(typeof srcOrDataUrl === 'string' && srcOrDataUrl.indexOf('data:') === 0){
      const b64 = srcOrDataUrl.split(',')[1];
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
      return Promise.resolve(bytes.buffer);
    }
    return fetch(srcOrDataUrl).then(function(r){ return r.arrayBuffer(); });
  }

  async function load(){
    const c = getCtx();
    if(!c) return null;

    if(buffer) return buffer;
    if(loading) return loading;

    loading = dataToBuffer(LEVEL_WAV).then(buf => c.decodeAudioData(buf.slice(0)))
      .then(b => buffer = b)
      .catch(e => {
        console.warn('Level-up audio decode failed', e);
        return null;
      });

    return loading;
  }

  async function unlock(){
    const c = getCtx();
    if(c && c.state === 'suspended'){
      try { await c.resume(); } catch(e) {}
    }
    load();
  }

  async function playLevelUp(){
    if(muted()) return;

    const c = getCtx();
    if(!c) return;

    if(c.state === 'suspended'){
      try { await c.resume(); } catch(e) {}
    }

    const vol = getSfxVolume();
    if(vol <= 0) return;

    const b = await load();
    if(!b) return;

    try {
      const source = c.createBufferSource();
      const gain = c.createGain();

      source.buffer = b;
      source.playbackRate.value = 1;
      gain.gain.value = Math.min(1, vol); /* per-sound bias neutralized (normalized files) */

      source.connect(gain);
      gain.connect(c.destination);
      source.start(0);
    } catch(e) {
      console.warn('Level-up audio play failed', e);
    }
  }

  window.__undeadPlayLevelUpAudio = playLevelUp;

  document.addEventListener('pointerdown', unlock, {once:true, passive:true});
  document.addEventListener('keydown', unlock, {once:true});
})();
