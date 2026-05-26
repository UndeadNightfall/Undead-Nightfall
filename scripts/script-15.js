// source: extras-menu-script
(function(){
  function bindImageButton(btn){
    if(!btn) return;
    var normal = btn.getAttribute('data-normal-bg');
    var pressed = btn.getAttribute('data-pressed-bg');
    function set(bg){ if(bg) btn.style.setProperty('background-image','url('+bg+')','important');}
    set(normal);
    btn.addEventListener('pointerdown', ()=>set(pressed));
  }
  function bind(){
    var btn = document.getElementById('extrasBtn');
    var panel = document.getElementById('extrasPanel');
    if(!btn || !panel || btn.dataset.bound==='1') return;
    btn.dataset.bound='1';
    bindImageButton(btn);
    btn.addEventListener('click', ()=> {
      panel.style.display='flex';
      if(btn.getAttribute('data-pressed-bg')){
        btn.style.setProperty('background-image','url('+btn.getAttribute('data-pressed-bg')+')','important');
      }
    });
    document.getElementById('extrasCloseBtn').addEventListener('click', ()=>{
      panel.style.display='none';
      if(btn.getAttribute('data-normal-bg')){
        btn.style.setProperty('background-image','url('+btn.getAttribute('data-normal-bg')+')','important');
      }
    });
    document.getElementById('extrasInstructionsBtn').addEventListener('click', ()=>document.getElementById('showInstructions')?.click());
    document.getElementById('extrasControlsBtn').addEventListener('click', ()=>document.getElementById('showControls')?.click());
    document.getElementById('extrasLeaderboardBtn').addEventListener('click', ()=>document.getElementById('leaderboardBtn')?.click());
  }
  document.addEventListener('DOMContentLoaded', bind);
  setTimeout(bind, 300);
})();
