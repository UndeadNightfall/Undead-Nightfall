// source: boot-splash-layout-wait-patch
(function(){
  'use strict';

  document.documentElement.classList.add('booting');

  function runLayoutSyncs(){
    try { if (window.__undeadSyncGameActiveClass) window.__undeadSyncGameActiveClass(); } catch(e) {}
    try { if (window.__undeadApplyTitleControlState) window.__undeadApplyTitleControlState(); } catch(e) {}
    try { if (window.__undeadSyncOverlayUiState) window.__undeadSyncOverlayUiState(); } catch(e) {}
    try { if (window.__undeadRestorePauseButton) window.__undeadRestorePauseButton(); } catch(e) {}
    try { if (window.__undeadRestoreIngameMusicButton) window.__undeadRestoreIngameMusicButton(); } catch(e) {}
    try { if (window.__undeadApplyGlobalAudioMute) window.__undeadApplyGlobalAudioMute(); } catch(e) {}
  }

  function finishBoot(){
    runLayoutSyncs();

    var splash = document.getElementById('bootLayoutSplash');
    document.documentElement.classList.remove('booting');

    if (splash) {
      splash.classList.add('hide');
      setTimeout(function(){
        try { splash.remove(); } catch(e) {}
      }, 520);
    }
  }

  function scheduleFinish(){
    // Give mobile Safari/Chrome time to settle orientation, safe areas, font rendering, and CSS overrides.
    setTimeout(runLayoutSyncs, 100);
    setTimeout(runLayoutSyncs, 350);
    setTimeout(finishBoot, 1250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleFinish, {once:true});
  } else {
    scheduleFinish();
  }

  window.addEventListener('load', function(){
    setTimeout(runLayoutSyncs, 80);
  }, {once:true});
})();
