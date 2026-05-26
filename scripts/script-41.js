// source: sword-uploaded-audio-final-patch
(function(){
  'use strict';

  const NORMAL_WAV = "./assets/NORMAL_WAV.mp3";
  const CHARGED_WAV = "./assets/CHARGED_WAV.mp3";
  const LARGE_FIREBALL_WAV = "./assets/LARGE_FIREBALL_WAV.mp3";

  let ctx = null;
  let normalBuffer = null;
  let chargedBuffer = null;
  let swordDownAt = 0;

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

  async function loadBuffers(){
    const c = getCtx();
    if(!c) return;
    try {
      if(!normalBuffer) normalBuffer = await c.decodeAudioData((await dataToBuffer(NORMAL_WAV)).slice(0));
    } catch(e) { console.warn('Normal sword audio failed to decode', e); }
    try {
      if(!chargedBuffer) chargedBuffer = await c.decodeAudioData((await dataToBuffer(CHARGED_WAV)).slice(0));
    } catch(e) { console.warn('Charged sword audio failed to decode', e); }
  }

  async function unlock(){
    const c = getCtx();
    if(c && c.state === 'suspended') {
      try { await c.resume(); } catch(e) {}
    }
    loadBuffers();
  }

  async function play(kind){
    if(muted()) return;
    const c = getCtx();
    if(!c) return;

    if(c.state === 'suspended') {
      try { await c.resume(); } catch(e) {}
    }

    if(!normalBuffer || !chargedBuffer) await loadBuffers();

    const buffer = kind === 'charged' ? chargedBuffer : normalBuffer;
    if(!buffer) {
      console.warn('Sword audio buffer missing:', kind);
      return;
    }

    const vol = getSfxVolume();
    if(vol <= 0) return;

    try {
      const source = c.createBufferSource();
      const gain = c.createGain();

      source.buffer = buffer;
      source.playbackRate.value = kind === 'charged'
        ? 0.96
        : 1.02 + (Math.random() * 0.08 - 0.04);

      gain.gain.value = Math.min(1, vol); /* per-sound bias neutralized (normalized files) */

      source.connect(gain);
      gain.connect(c.destination);
      source.start(0);
    } catch(e) {
      console.warn('Sword audio play failed', e);
    }
  }

  function bindSwordButton(){
    const btn = document.getElementById('sword');
    if(!btn || btn.dataset.uploadedSwordAudioBound === '1') return;
    btn.dataset.uploadedSwordAudioBound = '1';

    btn.addEventListener('pointerdown', function(){
      swordDownAt = performance.now();
      unlock();
    }, true);

    btn.addEventListener('pointerup', function(){
      const held = performance.now() - swordDownAt;
      play(held >= 260 ? 'charged' : 'normal');

      // Ensure charged release still performs the actual spin attack.
      if(held >= 260){
        try {
          if(typeof window.__undeadSingleSpinAttackV2 === 'function'){
            window.__undeadSingleSpinAttackV2();
          }
        } catch(e) {}
      }
    }, true);

    btn.addEventListener('pointercancel', function(){
      const held = performance.now() - swordDownAt;
      play(held >= 260 ? 'charged' : 'normal');

      if(held >= 260){
        try {
          if(typeof window.__undeadSingleSpinAttackV2 === 'function'){
            window.__undeadSingleSpinAttackV2();
          }
        } catch(e) {}
      }
    }, true);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindSwordButton, {once:true});
  } else {
    bindSwordButton();
  }

  document.addEventListener('pointerdown', unlock, {once:true, passive:true});
  document.addEventListener('keydown', unlock, {once:true});

  setTimeout(bindSwordButton, 300);

  window.__undeadPlayUploadedSwordAudio = play;
})();
