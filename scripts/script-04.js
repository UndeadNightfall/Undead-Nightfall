// source: inline block 4
(function(){
  function safeSwordMaintenance(){
    try{
      if(!window.game || !game.hero) return;
      var h = game.hero;
      if(!Number.isFinite(h.dir)) h.dir = 0;
      if(!Number.isFinite(h.swing) || h.swing < 0 || h.swing > 0.25) h.swing = 0;
      if(h.boosts && h.boosts.berserk <= 0 && h.swing < 0.002) h.swing = 0;
      if(h.boosts && h.boosts.berserk <= 0 && Number.isFinite(h.dir)){
        h.spinDir = h.dir;
      }
    }catch(e){}
    requestAnimationFrame(safeSwordMaintenance);
  }
  requestAnimationFrame(safeSwordMaintenance);
})();
