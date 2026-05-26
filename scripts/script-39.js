// source: charged-spell-system-v2-fixed-longpress
(function(){
  'use strict';

  // Reliable long-press spell handling:
  // - quick tap = normal spell
  // - hold = charged/big spell fires automatically after HOLD_MS
  // - capture + stopImmediatePropagation prevents the older pointerdown spell handler
  //   from consuming the tap before the charged handler can decide what to cast.
  const HOLD_MS = 320;
  const active = { fire:null, bolt:null };

  function validGame(){
    try { return typeof game !== 'undefined' && game && game.hero && !game.over && !game.paused; }
    catch(e){ return false; }
  }
  function h(){ return game.hero; }
  function spellCostSafe(base){ try { return typeof spellCost === 'function' ? spellCost(base) : base; } catch(e){ return base; } }
  function canSpend(cost){ const hero=h(); return hero.boosts.god > 0 || hero.mp >= cost; }
  function spend(cost){ const hero=h(); if(hero.boosts.god <= 0) hero.mp = Math.max(0, hero.mp - cost); }
  function failTone(){ try { if(typeof tone === 'function') tone(95,.08,'triangle',.03); } catch(e){} }

  function normalFireball(){
    try { if(window.__undeadFireballAudioDirect) window.__undeadFireballAudioDirect(false); } catch(e){}
    try { if(typeof fireball === 'function') fireball(); } catch(e){}
  }
  function normalLightning(){
    try { if(window.__undeadSpellAudio) window.__undeadSpellAudio('lightning', false); } catch(e){}
    try { if(typeof lightning === 'function') lightning(); } catch(e){}
  }

  function chargedFireball(){
    if(!validGame()) return;
    const hero=h();
    const cost = spellCostSafe(16);
    if(!canSpend(cost)){ failTone(); return; }
    spend(cost);
    try { if(window.__undeadFireballAudioDirect) window.__undeadFireballAudioDirect(true); } catch(e){}
    game.fireCasts = (game.fireCasts || 0) + 1;
    const a = Number.isFinite(hero.dir) ? hero.dir : 0;
    game.balls.push({
      x: hero.x + Math.cos(a) * 38,
      y: hero.y + Math.sin(a) * 38,
      vx: Math.cos(a) * 430,
      vy: Math.sin(a) * 430,
      life: 1.65,
      r: 22,
      charged: true,
      aoe: 100,
      damage: 132,
      pierceDamage: 56,
      color: '#ff9b2f'
    });
    try { if(typeof burst === 'function') burst(hero.x,hero.y,'#ffb04a',32); } catch(e){}
    try { if(typeof hud === 'function') hud(); } catch(e){}
  }

  function chargedLightning(){
    if(!validGame()) return;
    const hero=h();
    const cost = spellCostSafe(48);
    if(!canSpend(cost)){ failTone(); return; }
    spend(cost);
    try { if(window.__undeadSpellAudio) window.__undeadSpellAudio('lightning', true); } catch(e){}
    game.boltCasts = (game.boltCasts || 0) + 1;
    let sx = hero.x, sy = hero.y;
    const targets = (game.enemies || [])
      .map(e => ({ e, d: Math.hypot(e.x - hero.x, e.y - hero.y) }))
      .filter(o => o.e && !o.e.dead && o.d < 440)
      .sort((a,b) => a.d - b.d)
      .slice(0, 16);
    for(const o of targets){
      game.bolts.push({x1:sx,y1:sy,x2:o.e.x,y2:o.e.y,life:.28,charged:true});
      try { if(typeof damageEnemy === 'function') damageEnemy(o.e, 82, 'bolt'); } catch(e){}
      sx = o.e.x; sy = o.e.y;
    }
    try { if(typeof burst === 'function') burst(hero.x,hero.y,'#bff3ff',38); } catch(e){}
    try { if(typeof hud === 'function') hud(); } catch(e){}
  }

  function chargedFireballWatcher(){
    if(!validGame() || !game.balls || !game.enemies) return;
    for(const b of game.balls){
      if(!b || !b.charged || b.life <= 0) continue;
      for(const e of game.enemies){
        if(!e || e.dead) continue;
        const d = Math.hypot(e.x - b.x, e.y - b.y);
        if(d < e.r + b.r){
          if(!e._chargedFireHitUntil || e._chargedFireHitUntil < performance.now()){
            e._chargedFireHitUntil = performance.now() + 180;
            try { game._lastImpactX = b.x; game._lastImpactY = b.y; if(typeof damageEnemy === 'function') damageEnemy(e, b.pierceDamage || 56, 'fire'); } catch(err){}
          }
        }
      }
      if(b.life <= 0.06 && !b._chargedExploded){
        b._chargedExploded = true;
        try { if(typeof burst === 'function') burst(b.x,b.y,'#ff8a22',56); } catch(err){}
        for(const target of game.enemies){
          if(!target || target.dead) continue;
          const td = Math.hypot(target.x - b.x, target.y - b.y);
          if(td <= (b.aoe || 100)){
            try { game._lastImpactX = b.x; game._lastImpactY = b.y; if(typeof damageEnemy === 'function') damageEnemy(target, b.damage || 132, 'fire'); } catch(err){}
          }
        }
      }
    }
  }

  function cancel(type){
    const st = active[type];
    if(st && st.timer) clearTimeout(st.timer);
    active[type] = null;
  }

  function bindButton(id, type){
    const btn = document.getElementById(id);
    if(!btn || btn.dataset.chargedSpellV2Bound === '1') return;
    btn.dataset.chargedSpellV2Bound = '1';

    btn.addEventListener('pointerdown', function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(!validGame()) return;
      try { btn.setPointerCapture(e.pointerId); } catch(err){}
      cancel(type);
      const st = { pointerId:e.pointerId, fired:false, started:performance.now(), timer:null };
      st.timer = setTimeout(function(){
        if(!active[type] || active[type] !== st || st.fired) return;
        st.fired = true;
        if(type === 'fire') chargedFireball(); else chargedLightning();
      }, HOLD_MS);
      active[type] = st;
    }, true);

    function finish(e){
      if(e){ e.preventDefault(); e.stopImmediatePropagation(); }
      const st = active[type];
      if(!st) return;
      if(st.timer) clearTimeout(st.timer);
      active[type] = null;
      if(!validGame()) return;
      if(!st.fired){
        if(type === 'fire') normalFireball(); else normalLightning();
      }
    }

    btn.addEventListener('pointerup', finish, true);
    btn.addEventListener('pointercancel', function(e){ cancel(type); if(e){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    btn.addEventListener('lostpointercapture', function(){ cancel(type); }, true);
  }

  function bind(){ bindButton('fire','fire'); bindButton('bolt','bolt'); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true}); else bind();
  setTimeout(bind, 300);
  setInterval(chargedFireballWatcher, 16);
  window.__undeadChargedFireball = chargedFireball;
  window.__undeadChargedLightning = chargedLightning;
})();
