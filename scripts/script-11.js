// source: inline block 11
(function(){
  var CAMPFIRE_SRC = "./assets/CAMPFIRE_SRC.mp3";
  var campfireAudio = null;

  function getMuted(){
    try {
      return (localStorage.getItem("undeadNightfallSoundMuted") || localStorage.getItem("undeadNightfallMusicMuted")) === "1";
    } catch(e) {
      return false;
    }
  }

  function makeCampfire(){
    if (!campfireAudio) {
      campfireAudio = new Audio();
      campfireAudio.id = "campfireAmbience";
      campfireAudio.src = CAMPFIRE_SRC;
      campfireAudio.loop = true;
      campfireAudio.volume = 1.0; /* level now set by the loudness-normalized file (~-27 LUFS ambience) */
      campfireAudio.preload = "auto";
      campfireAudio.setAttribute("playsinline", "true");
      window.__undeadCampfireAudio = campfireAudio;
    }
    return campfireAudio;
  }

  function playCampfire(){
    try {
      var start = document.getElementById("start");
      var titleVisible = start && getComputedStyle(start).display !== "none";
      var a = makeCampfire();
      if (!titleVisible || getMuted()) {
        a.pause();
        return;
      }
      a.muted = false;
      var p = a.play();
      if (p && p.catch) p.catch(function(err){ console.log("Campfire play blocked:", err && err.message ? err.message : err); });
    } catch(e) {
      console.log("Campfire failed:", e && e.message ? e.message : e);
    }
  }

  function syncCampfire(){
    try {
      var a = makeCampfire();
      if (getMuted()) {
        a.pause();
      } else {
        playCampfire();
      }
    } catch(e) {}
  }

  window.startCampfireAmbience = playCampfire;
  window.syncCampfireAmbience = syncCampfire;

  document.addEventListener("DOMContentLoaded", function(){
    makeCampfire();
    setTimeout(playCampfire, 250);
  });

  ["pointerdown","touchstart","mousedown","click","keydown"].forEach(function(evt){
    window.addEventListener(evt, playCampfire, {passive:true});
  });
})();
