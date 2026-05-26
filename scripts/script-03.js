// source: inline block 3
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" }).catch(function(err){
      console.log("Service worker registration failed", err);
    });
  });
}
