// source: fireball-audio-direct-fix
(function(){
  'use strict';

  const SMALL_FIRE = "./assets/SMALL_FIRE.mp3";
  const LARGE_FIRE = "./assets/LARGE_FIRE.mp3";

  let ctx = null;
  let smallBuffer = null;
  let largeBuffer = null;
  let loadingSmall = null;
  let loadingLarge = null;

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

  async function load(kind){
    const c = getCtx();
    if(!c) return null;

    if(kind === 'large'){
      if(largeBuffer) return largeBuffer;
      if(loadingLarge) return loadingLarge;
      loadingLarge = dataToBuffer(LARGE_FIRE).then(buf => c.decodeAudioData(buf.slice(0)))
        .then(b => largeBuffer = b)
        .catch(e => { console.warn('Large fireball decode failed', e); return null; });
      return loadingLarge;
    }

    if(smallBuffer) return smallBuffer;
    if(loadingSmall) return loadingSmall;
    loadingSmall = dataToBuffer(SMALL_FIRE).then(buf => c.decodeAudioData(buf.slice(0)))
      .then(b => smallBuffer = b)
      .catch(e => { console.warn('Small fireball decode failed', e); return null; });
    return loadingSmall;
  }

  async function unlock(){
    const c = getCtx();
    if(c && c.state === 'suspended'){
      try { await c.resume(); } catch(e) {}
    }
    load('small');
    load('large');
  }

  async function playFire(kind){
    if(muted()) return;

    const c = getCtx();
    if(!c) return;

    if(c.state === 'suspended'){
      try { await c.resume(); } catch(e) {}
    }

    const vol = getSfxVolume();
    if(vol <= 0) return;

    const buffer = await load(kind === 'large' ? 'large' : 'small');
    if(!buffer) return;

    try {
      const source = c.createBufferSource();
      const gain = c.createGain();

      source.buffer = buffer;
      source.playbackRate.value = 1;
      gain.gain.value = Math.min(1, vol); /* per-sound bias neutralized (normalized files) */

      source.connect(gain);
      gain.connect(c.destination);
      source.start(0);
    } catch(e) {
      console.warn('Fireball play failed', e);
    }
  }

  window.__undeadFireballAudioDirect = function(charged){
    return playFire(charged ? 'large' : 'small');
  };

  document.addEventListener('pointerdown', unlock, {once:true, passive:true});
  document.addEventListener('keydown', unlock, {once:true});
})();
