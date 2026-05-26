// source: pwa-update-controller
(function(){
  if (!('serviceWorker' in navigator)) return;

  var refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', function(){
    navigator.serviceWorker.register('service-worker.js').then(function(reg){
      function listenForInstalling(worker){
        if (!worker) return;
        worker.addEventListener('statechange', function(){
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            // Ask the new service worker to activate immediately.
            worker.postMessage({type: 'SKIP_WAITING'});
          }
        });
      }

      if (reg.waiting) {
        reg.waiting.postMessage({type: 'SKIP_WAITING'});
      }

      listenForInstalling(reg.installing);

      reg.addEventListener('updatefound', function(){
        listenForInstalling(reg.installing);
      });

      // Check for updates shortly after app load.
      setTimeout(function(){
        if (reg.update) reg.update();
      }, 1000);
    }).catch(function(){});
  });
})();
