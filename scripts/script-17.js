// source: extras-submenu-toggle-script
(function(){
  var extrasMode = false;

  function setBg(button, pressed){
    if(!button) return;
    var normal = button.getAttribute('data-normal-bg');
    var down = button.getAttribute('data-pressed-bg');
    if(normal && down){
      button.style.setProperty('background-image', 'url(' + (pressed ? down : normal) + ')', 'important');
    }
  }

  function showButton(id, show){
    var b = document.getElementById(id);
    if(!b) return;
    b.style.setProperty('display', show ? '' : 'none', 'important');
  }

  function setExtrasMode(on){
    extrasMode = !!on;

    // Main title options
    showButton('begin', !extrasMode);
    showButton('muteTitle', !extrasMode);
    showButton('usernameBtn', !extrasMode);

    // Extras submenu options
    showButton('showInstructions', extrasMode);
    showButton('showControls', extrasMode);
    showButton('leaderboardBtn', extrasMode);

    // Extras stays visible and pressed while submenu is open
    showButton('extrasBtn', true);
    setBg(document.getElementById('extrasBtn'), extrasMode);
  }

  function bindExtrasButton(){
    var b = document.getElementById('extrasBtn');
    if(!b || b.dataset.extrasSubmenuBound === '1') return;
    b.dataset.extrasSubmenuBound = '1';

    // Remove old overlay-opening inline click handler by intercepting first.
    b.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopImmediatePropagation();
      setExtrasMode(!extrasMode);
      return false;
    }, true);

    b.addEventListener('pointerdown', function(){
      setBg(b, true);
    });

    b.addEventListener('pointerup', function(){
      setBg(b, extrasMode);
    });
  }

  function bindMomentary(id){
    var b = document.getElementById(id);
    if(!b || b.dataset.extrasMomentaryBound === '1') return;
    b.dataset.extrasMomentaryBound = '1';

    b.addEventListener('pointerdown', function(){
      setBg(b, true);
    });

    function reset(){
      setBg(b, false);
    }

    b.addEventListener('pointerup', function(){
      // Keep pressed very briefly so the state is visible.
      setTimeout(reset, 120);
    });

    b.addEventListener('click', function(){
      // Some browsers skip pointerup if dialogs open immediately.
      setTimeout(reset, 120);
    });

    b.addEventListener('pointercancel', reset);
    b.addEventListener('pointerleave', function(){
      setTimeout(reset, 120);
    });
  }

  function bindMusic(){
    var b = document.getElementById('muteTitle');
    if(!b || b.dataset.extrasMusicBound === '1') return;
    b.dataset.extrasMusicBound = '1';
    function sync(){
      var txt = (b.textContent || '').toLowerCase();
      var off = txt.includes('off') || txt.includes('muted');
      setBg(b, off);
    }
    sync();
    b.addEventListener('click', function(){ setTimeout(sync, 80); });
    setInterval(sync, 500);
  }

  function bindUsername(){
    var b = document.getElementById('usernameBtn');
    if(!b || b.dataset.extrasUsernameBound === '1') return;
    b.dataset.extrasUsernameBound = '1';
    function force(){ if(b.textContent !== 'Username') b.textContent = 'Username'; }
    function sync(){
      var p = document.getElementById('usernamePanel');
      var open = p && !(p.hidden || getComputedStyle(p).display === 'none');
      setBg(b, open);
      force();
    }
    b.addEventListener('pointerdown', function(){ setBg(b, true); });
    b.addEventListener('pointerup', sync);
    setInterval(sync, 250);
  }

  function init(){
    bindExtrasButton();
    bindMomentary('begin');
    bindMusic();
    bindUsername();
    bindMomentary('showInstructions');
    bindMomentary('showControls');
    bindMomentary('leaderboardBtn');
    setExtrasMode(false);
  }

  document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 300);
})();
