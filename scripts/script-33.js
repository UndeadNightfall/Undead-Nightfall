// source: return-menu-force-bind-patch
(function(){
  function bind(){
    const btn=document.getElementById('returnMenuBtn');
    if(!btn || btn.dataset.bound==='1') return;
    btn.dataset.bound='1';
    btn.onclick=function(){
      const end=document.getElementById('end');
      const start=document.getElementById('start');
      if(end) end.style.display='none';
      if(start) start.style.display='grid';
      document.body.classList.remove('game-active');
    };
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',bind,{once:true});
  } else bind();
  setTimeout(bind,500);
})();
