// source: leaderboard-submit-safe-fallback-patch
(function(){
  'use strict';

  function bindEndWatcher(){
    const end = document.getElementById("end");
    if (!end) return;
    let submitted = false;
    setInterval(function(){
      try {
        const visible = getComputedStyle(end).display !== "none";
        if (visible && !submitted) {
          submitted = true;
          setTimeout(function(){
            try {
              if (typeof submitLeaderboardScore === "function") submitLeaderboardScore();
            } catch(e) {
              console.warn("Safe leaderboard submit error", e);
            }
          }, 300);
        }
        if (!visible) submitted = false;
      } catch(e) {}
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEndWatcher, {once:true});
  } else {
    bindEndWatcher();
  }
})();
