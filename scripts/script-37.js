// source: spell-audio-manager-patch
(function(){
  'use strict';

  const AUDIO_DATA = {
    fire: "./assets/fire.mp3",
    fireCharged: "./assets/fireCharged.mp3",
    lightning: "./assets/lightning.mp3",
    lightningCharged: "./assets/lightningCharged.mp3"
  };

  let ctx = null;
  const buffers = {};
  const loading = {};

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

  async function load(name){
    const c = getCtx();
    if(!c || !AUDIO_DATA[name]) return null;

    if(buffers[name]) return buffers[name];
    if(loading[name]) return loading[name];

    loading[name] = dataToBuffer(AUDIO_DATA[name]).then(buf => c.decodeAudioData(buf.slice(0)))
      .then(b => buffers[name] = b)
      .catch(e => {
        console.warn('Spell audio decode failed:', name, e);
        return null;
      });

    return loading[name];
  }

  async function unlock(){
    const c = getCtx();
    if(c && c.state === 'suspended'){
      try { await c.resume(); } catch(e) {}
    }

    // Warm up the common sounds.
    load('fire');
    load('lightning');
  }

  async function play(name, volume, rate){
    if(muted()) return;

    const c = getCtx();
    if(!c) return;

    if(c.state === 'suspended'){
      try { await c.resume(); } catch(e) {}
    }

    const vol = getSfxVolume();
    if(vol <= 0) return;

    const buffer = await load(name);
    if(!buffer) return;

    try {
      const source = c.createBufferSource();
      const gain = c.createGain();

      source.buffer = buffer;
      source.playbackRate.value = rate || 1;
      /* Per-sound bias neutralized: files are loudness-normalized, so balance
         comes from the audio, not code. `volume` arg defaults to 1 (slider only). */
      gain.gain.value = Math.min(1, Math.max(0, (typeof volume === 'number' ? volume : 1) * vol));

      source.connect(gain);
      gain.connect(c.destination);
      source.start(0);
    } catch(e) {
      console.warn('Spell audio play failed:', name, e);
    }
  }

  window.__undeadSpellAudio = function(type, charged){
    if(type === 'fire') return play(charged ? 'fireCharged' : 'fire', 1, 1);
    if(type === 'lightning') return play(charged ? 'lightningCharged' : 'lightning', 1, 1);
  };

  document.addEventListener('pointerdown', unlock, {once:true, passive:true});
  document.addEventListener('keydown', unlock, {once:true});
})();
