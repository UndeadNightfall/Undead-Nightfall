// source: integrated-spin-sword-system-v2-fixed-longpress
(function(){
  'use strict';

  // Reliable sword handling:
  // - quick tap = normal sword attack on release
  // - hold = spinning sword attack fires automatically after HOLD_MS
  // - capture + stopImmediatePropagation blocks the older immediate pointerdown sword attack.
  const HOLD_MS = 260;
  const SPIN_DURATION = 460;
  const SPIN_RANGE = 112;
  const SPIN_DAMAGE = 22;

  let active = null;
  let spinning = false;

  function validGame(){ return typeof game !== 'undefined' && game && game.hero && !game.over && !game.paused; }

  function playSword(kind){
    try { if(typeof window.__undeadPlayUploadedSwordAudio === 'function') window.__undeadPlayUploadedSwordAudio(kind); } catch(e){}
  }

  function doNormalSword(){
    if(!validGame()) return;
    playSword('normal');
    try { if(typeof swordAttack === 'function') swordAttack(); } catch(e){}
  }

  function doSpinAttack(){
    if(!validGame() || spinning) return;
    playSword('charged');
    const h = game.hero;
    const startDir = Number.isFinite(h.dir) ? h.dir : 0;
    const start = performance.now();
    spinning = true;
    h.spinAttack = true;

    function frame(){
      if(!validGame()){
        h.spinAttack = false;
        spinning = false;
        return;
      }
      const now = performance.now();
      const t = Math.min(1, (now - start) / SPIN_DURATION);
      h.dir = startDir + (Math.PI * 2 * t);
      h.spinDir = h.dir;
      h.swing = .17;
      h._swingSafetyStart = now;

      for(const e of game.enemies || []){
        if(!e || e.dead) continue;
        if(e._spinHitUntil && e._spinHitUntil > now) continue;
        const d = Math.hypot(e.x - h.x, e.y - h.y);
        if(d <= SPIN_RANGE){
          try { if(typeof damageEnemy === 'function') damageEnemy(e, SPIN_DAMAGE, 'sword'); } catch(err){}
          e._spinHitUntil = now + 90;
        }
      }

      if(t < 1){
        requestAnimationFrame(frame);
      }else{
        h.dir = startDir;
        h.spinDir = startDir;
        h.swing = 0;
        h.spinAttack = false;
        spinning = false;
      }
    }
    try { if(typeof burst === 'function') burst(h.x,h.y,'#ffd483',22); } catch(e){}
    requestAnimationFrame(frame);
  }

  window.__undeadSingleSpinAttackV2 = doSpinAttack;

  function cancel(){ if(active && active.timer) clearTimeout(active.timer); active = null; }

  function bind(){
    const btn = document.getElementById('sword');
    if(!btn || btn.dataset.integratedSpinV2Bound === '1') return;
    btn.dataset.integratedSpinV2Bound = '1';

    btn.addEventListener('pointerdown', function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(!validGame()) return;
      try { btn.setPointerCapture(e.pointerId); } catch(err){}
      cancel();
      const st = {pointerId:e.pointerId, fired:false, timer:null};
      st.timer = setTimeout(function(){
        if(!active || active !== st || st.fired) return;
        st.fired = true;
        doSpinAttack();
      }, HOLD_MS);
      active = st;
    }, true);

    function finish(e){
      if(e){ e.preventDefault(); e.stopImmediatePropagation(); }
      const st = active;
      if(!st) return;
      if(st.timer) clearTimeout(st.timer);
      active = null;
      if(!validGame()) return;
      if(!st.fired) doNormalSword();
    }

    btn.addEventListener('pointerup', finish, true);
    btn.addEventListener('pointercancel', function(e){ cancel(); if(e){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    btn.addEventListener('lostpointercapture', cancel, true);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true}); else bind();
  setTimeout(bind, 300);
})();
