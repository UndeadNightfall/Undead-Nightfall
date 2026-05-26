// source: begin-hunt-image-button
(function(){
  function bind(){
    var b = document.getElementById('begin');
    if(!b || b.dataset.beginImageBound==='1') return;
    b.dataset.beginImageBound='1';

    var normal = b.getAttribute('data-normal-bg');
    var pressed = b.getAttribute('data-pressed-bg');

    function showNormal(){ if(normal) b.style.setProperty('background-image','url('+normal+')','important'); }
    function showPressed(){ if(pressed) b.style.setProperty('background-image','url('+pressed+')','important'); }

    showNormal();
    b.addEventListener('pointerdown', showPressed);
    b.addEventListener('pointerup', showNormal);
    b.addEventListener('pointercancel', showNormal);
    b.addEventListener('pointerleave', showNormal);
  }
  document.addEventListener('DOMContentLoaded', bind);
  setTimeout(bind, 300);
})();
