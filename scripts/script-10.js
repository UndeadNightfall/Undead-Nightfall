// source: inline block 10
(function(){
  const overlayButtons = {
    instructions: "showInstructions",
    controlsPanel: "showControls",
    leaderboard: "leaderboardBtn",
    usernamePanel: "usernameBtn"
  };

  const openLabels = {
    instructions: "Hide Instructions",
    controlsPanel: "Hide Controls",
    leaderboard: "Hide Leaderboard",
    usernamePanel: "Hide Username"
  };

  const closedLabels = {
    instructions: "Instructions",
    controlsPanel: "Controls",
    leaderboard: "Leaderboard",
    usernamePanel: "Username"
  };

  function panelFor(id) {
    if (id === "leaderboard") return document.getElementById("leaderboardPanel");
    return document.getElementById(id);
  }

  function panelOpen(id) {
    const panel = panelFor(id);
    if (!panel) return false;
    const cs = window.getComputedStyle(panel);
    return panel.dataset.overlayOpen === "true" ||
           panel.classList.contains("show") ||
           panel.classList.contains("forceOpen") ||
           cs.display !== "none";
  }

  function setButton(id, open) {
    const btn = document.getElementById(overlayButtons[id]);
    if (btn) btn.textContent = open ? openLabels[id] : closedLabels[id];
  }

  function closePanel(id) {
    const panel = panelFor(id);
    if (!panel) return;
    panel.dataset.overlayOpen = "false";
    panel.classList.remove("show", "forceOpen", "open");
    panel.style.display = "none";
    panel.style.visibility = "hidden";
    panel.style.opacity = "0";
    panel.style.pointerEvents = "none";
    setButton(id, false);
  }

  function closeAll() {
    Object.keys(overlayButtons).forEach(closePanel);
  }

  function openPanel(id) {
    closeAll();

    if (id === "leaderboard") {
      try { if (typeof showLeaderboard === "function") showLeaderboard(); } catch(e) {}
      setTimeout(function(){
        const panel = panelFor("leaderboard");
        if (panel) {
          panel.dataset.overlayOpen = "true";
          panel.classList.add("show");
          panel.style.display = "block";
          panel.style.visibility = "visible";
          panel.style.opacity = "1";
          panel.style.pointerEvents = "auto";
          setButton("leaderboard", true);
        }
      }, 50);
      return;
    }

    const panel = panelFor(id);
    if (panel) {
      panel.dataset.overlayOpen = "true";
      panel.classList.add("show");
      if (id === "usernamePanel") panel.classList.add("forceOpen");
      panel.style.display = "block";
      panel.style.visibility = "visible";
      panel.style.opacity = "1";
      panel.style.pointerEvents = "auto";
    }

    if (id === "controlsPanel") {
      try { if (typeof updateControlButtons === "function") updateControlButtons(); } catch(e) {}
    }

    if (id === "usernamePanel") {
      const display = document.getElementById("usernameDisplay");
      if (display) {
        const saved = localStorage.getItem("undead_player_name") || "PLAYER";
        display.textContent = saved.toUpperCase();
      }
    }

    setButton(id, true);
  }

  window.titleOverlayToggle = function(e, id) {
    if (e) {
      try { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } catch(err) {}
    }

    if (panelOpen(id)) {
      closePanel(id);
      return false;
    }

    openPanel(id);
    return false;
  };

  function bindOverlayButton(buttonId, panelId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.onclick = function(e){ return window.titleOverlayToggle(e, panelId); };

    ["pointerdown", "touchstart"].forEach(function(evt){
      btn.addEventListener(evt, function(e){
        // Stop old capture/bubble handlers from also toggling these two panels back open.
        if (buttonId === "showInstructions" || buttonId === "showControls") {
          try { e.stopPropagation(); } catch(err) {}
        }
      }, true);
    });
  }

  window.addEventListener("load", function(){
    bindOverlayButton("showInstructions", "instructions");
    bindOverlayButton("showControls", "controlsPanel");
    bindOverlayButton("leaderboardBtn", "leaderboard");
    bindOverlayButton("usernameBtn", "usernamePanel");
  });
})();
