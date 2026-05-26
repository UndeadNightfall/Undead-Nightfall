// source: leaderboard-inline-image
(function(){
  function bind(){
    var b=document.getElementById('leaderboardBtn');
    if(!b || b.dataset.imageBound==='1') return;
    b.dataset.imageBound='1';
    var normal=b.getAttribute('data-normal-bg');
    var pressed=b.getAttribute('data-pressed-bg');
    function setNormal(){
      if(normal) b.style.setProperty('background-image','url('+normal+')','important');
      b.dataset.stayPressed='0';
    }
    function setPressed(){
      if(pressed) b.style.setProperty('background-image','url('+pressed+')','important');
      b.dataset.stayPressed='1';
    }
    setNormal();
    ['pointerdown','touchstart','mousedown','click'].forEach(function(evt){
      b.addEventListener(evt, function(){ setPressed(); }, {passive:true});
    });
    setInterval(function(){
      var panel=document.getElementById('leaderboardPanel');
      if(!panel) return;
      var hidden = panel.hidden || getComputedStyle(panel).display === 'none';
      if(hidden && b.dataset.stayPressed==='1') setNormal();
    },300);
  }
  document.addEventListener('DOMContentLoaded', bind);
  setTimeout(bind,250);
})();
