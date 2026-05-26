// source: instructions-pressed-visual-fix
(function(){
  function bind(){
    var b = document.getElementById('showInstructions');
    if(!b || b.dataset.instructionsPressedVisualFix === '1') return;
    b.dataset.instructionsPressedVisualFix = '1';

    var normal = b.getAttribute('data-normal-bg');
    var pressed = b.getAttribute('data-pressed-bg');

    function press(){
      if(pressed) b.style.setProperty('background-image', 'url(' + pressed + ')', 'important');
      b.style.setProperty('filter', 'brightness(0.72) contrast(1.08)', 'important');
      b.style.setProperty('transform', 'translateY(2px)', 'important');
    }

    function release(){
      if(normal) b.style.setProperty('background-image', 'url(' + normal + ')', 'important');
      b.style.removeProperty('filter');
      b.style.removeProperty('transform');
    }

    b.addEventListener('pointerdown', press, {capture:true});
    b.addEventListener('mousedown', press, {capture:true});
    b.addEventListener('touchstart', press, {capture:true, passive:true});

    b.addEventListener('pointerup', function(){ setTimeout(release, 160); }, {capture:true});
    b.addEventListener('mouseup', function(){ setTimeout(release, 160); }, {capture:true});
    b.addEventListener('click', function(){ setTimeout(release, 160); }, {capture:true});
    b.addEventListener('pointercancel', release, {capture:true});
    b.addEventListener('pointerleave', function(){ setTimeout(release, 160); }, {capture:true});
  }

  document.addEventListener('DOMContentLoaded', bind);
  setTimeout(bind, 300);
})();
