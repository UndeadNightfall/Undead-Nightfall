// source: sound-toggle-text-runtime-patch
(function(){
  'use strict';

  function replaceMusicWords(text){
    return String(text)
      .replace(/Music:\s*On/g, 'Music: On')
      .replace(/Music:\s*Off/g, 'Music: Off')
      .replace(/Music\s+On/g, 'Music On')
      .replace(/Music\s+Off/g, 'Music Off')
      .replace(/MUSIC:\s*ON/g, 'SOUND: ON')
      .replace(/MUSIC:\s*OFF/g, 'SOUND: OFF')
      .replace(/MUSIC\s+ON/g, 'MUSIC ON')
      .replace(/MUSIC\s+OFF/g, 'MUSIC OFF');
  }

  function alignButton(el){
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.textAlign = 'center';
    el.style.lineHeight = '1.1';
    el.style.whiteSpace = 'nowrap';
    el.style.boxSizing = 'border-box';
  }

  function fixSoundToggleText(root){
    try {
      const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(n => {
        const after = replaceMusicWords(n.nodeValue);
        if (after !== n.nodeValue) n.nodeValue = after;
      });

      document.querySelectorAll('button, .button, [role="button"], #musicToggle, #soundToggle, .music-toggle, .sound-toggle').forEach(el => {
        const t = (el.textContent || '').trim();
        if (/sound\s*:?\s*(on|off)/i.test(t) || /music\s*:?\s*(on|off)/i.test(t)) {
          alignButton(el);
          const fixed = replaceMusicWords(el.textContent);
          if (fixed !== el.textContent) el.textContent = fixed;
        }
      });
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ fixSoundToggleText(document.body); }, {once:true});
  } else {
    fixSoundToggleText(document.body);
  }

  let queued = false;
  const obs = new MutationObserver(function(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(function(){
      queued = false;
      fixSoundToggleText(document.body);
    });
  });
  try { obs.observe(document.documentElement, {childList:true, subtree:true, characterData:true}); } catch(e) {}
})();
